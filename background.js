// Carbon Filter - Background Service Worker

let isEnabled = true; // Default state

// Load initial state from storage
chrome.storage.local.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false;
  updateBadge();
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    isEnabled = message.enabled;
    chrome.storage.local.set({ enabled: isEnabled });
    updateBadge();
    // Optionally, inform content scripts to re-process
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id && tab.url && tab.url.startsWith('http')) {
          chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: isEnabled }).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
  } else if (message.action === 'getStatus') {
    sendResponse({ enabled: isEnabled });
  }
  return true; // Keep the message channel open for async response
});

// Update the extension badge
function updateBadge() {
  chrome.action.setBadgeText({ text: isEnabled ? 'ON' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: isEnabled ? '#00b894' : '#ff6b6b' });
}

// Handle extension action click (toggle on/off)
chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;
  chrome.storage.local.set({ enabled: isEnabled });
  updateBadge();
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: isEnabled }).catch(() => {});
  }
});