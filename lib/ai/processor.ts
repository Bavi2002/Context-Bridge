import { StructuredContext, ContextWithStats } from "@/lib/types";

export interface ContextProcessor {
  analyzeConversation(
    rawText: string,
    title?: string
  ): Promise<ContextWithStats>;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}

const EXTRACTION_PROMPT = `You are an expert AI context analyst. Your job is to analyze an AI conversation and extract structured, reusable context from it.

Analyze the following conversation carefully and extract ALL important information.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, raw JSON only):

{
  "title": "Short descriptive title for this context",
  "summary": "2-3 sentence summary of what this conversation is about",
  "project": {
    "name": "Project or topic name",
    "description": "What the project/topic is",
    "goal": "The main objective"
  },
  "requirements": ["List of explicit requirements or goals mentioned"],
  "technical_stack": ["Technologies, frameworks, libraries, tools mentioned"],
  "decisions": ["Important decisions made during the conversation"],
  "user_preferences": ["User preferences, constraints, or style choices mentioned"],
  "important_facts": ["Key facts, constraints, or context that must be preserved"],
  "current_state": {
    "phase": "What phase/stage the project/task is in",
    "lastCompletedTask": "The last thing that was completed",
    "progressSummary": "Current progress summary"
  },
  "open_issues": ["Unresolved problems, bugs, or questions"],
  "completed_tasks": ["Tasks or features that have been completed"],
  "pending_tasks": ["Tasks still to be done"],
  "files": ["File names, paths, or documents mentioned"],
  "code_snippets": [
    {
      "code": "The full code snippet or command",
      "language": "Language (e.g. typescript, bash, python)",
      "filename": "Filename if mentioned (e.g. app/page.tsx)",
      "description": "Brief description of what this code does"
    }
  ],
  "last_user_request": "The final request or question from the user",
  "last_assistant_response": "Brief summary of the last assistant response"
}

Rules:
- Be thorough - capture all important information
- Use exact quotes where important
- If a field has no content, use an empty array [] or empty string ""
- Do NOT include any markdown formatting in your response
- Return ONLY valid JSON

CONVERSATION TO ANALYZE:
`;

export class GeminiContextProcessor implements ContextProcessor {
  private apiKeys: string[];

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys;
  }

  async analyzeConversation(
    rawText: string,
    title?: string
  ): Promise<ContextWithStats> {
    const tokensOriginal = estimateTokens(rawText);
    const maxRetries = 5;
    
    let lastError: Error | null = null;
    let currentKeyIndex = 0;
    
    // Fallback models in order of preference
    const models = ["gemini-flash-latest", "gemini-pro-latest"];
    let currentModelIndex = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const apiKey = this.apiKeys[currentKeyIndex];
      const model = models[currentModelIndex];

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: EXTRACTION_PROMPT + rawText }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
            }),
          }
        );

        if (!response.ok) {
          const err = await response.text();
          
          if (response.status === 429) {
            // Rate limit hit, try next API key
            console.warn(`ContextBridge: Rate limit on key ${currentKeyIndex + 1}. Switching keys.`);
            currentKeyIndex = (currentKeyIndex + 1) % this.apiKeys.length;
            throw new Error(`Rate limit exceeded`);
          } else if (response.status >= 500 || response.status === 404) {
            // Model issue or server error, try fallback model
            if (currentModelIndex < models.length - 1) {
              console.warn(`ContextBridge: Model ${model} failed. Falling back.`);
              currentModelIndex++;
            }
            throw new Error(`Model API error: ${response.status} - ${err}`);
          }
          
          throw new Error(`Gemini API error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Strip markdown code blocks if present
        const jsonText = rawOutput
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        let structured: StructuredContext;
        try {
          structured = JSON.parse(jsonText);
        } catch {
          throw new Error("Failed to parse Gemini response as JSON");
        }

        // Override title if provided
        if (title) {
          structured.title = title;
        }

        const contextJson = JSON.stringify(structured);
        const tokensCompressed = estimateTokens(contextJson);
        const compressionPercent = Math.round(
          ((tokensOriginal - tokensCompressed) / tokensOriginal) * 100
        );

        return {
          structured,
          stats: {
            tokensOriginal,
            tokensCompressed,
            compressionPercent: Math.max(0, compressionPercent),
          },
        };
      } catch (err: unknown) {
        lastError = err as Error;
        console.error(`Attempt ${attempt} failed:`, (err as Error).message);
        
        // Wait briefly before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    throw new Error(`Context analysis failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }
}

export function createContextProcessor(): ContextProcessor {
  // Collect all configured API keys
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY environment variables are set");
  }
  
  return new GeminiContextProcessor(keys);
}
