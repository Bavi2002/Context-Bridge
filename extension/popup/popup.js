const APP_URL = "https://context-bridge-blue.vercel.app"; // Change to production URL when deployed

const SUPPORTED_SITES = {
  "chatgpt.com": "ChatGPT",
  "claude.ai": "Claude",
  "gemini.google.com": "Gemini",
  "grok.com": "Grok",
};

function showElement(id) {
  document.getElementById(id).style.display = "block";
}

function hideAll() {
  ["not-supported", "no-auth", "ready-state", "saved-state"].forEach(
    (id) => (document.getElementById(id).style.display = "none")
  );
}

async function init() {
  hideAll();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const hostname = url.hostname;

  // Check if supported site
  const siteName = Object.entries(SUPPORTED_SITES).find(([host]) =>
    hostname.includes(host)
  )?.[1];

  if (!siteName) {
    showElement("not-supported");
    return;
  }

  document.getElementById("site-badge").textContent = siteName;

  // Check auth state via NextAuth session endpoint
  try {
    const res = await fetch(`${APP_URL}/api/auth/session`, { credentials: "include" });
    const session = await res.json();
    if (!session || !session.user) {
      showElement("no-auth");
      return;
    }
  } catch (err) {
    showElement("no-auth");
    return;
  }

  showElement("ready-state");
}

// Sign in button
document.getElementById("signin-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/auth/signin` });
});

// Save button
document.getElementById("save-btn").addEventListener("click", async () => {
  const btn = document.getElementById("save-btn");
  btn.innerHTML = '<span class="spinner"></span> Capturing...';
  btn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Ask content script for conversation text
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: "getConversation" });
    } catch (err) {
      // Content script not loaded (e.g. ghost tab), inject it manually
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content/content.js"],
      });
      // Wait a tiny bit for it to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));
      response = await chrome.tabs.sendMessage(tab.id, { action: "getConversation" });
    }

    if (!response?.text) {
      btn.innerHTML = "⚠️ Could not read conversation";
      btn.disabled = false;
      return;
    }

    const { authToken } = await chrome.storage.local.get("authToken");

    // Determine source AI from URL
    const url = new URL(tab.url);
    const hostname = url.hostname;
    let sourceAI = "other";
    if (hostname.includes("chatgpt.com")) sourceAI = "chatgpt";
    else if (hostname.includes("claude.ai")) sourceAI = "claude";
    else if (hostname.includes("gemini.google.com")) sourceAI = "gemini";
    else if (hostname.includes("grok.com")) sourceAI = "grok";

    // Get page title as context name
    const contextTitle = tab.title || `${sourceAI} conversation`;

    // Send to API
    const res = await fetch(`${APP_URL}/api/contexts/analyze`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: contextTitle,
        sourceAI,
        rawText: response.text,
      }),
    });

    if (!res.ok) {
      btn.innerHTML = "⚠️ Save failed. Try again.";
      btn.disabled = false;
      return;
    }

    const data = await res.json();

    hideAll();
    showElement("saved-state");
    document.getElementById("saved-context-name").innerHTML =
      `Context: <strong>${data.context.title}</strong>`;

    // Store saved context ID
    await chrome.storage.local.set({ lastContextId: data.context.id });
  } catch (err) {
    btn.innerHTML = "⚠️ Error. Check connection.";
    btn.disabled = false;
    console.error("ContextBridge save error:", err);
  }
});

// Open app button
document.getElementById("open-app-btn").addEventListener("click", async () => {
  const { lastContextId } = await chrome.storage.local.get("lastContextId");
  const url = lastContextId
    ? `${APP_URL}/dashboard/contexts/${lastContextId}`
    : `${APP_URL}/dashboard`;
  chrome.tabs.create({ url });
});

// Save another
document.getElementById("save-another-btn").addEventListener("click", () => {
  hideAll();
  showElement("ready-state");
});

// Initialize
init();
