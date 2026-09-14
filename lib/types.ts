export type AIProvider = "chatgpt" | "claude" | "gemini" | "grok" | "other";

export type ContextMode = "full" | "balanced" | "compact";

export interface ProjectInfo {
  name: string;
  description: string;
  goal: string;
  type?: string;
}

export interface CurrentState {
  phase: string;
  lastCompletedTask?: string;
  progressSummary: string;
}

export interface StructuredContext {
  title: string;
  summary: string;
  project: ProjectInfo;
  requirements: string[];
  technical_stack: string[];
  decisions: string[];
  user_preferences: string[];
  important_facts: string[];
  current_state: CurrentState;
  open_issues: string[];
  completed_tasks: string[];
  pending_tasks: string[];
  files: string[];
  last_user_request: string;
  last_assistant_response: string;
}

export interface TokenStats {
  tokensOriginal: number;
  tokensCompressed: number;
  compressionPercent: number;
}

export interface ContextWithStats {
  structured: StructuredContext;
  stats: TokenStats;
}

export interface GeneratedPrompt {
  provider: AIProvider | "universal";
  title: string;
  content: string;
  characterCount: number;
  estimatedTokens: number;
}
