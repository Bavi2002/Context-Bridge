import { StructuredContext, GeneratedPrompt, AIProvider } from "@/lib/types";

function formatList(items: string[], prefix = "•"): string {
  if (!items || items.length === 0) return "  None specified";
  return items.map((item) => `  ${prefix} ${item}`).join("\n");
}

function buildBaseContext(context: StructuredContext): string {
  return `
PROJECT
-------
Name: ${context.project.name || context.title}
Description: ${context.project.description || context.summary}
Goal: ${context.project.goal || "See summary above"}

SUMMARY
-------
${context.summary}

TECHNICAL STACK
---------------
${formatList(context.technical_stack)}

REQUIREMENTS
------------
${formatList(context.requirements, "✓")}

IMPORTANT DECISIONS
--------------------
${context.decisions.map((d, i) => `  ${i + 1}. ${d}`).join("\n") || "  None documented"}

USER PREFERENCES & CONSTRAINTS
-------------------------------
${formatList(context.user_preferences)}

IMPORTANT FACTS
---------------
${formatList(context.important_facts)}

CURRENT STATE
-------------
Phase: ${context.current_state?.phase || "Unknown"}
Progress: ${context.current_state?.progressSummary || "See summary"}
Last completed: ${context.current_state?.lastCompletedTask || "Unknown"}

COMPLETED TASKS
---------------
${formatList(context.completed_tasks, "✓")}

PENDING TASKS
-------------
${formatList(context.pending_tasks, "○")}

OPEN ISSUES
-----------
${formatList(context.open_issues, "⚠")}

FILES & DOCUMENTS
-----------------
${formatList(context.files)}

LAST USER REQUEST
-----------------
${context.last_user_request || "See conversation"}

PREVIOUS ASSISTANT RESPONSE SUMMARY
------------------------------------
${context.last_assistant_response || "See conversation"}
`.trim();
}

export function generateUniversalPrompt(
  context: StructuredContext
): GeneratedPrompt {
  const content = `
=== CONTEXT BRIDGE — AI CONTEXT HANDOFF ===

You are continuing an existing AI conversation. The following is a structured
summary of the full conversation context. Please read it carefully before responding.

DO NOT ask the user to re-explain anything covered below.
DO NOT restart the project or change established decisions.
Continue from the CURRENT STATE described below.

${buildBaseContext(context)}

INSTRUCTIONS
------------
• Continue from the current state — do not restart
• Respect all established decisions and preferences listed above
• Do not ask for information already provided above
• If you need clarification, ask ONLY about things genuinely not covered above
• Pick up from the LAST USER REQUEST and help move the PENDING TASKS forward

=== END OF CONTEXT ===

The user may now continue their conversation below.
`.trim();

  return {
    provider: "universal",
    title: "Universal AI Context",
    content,
    characterCount: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
  };
}

export function generateChatGPTPrompt(
  context: StructuredContext
): GeneratedPrompt {
  const content = `
You are continuing an existing ChatGPT conversation via ContextBridge.

The following structured context represents the complete history and state of a
previous conversation. Treat it as authoritative — the user should not need to
re-explain anything here.

${buildBaseContext(context)}

SYSTEM INSTRUCTIONS
-------------------
• You are picking up exactly where the previous session left off
• Honor all decisions, preferences, and constraints listed above
• Your first response should acknowledge the context and either:
  (a) continue the last task directly, or
  (b) ask the user how they'd like to proceed from the current state
• Keep code consistent with the established technical stack

Begin assisting the user now.
`.trim();

  return {
    provider: "chatgpt",
    title: "ChatGPT Continuation Prompt",
    content,
    characterCount: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
  };
}

export function generateClaudePrompt(
  context: StructuredContext
): GeneratedPrompt {
  const content = `
<context_handoff>
This conversation is being continued from another AI session using ContextBridge.
The following is a complete structured summary of the previous conversation context.

<project>
${buildBaseContext(context)}
</project>

<instructions>
- Read the full context above carefully before responding
- You are continuing an existing project/conversation — not starting fresh
- Do not ask the user to repeat information already provided in the context
- Honor all decisions, constraints, and preferences listed
- Start by briefly acknowledging the context and asking how to proceed, OR
  directly continue with the pending task if it is clear
- Maintain consistency with the technical stack and style preferences
</instructions>
</context_handoff>
`.trim();

  return {
    provider: "claude",
    title: "Claude Continuation Prompt",
    content,
    characterCount: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
  };
}

export function generateGeminiPrompt(
  context: StructuredContext
): GeneratedPrompt {
  const content = `
[CONTEXT HANDOFF — ContextBridge]

You are Gemini, and you are continuing an AI conversation that started in another session.
Below is the full structured context extracted from that conversation. 
Read it carefully and continue helping the user from exactly where they left off.

${buildBaseContext(context)}

[CONTINUATION GUIDELINES]
1. Do not restart or reintroduce the project — continue from the current state
2. Respect all decisions, preferences, and constraints listed above  
3. Your first response should smoothly continue from the last user request
4. Keep your suggestions consistent with the established technical stack
5. If something is unclear, ask targeted questions — don't ask about things already documented above

Ready to continue. The user's next message will follow.
`.trim();

  return {
    provider: "gemini",
    title: "Gemini Continuation Prompt",
    content,
    characterCount: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
  };
}

export function generateGrokPrompt(
  context: StructuredContext
): GeneratedPrompt {
  const content = `
[AI CONTEXT HANDOFF via ContextBridge]

Hey Grok — picking up an existing conversation here. The full context is below.
No need for the user to re-explain anything. Jump right in.

${buildBaseContext(context)}

[RULES]
- This is a continuation, not a new conversation
- All the decisions above are locked in — don't suggest alternatives unless the user asks
- Start from the CURRENT STATE and help with the PENDING TASKS
- Be direct and keep the momentum going

User is ready to continue now.
`.trim();

  return {
    provider: "grok",
    title: "Grok Continuation Prompt",
    content,
    characterCount: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
  };
}

export function generatePromptForProvider(
  provider: AIProvider | "universal",
  context: StructuredContext
): GeneratedPrompt {
  switch (provider) {
    case "chatgpt":
      return generateChatGPTPrompt(context);
    case "claude":
      return generateClaudePrompt(context);
    case "gemini":
      return generateGeminiPrompt(context);
    case "grok":
      return generateGrokPrompt(context);
    default:
      return generateUniversalPrompt(context);
  }
}

export const AI_PROVIDER_URLS: Record<string, string> = {
  chatgpt: "https://chatgpt.com",
  claude: "https://claude.ai",
  gemini: "https://gemini.google.com",
  grok: "https://grok.com",
};
