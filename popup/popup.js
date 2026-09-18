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
 * Render countdown list from cached data (called every second by interval)
 */
function renderCountdownTick() {
  if (!countdownCache.length) {
    countdownListEl.innerHTML = '<div class="countdown-empty">未固定タブがありません</div>';
    return;
  }

  const now = Date.now();
  const fragment = document.createDocumentFragment();

  for (const entry of countdownCache) {
    const { tab, closeAt } = entry;

    const item = document.createElement('div');
    item.className = 'countdown-item';

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

    // Badge: remaining time
    const badge = document.createElement('span');
    badge.className = 'countdown-badge';

    if (tab.pinned) {
      badge.classList.add('time-pinned');
      badge.textContent = '📌';
      badge.title = '固定タブ（保護中）';
    } else if (tab.audible) {
      badge.classList.add('time-pinned');
      badge.textContent = '🔊';
      badge.title = '音声再生中（保護中）';
    } else {
      const remaining = Math.max(0, closeAt - now);

      const candleImg = document.createElement('img');
      candleImg.src = '../icons/candle.svg';
      candleImg.className = 'badge-candle-icon';
      candleImg.alt = '🕯';

      const timeText = document.createElement('span');

      if (remaining <= 0) {
        badge.classList.add('time-caution');
        timeText.textContent = '閉じています...';
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
    }

    item.addEventListener('click', async () => {
      try {
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      } catch (e) {}
    });

    item.appendChild(infoDiv);
    item.appendChild(badge);
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
      let startMs = tabTimestamps[tabKey] || tabTimestamps[tab.id];
      if (!startMs) {
        startMs = now;
        tabTimestamps[tabKey] = now;
        missingData = true;
      }

      let closeAt = tabCloseTimes[tabKey] || tabCloseTimes[tab.id];
      if (!closeAt) {
        closeAt = startMs + (DEFAULT_AUTO_CLOSE_MINUTES * 60 * 1000);
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

// Initial setup
initVersion();
refreshCountdown();
startCountdownTicker();
