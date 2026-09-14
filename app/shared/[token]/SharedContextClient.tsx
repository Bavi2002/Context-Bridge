"use client";
import { useState } from "react";
import Link from "next/link";
import { StructuredContext } from "@/lib/types";
import styles from "./shared.module.css";

const PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", icon: "🟢" },
  { id: "claude", name: "Claude", icon: "🟠" },
  { id: "gemini", name: "Gemini", icon: "🔵" },
  { id: "grok", name: "Grok", icon: "⚫" },
  { id: "universal", name: "Universal", icon: "🌐" },
];

const AI_ICONS: Record<string, string> = {
  chatgpt: "🟢", claude: "🟠", gemini: "🔵", grok: "⚫", other: "🔘", unknown: "🔘",
};

interface Props {
  context: {
    id: string;
    title: string;
    structured: StructuredContext;
    tokensOriginal: number;
    tokensCompressed: number;
    sourceAI: string;
    token: string;
  };
}

export default function SharedContextClient({ context }: Props) {
  const { structured: ctx } = context;
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const compressionPercent = context.tokensOriginal > 0
    ? Math.round(((context.tokensOriginal - context.tokensCompressed) / context.tokensOriginal) * 100)
    : 0;

  async function handleGenerate(providerId: string) {
    setGeneratingFor(providerId);
    setPrompt(null);
    try {
      const res = await fetch(`/api/shared/${context.token}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId }),
      });
      const data = await res.json();
      setPrompt(data.prompt?.content || "");
    } catch {
      setPrompt("Error generating prompt.");
    }
  }

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>⬡</span>ContextBridge
        </Link>
        <Link href="/auth/signup" className="btn btn-primary btn-sm">
          Create Account
        </Link>
      </nav>

      <div className={styles.container}>
        <div className={styles.sharedBadge}>
          🔗 Shared Context
        </div>

        <h1 className={styles.title}>{context.title}</h1>

        <div className={styles.meta}>
          <span className="badge badge-neutral">
            {AI_ICONS[context.sourceAI]} {context.sourceAI}
          </span>
          {compressionPercent > 0 && (
            <span className="badge badge-success">{compressionPercent}% compressed</span>
          )}
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Summary</h2>
          <p className={styles.sectionText}>{ctx.summary}</p>
        </div>

        <div className={styles.grid}>
          <div>
            {ctx.requirements?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>✓ Requirements</h2>
                <ul className={styles.list}>
                  {ctx.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {ctx.technical_stack?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🔧 Technical Stack</h2>
                <div className={styles.chips}>
                  {ctx.technical_stack.map((t, i) => (
                    <span key={i} className="badge badge-accent">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {ctx.decisions?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⚡ Decisions</h2>
                <ol className={styles.list}>
                  {ctx.decisions.map((d, i) => <li key={i}>{d}</li>)}
                </ol>
              </div>
            )}
          </div>

          <div>
            {ctx.open_issues?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⚠️ Open Issues</h2>
                <ul className={styles.list}>
                  {ctx.open_issues.map((iss, i) => <li key={i}>{iss}</li>)}
                </ul>
              </div>
            )}

            {ctx.pending_tasks?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⏳ Pending Tasks</h2>
                <ul className={styles.list}>
                  {ctx.pending_tasks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            {ctx.current_state && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📍 Current State</h2>
                <p className={styles.sectionText}>{ctx.current_state.progressSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Continue with AI */}
        <div className={styles.continueSection}>
          <h2 className={styles.continueSectionTitle}>Continue with AI</h2>
          <p className={styles.continueSectionSub}>
            Select an AI to generate a ready-to-paste continuation prompt.
          </p>

          {!prompt ? (
            <div className={styles.providerGrid}>
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  id={`shared-continue-${p.id}`}
                  className={styles.providerBtn}
                  onClick={() => handleGenerate(p.id)}
                  disabled={generatingFor !== null}
                >
                  <span className={styles.providerIcon}>{p.icon}</span>
                  <span>{p.name}</span>
                  {generatingFor === p.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <span>→</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.promptSection}>
              <div className={styles.promptBox}>
                <pre className={styles.promptText}>{prompt}</pre>
              </div>
              <div className={styles.promptActions}>
                <button id="copy-shared-prompt" className="btn btn-primary" onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "📋 Copy Prompt"}
                </button>
                <button className="btn btn-secondary" onClick={() => { setPrompt(null); setGeneratingFor(null); }}>
                  ← Choose another AI
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p>Want to save your own AI contexts?</p>
          <Link href="/auth/signup" className="btn btn-primary">
            Get ContextBridge for free →
          </Link>
        </div>
      </div>
    </div>
  );
}
