/**
 * ContextBridge Content Script
 * Reads conversation content from AI provider pages
 */

function getConversationText() {
  const hostname = window.location.hostname;

  try {
    if (hostname.includes("chatgpt.com")) {
      return getChatGPTConversation();
    } else if (hostname.includes("claude.ai")) {
      return getClaudeConversation();
    } else if (hostname.includes("gemini.google.com")) {
      return getGeminiConversation();
    } else if (hostname.includes("grok.com")) {
      return getGrokConversation();
    }
  } catch (err) {
    console.error("ContextBridge: Error reading conversation", err);
  }

  return "";
}

function getChatGPTConversation() {
  const messages = document.querySelectorAll(
    "[data-message-author-role]"
  );
  if (messages.length === 0) return "";

  return Array.from(messages)
    .map((msg) => {
      const role = msg.getAttribute("data-message-author-role");
      const text = msg.innerText?.trim() || "";
      return `${role === "user" ? "User" : "Assistant"}:\n${text}`;
    })
    .join("\n\n");
}

function getClaudeConversation() {
  // Claude uses data-testid attributes
  const messages = document.querySelectorAll(
    "[data-testid='human-turn'], [data-testid='ai-turn']"
  );
  if (messages.length === 0) {
    // Fallback: grab all visible text from conversation area
    const main = document.querySelector("main");
    return main?.innerText?.trim() || "";
  }

  return Array.from(messages)
    .map((msg) => {
      const isHuman = msg.getAttribute("data-testid") === "human-turn";
      return `${isHuman ? "User" : "Assistant"}:\n${msg.innerText?.trim() || ""}`;
    })
    .join("\n\n");
}

function getGeminiConversation() {
  const messages = document.querySelectorAll(
    "model-response, user-query, .conversation-container .message-content"
  );
  if (messages.length === 0) {
    const container = document.querySelector(".conversation-container, chat-window, main");
    return container?.innerText?.trim() || "";
  }

  return Array.from(messages)
    .map((msg) => {
      const tag = msg.tagName.toLowerCase();
      const role = tag === "model-response" ? "Assistant" : "User";
      return `${role}:\n${msg.innerText?.trim() || ""}`;
    })
    .join("\n\n");
}

function getGrokConversation() {
  // Grok page structure — best-effort fallback
  const messageElements = document.querySelectorAll(
    "[class*='message'], [class*='conversation'] [class*='bubble']"
  );

  if (messageElements.length === 0) {
    const main = document.querySelector("main, [role='main']");
    return main?.innerText?.trim() || document.body?.innerText?.trim() || "";
  }

  return Array.from(messageElements)
    .map((el) => el.innerText?.trim() || "")
    .filter(Boolean)
    .join("\n\n");
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getConversation") {
    const text = getConversationText();
    sendResponse({ text, charCount: text.length });
  }
  return true; // Keep message channel open for async
});

console.log("ContextBridge: Content script loaded on", window.location.hostname);

// --- AUTO-PASTE FEATURE ---
// Detect ?cb_prompt parameter and paste it into the AI's chat box
function autoPastePrompt() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedPrompt = urlParams.get("cb_prompt");
  if (!encodedPrompt) return;

  try {
    const promptText = decodeURIComponent(escape(atob(decodeURIComponent(encodedPrompt))));
    
    // Clean up URL so the user can refresh without re-pasting
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: newUrl }, '', newUrl);

    // Give the page a moment to render the chat box
    setTimeout(() => {
      let inputElement = null;
      const hostname = window.location.hostname;

      if (hostname.includes("chatgpt.com")) {
        inputElement = document.querySelector("#prompt-textarea");
      } else if (hostname.includes("claude.ai")) {
        inputElement = document.querySelector("div[contenteditable='true']");
      } else if (hostname.includes("gemini.google.com")) {
        inputElement = document.querySelector("rich-textarea div[contenteditable='true'], .textarea-container textarea");
      } else if (hostname.includes("grok.com")) {
        inputElement = document.querySelector("textarea, div[contenteditable='true']");
      }

      if (inputElement) {
        inputElement.focus();
        // Use insertText to trigger React/ProseMirror change events properly
        document.execCommand('insertText', false, promptText);
        console.log("ContextBridge: Auto-pasted prompt successfully.");
      } else {
        console.warn("ContextBridge: Could not find chat input box to auto-paste.");
      }
    }, 1500); // Wait 1.5s for React/Vue/Angular to mount the text area
  } catch (err) {
    console.error("ContextBridge: Failed to decode auto-paste prompt", err);
  }
}

// Run auto-paste on load
if (document.readyState === "complete" || document.readyState === "interactive") {
  autoPastePrompt();
} else {
  document.addEventListener("DOMContentLoaded", autoPastePrompt);
}
