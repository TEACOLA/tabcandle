// tabCandle - Background Service Worker
// Manifest V3 Compliant - Minimal Auto-Closer

const ALARM_PERIODIC_CHECK = 'tabAutoClosePeriodicCheck';
const DEFAULT_AUTO_CLOSE_MINUTES = 240; // Default 240 minutes (4 hours)

/**
 * Schedule alarm for a tab based on its absolute closeAt
 */
function scheduleTabCloseAlarm(tabId, closeAt) {
  if (!closeAt) return;
  chrome.alarms.clear(`close_${tabId}`);

  const now = Date.now();
  if (closeAt <= now) {
    closeTab(tabId);
  } else {
    chrome.alarms.create(`close_${tabId}`, { when: closeAt });
  }
}

/**
 * Safely close a single tab if not pinned and not audible
 */
async function closeTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) {
      await cleanupTabData(tabId);
      return;
    }

    // Safety guards: pinned tabs or audible tabs are never closed
    if (tab.pinned || tab.audible) return;

    console.log(`[tabCandle] Auto-closing tab ${tabId} (${tab.title || 'Untitled'})`);
    await cleanupTabData(tabId);
    await chrome.tabs.remove(tabId);
  } catch (err) {
    console.warn(`Error closing tab ${tabId}:`, err);
  }
}

/**
 * Clean up tab timestamps and closeTimes from storage
 */
async function cleanupTabData(tabId) {
  try {
    const { tabTimestamps = {}, tabCloseTimes = {} } = await chrome.storage.local.get([
      'tabTimestamps',
      'tabCloseTimes'
    ]);
    const tabKey = String(tabId);
    let changed = false;

    if (tabTimestamps[tabId] || tabTimestamps[tabKey]) {
      delete tabTimestamps[tabId];
      delete tabTimestamps[tabKey];
      changed = true;
    }
    if (tabCloseTimes[tabId] || tabCloseTimes[tabKey]) {
      delete tabCloseTimes[tabId];
      delete tabCloseTimes[tabKey];
      changed = true;
    }
    chrome.alarms.clear(`close_${tabId}`);

    if (changed) {
      await chrome.storage.local.set({ tabTimestamps, tabCloseTimes });
    }
  } catch (e) {
    console.warn('Failed to cleanup tab data:', e);
  }
}

/**
 * Re-evaluate alarms for all currently open unpinned tabs without modifying existing closeAt times
 */
async function recheckAllTabAlarms() {
  try {
    const settings = await chrome.storage.local.get({
      autoCloseMinutes: DEFAULT_AUTO_CLOSE_MINUTES,
      tabTimestamps: {},
      tabCloseTimes: {}
    });

    const now = Date.now();
    const tabs = await chrome.tabs.query({});
    const timestamps = { ...settings.tabTimestamps };
    const closeTimes = { ...(settings.tabCloseTimes || {}) };
    let storageChanged = false;
    const defaultMinutes = Number(settings.autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES;

    for (const tab of tabs) {
      if (tab.pinned) {
        chrome.alarms.clear(`close_${tab.id}`);
        continue;
      }

      const tabKey = String(tab.id);

      if (!timestamps[tabKey]) {
        timestamps[tabKey] = now;
        storageChanged = true;
      }

      if (!closeTimes[tabKey]) {
        const createdAt = timestamps[tabKey] || now;
        closeTimes[tabKey] = createdAt + (defaultMinutes * 60 * 1000);
        storageChanged = true;
      }

      scheduleTabCloseAlarm(tab.id, closeTimes[tabKey]);
    }

    if (storageChanged) {
      await chrome.storage.local.set({ tabTimestamps: timestamps, tabCloseTimes: closeTimes });
    }
  } catch (err) {
    console.error('Error rechecking tab alarms:', err);
  }
}

/**
 * Initialize default settings and alarms on extension install / startup / reload
 */
async function initializeExtension() {
  try {
    const current = await chrome.storage.local.get([
      'autoCloseMinutes',
      'tabTimestamps',
      'tabCloseTimes'
    ]);

    const now = Date.now();
    const existingTabs = await chrome.tabs.query({});
    const timestamps = current.tabTimestamps || {};
    const closeTimes = current.tabCloseTimes || {};
    const defaultMinutes = DEFAULT_AUTO_CLOSE_MINUTES;
    let storageChanged = false;

    for (const tab of existingTabs) {
      const tabKey = String(tab.id);
      if (!timestamps[tabKey]) {
        timestamps[tabKey] = now;
        storageChanged = true;
      }
      if (!closeTimes[tabKey]) {
        closeTimes[tabKey] = (timestamps[tabKey] || now) + (defaultMinutes * 60 * 1000);
        storageChanged = true;
      }
    }

    await chrome.storage.local.set({
      autoCloseMinutes: defaultMinutes,
      tabTimestamps: timestamps,
      tabCloseTimes: closeTimes
    });

    // Fallback periodic sweep (every 1 minute)
    chrome.alarms.create(ALARM_PERIODIC_CHECK, { periodInMinutes: 1 });

    // Arm alarms for all open tabs
    await recheckAllTabAlarms();

    console.log('tabCandle initialized successfully');
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// Initialization hooks
initializeExtension();
chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeExtension);

/**
 * Periodic safety sweep (every 1 minute)
 */
async function periodicTabSweep() {
  try {
    const settings = await chrome.storage.local.get({
      autoCloseMinutes: DEFAULT_AUTO_CLOSE_MINUTES,
      tabTimestamps: {},
      tabCloseTimes: {}
    });

    const now = Date.now();
    const tabs = await chrome.tabs.query({});
    const timestamps = { ...settings.tabTimestamps };
    const closeTimes = { ...(settings.tabCloseTimes || {}) };
    let storageChanged = false;
    const defaultMinutes = Number(settings.autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES;

    for (const tab of tabs) {
      if (tab.pinned || tab.audible) continue;

      const tabKey = String(tab.id);

      if (!timestamps[tabKey]) {
        timestamps[tabKey] = now;
        storageChanged = true;
      }

      if (!closeTimes[tabKey]) {
        const createdAt = timestamps[tabKey] || now;
        closeTimes[tabKey] = createdAt + (defaultMinutes * 60 * 1000);
        storageChanged = true;
        scheduleTabCloseAlarm(tab.id, closeTimes[tabKey]);
        continue;
      }

      const closeAt = closeTimes[tabKey];
      if (closeAt <= now) {
        await closeTab(tab.id);
      }
    }

    if (storageChanged) {
      await chrome.storage.local.set({ tabTimestamps: timestamps, tabCloseTimes: closeTimes });
    }
  } catch (err) {
    console.error('Periodic tab sweep error:', err);
  }
}

// Alarm Listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_PERIODIC_CHECK) {
    await periodicTabSweep();
    return;
  }

  if (alarm.name.startsWith('close_')) {
    const tabId = Number(alarm.name.replace('close_', ''));
    if (!isNaN(tabId)) {
      await closeTab(tabId);
    }
  }
});

// Tab Created: Record timestamp & closeAt (immutable per tab)
chrome.tabs.onCreated.addListener(async (tab) => {
  const now = Date.now();
  try {
    const { tabTimestamps = {}, tabCloseTimes = {}, autoCloseMinutes = DEFAULT_AUTO_CLOSE_MINUTES } = await chrome.storage.local.get([
      'tabTimestamps',
      'tabCloseTimes',
      'autoCloseMinutes'
    ]);
    const minutes = Number(autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES;
    const closeAt = now + (minutes * 60 * 1000);
    const tabKey = String(tab.id);

    tabTimestamps[tabKey] = now;
    tabCloseTimes[tabKey] = closeAt;
    await chrome.storage.local.set({ tabTimestamps, tabCloseTimes });

    if (!tab.pinned) {
      scheduleTabCloseAlarm(tab.id, closeAt);
    }
  } catch (err) {
    console.warn('Failed to record tab creation timestamp and close time:', err);
  }
});

// Tab Removed: Clean up alarms, timestamp & closeTime
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await cleanupTabData(tabId);
});

// Tab Updated: Check pinned state changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.pinned !== undefined) {
    if (changeInfo.pinned) {
      chrome.alarms.clear(`close_${tabId}`);
    } else {
      const { tabCloseTimes = {}, autoCloseMinutes = DEFAULT_AUTO_CLOSE_MINUTES } = await chrome.storage.local.get([
        'tabCloseTimes',
        'autoCloseMinutes'
      ]);
      const now = Date.now();
      const tabKey = String(tabId);
      let closeAt = tabCloseTimes[tabKey] || tabCloseTimes[tabId];
      if (!closeAt || closeAt <= now) {
        closeAt = now + ((Number(autoCloseMinutes) || DEFAULT_AUTO_CLOSE_MINUTES) * 60 * 1000);
        tabCloseTimes[tabKey] = closeAt;
        await chrome.storage.local.set({ tabCloseTimes });
      }
      scheduleTabCloseAlarm(tabId, closeAt);
    }
  }
});

// Runtime Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'recheckAlarms') {
    (async () => {
      try {
        await recheckAllTabAlarms();
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
