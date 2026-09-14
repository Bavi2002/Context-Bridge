// ContextBridge Extension Background Service Worker
// Handles extension installation and badge updates

chrome.runtime.onInstalled.addListener(() => {
  console.log("ContextBridge extension installed");
  chrome.action.setBadgeBackgroundColor({ color: "#6366f1" });
});

// Update badge when navigating to supported AI sites
const SUPPORTED_HOSTNAMES = ["chatgpt.com", "claude.ai", "gemini.google.com", "grok.com"];

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;
  try {
    const url = new URL(tab.url);
    const supported = SUPPORTED_HOSTNAMES.some((h) => url.hostname.includes(h));
    if (supported) {
      chrome.action.setBadgeText({ text: "✓", tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  try {
    const url = new URL(tab.url);
    const supported = SUPPORTED_HOSTNAMES.some((h) => url.hostname.includes(h));
    if (supported) {
      chrome.action.setBadgeText({ text: "✓", tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {}
});
