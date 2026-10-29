// tabCandle - Popup Logic
// Manifest V3 Compliant

const DEFAULT_AUTO_CLOSE_MINUTES = 240;

// DOM Elements
const countdownListEl = document.getElementById('countdownList');
const versionBadgeEl = document.getElementById('versionBadge');

let countdownIntervalId = null;

// Cache of { tabId -> { tab, remainingMs } } for the ticker
let countdownCache = [];

/**
 * Format milliseconds into a human-readable countdown string
 */
function formatCountdown(ms) {
  if (ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Helper to fetch localized string from chrome.i18n
 */
function getI18n(key, fallback = '') {
  return chrome.i18n?.getMessage?.(key) || fallback;
}

/**
 * Render countdown list from cached data (called every second by interval)
 */
function renderCountdownTick() {
  if (!countdownCache.length) {
    const emptyText = getI18n('emptyTabs', 'No unpinned tabs found');
    countdownListEl.innerHTML = `<div class="countdown-empty">${emptyText}</div>`;
    return;
  }

  const now = Date.now();
  const existingItems = countdownListEl.querySelectorAll('.countdown-item');
  const cacheIds = countdownCache.map(entry => entry.tab.id).join(',');
  const domIds = Array.from(existingItems).map(el => el.dataset.tabId).join(',');

  // If DOM structure matches current cache, update timers in-place without rebuilding DOM
  if (domIds && domIds === cacheIds) {
    existingItems.forEach((item, index) => {
      const entry = countdownCache[index];
      const { tab, closeAt } = entry;
      if (tab.pinned || tab.audible) return;

      const timeTextEl = item.querySelector('.badge-time-text');
      const badge = item.querySelector('.countdown-badge');
      if (!timeTextEl || !badge) return;

      const remaining = Math.max(0, closeAt - now);
      if (remaining <= 0) {
        badge.className = 'countdown-badge time-caution';
        timeTextEl.textContent = getI18n('closing', 'Closing...');
      } else if (remaining <= 180000) {
        badge.className = 'countdown-badge time-caution';
        timeTextEl.textContent = formatCountdown(remaining);
      } else {
        badge.className = 'countdown-badge time-safe';
        timeTextEl.textContent = formatCountdown(remaining);
      }
    });
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const entry of countdownCache) {
    const { tab, closeAt } = entry;

    const item = document.createElement('div');
    item.className = 'countdown-item';
    item.dataset.tabId = String(tab.id);

    // Tab info area
    const infoDiv = document.createElement('div');
    infoDiv.className = 'countdown-tab-info';

    // Favicon
    if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
      const img = document.createElement('img');
      img.className = 'countdown-favicon';
      img.src = tab.favIconUrl;
      img.onerror = () => { img.replaceWith(makeFaviconPlaceholder()); };
      infoDiv.appendChild(img);
    } else {
      infoDiv.appendChild(makeFaviconPlaceholder());
    }

    // Title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'countdown-title';
    titleSpan.textContent = tab.title || tab.url || 'Untitled';
    titleSpan.title = tab.title || '';
    infoDiv.appendChild(titleSpan);

    // Actions area
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'countdown-actions';

    // Badge: remaining time or protected state
    const badge = document.createElement('span');
    badge.className = 'countdown-badge';

    if (tab.pinned) {
      badge.classList.add('time-pinned');
      badge.textContent = '📌';
      badge.title = getI18n('unpinTabAction', 'Unpin tab');
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const currentTime = Date.now();
          const tabKey = String(tab.id);
          const {
            tabTimestamps = {},
            tabCloseTimes = {},
            autoCloseMinutes = DEFAULT_AUTO_CLOSE_MINUTES
          } = await chrome.storage.local.get([
            'tabTimestamps',
            'tabCloseTimes',
            'autoCloseMinutes'
          ]);
          const minutes = Number(autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES;
          const closeAt = currentTime + (minutes * 60 * 1000);
          tabTimestamps[tabKey] = currentTime;
          tabCloseTimes[tabKey] = closeAt;
          delete tabTimestamps[tab.id];
          delete tabCloseTimes[tab.id];
          await chrome.storage.local.set({ tabTimestamps, tabCloseTimes });

          await chrome.tabs.update(tab.id, { pinned: false });
          tab.pinned = false;
          await refreshCountdown();
        } catch (err) {}
      });
      actionsDiv.appendChild(badge);
    } else if (tab.audible) {
      badge.classList.add('time-pinned');
      badge.textContent = '🔊';
      badge.title = getI18n('audioTooltip', 'Audio playing (Protected)');
      actionsDiv.appendChild(badge);
    } else {
      const remaining = Math.max(0, closeAt - now);

      const candleImg = document.createElement('img');
      candleImg.src = '../icons/candle.svg';
      candleImg.className = 'badge-candle-icon';
      candleImg.alt = '🕯';

      const timeText = document.createElement('span');
      timeText.className = 'badge-time-text';

      if (remaining <= 0) {
        badge.classList.add('time-caution');
        timeText.textContent = getI18n('closing', 'Closing...');
      } else if (remaining <= 180000) {
        // Less than 3 minutes
        badge.classList.add('time-caution');
        timeText.textContent = formatCountdown(remaining);
      } else {
        badge.classList.add('time-safe');
        timeText.textContent = formatCountdown(remaining);
      }

      badge.appendChild(candleImg);
      badge.appendChild(timeText);
      actionsDiv.appendChild(badge);

      // Pin button for countdown tab
      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'pin-btn';
      pinBtn.title = getI18n('pinTabAction', 'Pin tab (Protect)');
      pinBtn.setAttribute('aria-label', pinBtn.title);
      pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';

      pinBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const tabKey = String(tab.id);
          const { tabTimestamps = {}, tabCloseTimes = {} } = await chrome.storage.local.get([
            'tabTimestamps',
            'tabCloseTimes'
          ]);
          delete tabTimestamps[tab.id];
          delete tabTimestamps[tabKey];
          delete tabCloseTimes[tab.id];
          delete tabCloseTimes[tabKey];
          await chrome.storage.local.set({ tabTimestamps, tabCloseTimes });

          await chrome.tabs.update(tab.id, { pinned: true });
          tab.pinned = true;
          await refreshCountdown();
        } catch (err) {
          console.error('Failed to pin tab:', err);
        }
      });

      actionsDiv.appendChild(pinBtn);
    }

    item.addEventListener('click', async () => {
      try {
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      } catch (e) {}
    });

    item.appendChild(infoDiv);
    item.appendChild(actionsDiv);
    fragment.appendChild(item);
  }

  countdownListEl.innerHTML = '';
  countdownListEl.appendChild(fragment);
}

function makeFaviconPlaceholder() {
  const div = document.createElement('div');
  div.className = 'countdown-favicon-placeholder';
  div.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`;
  return div;
}

/**
 * Load countdown data from storage and build cache, then start ticker
 */
async function refreshCountdown() {
  try {
    const currentWindow = await chrome.windows.getCurrent();
    const tabs = await chrome.tabs.query({ windowId: currentWindow.id });

    const settings = await chrome.storage.local.get({
      autoCloseEnabled: true,
      autoCloseMinutes: DEFAULT_AUTO_CLOSE_MINUTES,
      tabTimestamps: {},
      tabCloseTimes: {}
    });

    const now = Date.now();
    let missingData = false;
    const tabTimestamps = { ...(settings.tabTimestamps || {}) };
    const tabCloseTimes = { ...(settings.tabCloseTimes || {}) };

    countdownCache = tabs.map(tab => {
      const tabKey = String(tab.id);

      // Pinned tabs: clear stored countdown data so they reset to full time when unpinned
      if (tab.pinned) {
        if (tabTimestamps[tabKey] || tabTimestamps[tab.id] || tabCloseTimes[tabKey] || tabCloseTimes[tab.id]) {
          delete tabTimestamps[tabKey];
          delete tabTimestamps[tab.id];
          delete tabCloseTimes[tabKey];
          delete tabCloseTimes[tab.id];
          missingData = true;
        }
        return {
          tab,
          startMs: now,
          closeAt: now
        };
      }

      let startMs = tabTimestamps[tabKey] || tabTimestamps[tab.id];
      if (!startMs) {
        startMs = now;
        tabTimestamps[tabKey] = now;
        missingData = true;
      }

      let closeAt = tabCloseTimes[tabKey] || tabCloseTimes[tab.id];
      if (!closeAt || closeAt <= now) {
        closeAt = startMs + ((Number(settings.autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES) * 60 * 1000);
        tabCloseTimes[tabKey] = closeAt;
        missingData = true;
      }

      return {
        tab,
        startMs,
        closeAt
      };
    });

    if (missingData) {
      await chrome.storage.local.set({ tabTimestamps, tabCloseTimes }).catch(() => {});
    }

    // Sort: protected (pinned/audible) last, then by remaining time ascending
    countdownCache.sort((a, b) => {
      const aProtected = a.tab.pinned || a.tab.audible;
      const bProtected = b.tab.pinned || b.tab.audible;
      if (aProtected && !bProtected) return 1;
      if (!aProtected && bProtected) return -1;
      if (aProtected && bProtected) return 0;
      return a.closeAt - b.closeAt;
    });

    renderCountdownTick();
  } catch (err) {
    console.error('Error loading countdown data:', err);
  }
}

/**
 * Start the 1-second ticker for countdowns
 */
function startCountdownTicker() {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(renderCountdownTick, 1000);
}

// Keep UI updated on tab changes
const onTabChange = async () => {
  await refreshCountdown();
};
if (chrome.tabs?.onCreated) chrome.tabs.onCreated.addListener(onTabChange);
if (chrome.tabs?.onRemoved) chrome.tabs.onRemoved.addListener(onTabChange);
if (chrome.tabs?.onUpdated) chrome.tabs.onUpdated.addListener(onTabChange);

/**
 * Set version badge dynamically from manifest
 */
function initVersion() {
  try {
    const manifest = chrome.runtime?.getManifest?.();
    if (manifest?.version && versionBadgeEl) {
      versionBadgeEl.textContent = `v${manifest.version}`;
    }
  } catch (e) {
    // Fallback to HTML text
  }
}

/**
 * Localize elements with data-i18n attributes
 */
function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = chrome.i18n?.getMessage?.(key);
    if (msg) el.textContent = msg;
  });
}

// Initial setup
initI18n();
initVersion();
refreshCountdown();
startCountdownTicker();
