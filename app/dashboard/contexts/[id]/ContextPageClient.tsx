"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StructuredContext } from "@/lib/types";
import { ContinueModal, EditableList, CodeSnippetList } from "./ContextComponents";
import styles from "./context.module.css";

interface ContextPageClientProps {
  context: {
    id: string;
    projectId?: string | null;
    title: string;
    structured: StructuredContext;
    tokensOriginal: number;
    tokensCompressed: number;
    currentVersion: number;
    conversation?: { sourceAI: string } | null;
    versions: { version: number; changeSummary?: string | null; createdAt: string }[];
    sharedLinks: { id: string; token: string; viewCount: number }[];
  };
  projects: { id: string; name: string }[];
}

const AI_ICONS: Record<string, string> = {
  chatgpt: "🟢", claude: "🟠", gemini: "🔵", grok: "⚫", other: "🔘", unknown: "🔘",
};

export default function ContextPageClient({ context, projects }: ContextPageClientProps) {
  const [ctx, setCtx] = useState(context.structured);
  const [title, setTitle] = useState(context.title);
  const [projectId, setProjectId] = useState(context.projectId || "");
  const [showContinue, setShowContinue] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareToken, setShareToken] = useState(
    context.sharedLinks[0]?.token || null
  );
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const compressionPercent = context.tokensOriginal > 0
    ? Math.round(((context.tokensOriginal - context.tokensCompressed) / context.tokensOriginal) * 100)
    : 0;

  function updateCtx(updates: Partial<StructuredContext>) {
    setCtx((prev) => ({ ...prev, ...updates }));
  }

  function handleSave() {
    startSave(async () => {
      await fetch(`/api/contexts/${context.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, structured: { ...ctx }, changeSummary: "Manual edit" }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  async function handleAssignProject(newProjectId: string) {
    setProjectId(newProjectId);
    await fetch(`/api/contexts/${context.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: newProjectId === "" ? null : newProjectId }),
    });
    router.refresh();
  }

  async function handleShare() {
    if (shareToken) { setShowShare(true); return; }
    const res = await fetch(`/api/contexts/${context.id}/share`, { method: "POST" });
    const data = await res.json();
    setShareToken(data.token);
    setShowShare(true);
  }

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${shareToken}`
    : null;

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard">Dashboard</Link>
            <span>›</span>
            <Link href="/dashboard/contexts">Contexts</Link>
            <span>›</span>
            <span className="truncate">{context.title}</span>
          </div>
          <div className={styles.titleRow}>
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="context-title-edit"
            />
          </div>
          <div className={styles.headerMeta}>
            {context.conversation?.sourceAI && (
              <span className="badge badge-neutral">
                {AI_ICONS[context.conversation.sourceAI]}{" "}
                {context.conversation.sourceAI.charAt(0).toUpperCase() + context.conversation.sourceAI.slice(1)}
              </span>
            )}
            <span className="badge badge-neutral">v{context.currentVersion}</span>
            <select 
              className="input select"
              value={projectId}
              onChange={(e) => handleAssignProject(e.target.value)}
              style={{ width: "auto", padding: "4px 32px 4px 12px", height: "28px", fontSize: "13px", cursor: "pointer", background: "var(--bg-secondary)" }}
            >
              <option value="">No Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {compressionPercent > 0 && (
              <span className="badge badge-success">{compressionPercent}% compressed</span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button id="save-ctx-btn" className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
          </button>
          <button id="share-ctx-btn" className="btn btn-secondary btn-sm" onClick={handleShare}>
            🔗 Share
          </button>
          <button id="continue-with-ai-btn" className="btn btn-primary" onClick={() => setShowContinue(true)}>
            Continue with AI →
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Token stats */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statVal}>{context.tokensOriginal.toLocaleString()}</div>
            <div className={styles.statLbl}>Original tokens</div>
          </div>
          <div className={styles.statArrow}>→</div>
          <div className={styles.statItem}>
            <div className={`${styles.statVal} ${styles.statValGreen}`}>{context.tokensCompressed.toLocaleString()}</div>
            <div className={styles.statLbl}>Context tokens</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statVal} ${styles.statValAccent}`}>{compressionPercent}%</div>
            <div className={styles.statLbl}>Compression</div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.leftCol}>
            {/* Summary */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📋 Summary</h2>
              <textarea
                className={`input textarea ${styles.summaryArea}`}
                value={ctx.summary}
                onChange={(e) => updateCtx({ summary: e.target.value })}
                id="edit-summary"
              />
            </section>

            {/* Requirements */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>✓ Requirements</h2>
              <EditableList
                items={ctx.requirements || []}
                onChange={(items) => updateCtx({ requirements: items })}
                placeholder="Add requirement..."
              />
            </section>

            {/* Technical Stack */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🔧 Technical Stack</h2>
              <div className={styles.chipGroup}>
                {(ctx.technical_stack || []).map((tech, i) => (
                  <span key={i} className="badge badge-accent">{tech}</span>
                ))}
              </div>
              <EditableList
                items={ctx.technical_stack || []}
                onChange={(items) => updateCtx({ technical_stack: items })}
                placeholder="Add technology..."
              />
            </section>

            {/* Decisions */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>⚡ Important Decisions</h2>
              <EditableList
                items={ctx.decisions || []}
                onChange={(items) => updateCtx({ decisions: items })}
                placeholder="Add decision..."
              />
            </section>

            {/* Code Snippets & Commands */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>💻 Code Snippets & Commands</h2>
              <CodeSnippetList
                items={ctx.code_snippets || []}
                onChange={(items) => updateCtx({ code_snippets: items })}
                placeholder="Add code snippet or command..."
              />
            </section>

            {/* User Preferences */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>👤 User Preferences</h2>
              <EditableList
                items={ctx.user_preferences || []}
                onChange={(items) => updateCtx({ user_preferences: items })}
                placeholder="Add preference..."
              />
            </section>
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>
            {/* Current State */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📍 Current State</h2>
              <div className="form-group">
                <label className="label">Phase</label>
                <input className="input" value={ctx.current_state?.phase || ""}
                  onChange={(e) => updateCtx({ current_state: { ...ctx.current_state, phase: e.target.value } })}
                  id="edit-phase" />
              </div>
              <div className="form-group">
                <label className="label">Progress summary</label>
                <textarea className="input textarea" style={{ minHeight: 80 }}
                  value={ctx.current_state?.progressSummary || ""}
                  onChange={(e) => updateCtx({ current_state: { ...ctx.current_state, progressSummary: e.target.value } })}
                  id="edit-progress" />
              </div>
            </section>

            {/* Open Issues */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>⚠️ Open Issues</h2>
              <EditableList
                items={ctx.open_issues || []}
                onChange={(items) => updateCtx({ open_issues: items })}
                placeholder="Add issue..."
              />
            </section>

            {/* Pending Tasks */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>⏳ Pending Tasks</h2>
              <EditableList
                items={ctx.pending_tasks || []}
                onChange={(items) => updateCtx({ pending_tasks: items })}
                placeholder="Add task..."
              />
            </section>

            {/* Completed Tasks */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>✅ Completed Tasks</h2>
              <EditableList
                items={ctx.completed_tasks || []}
                onChange={(items) => updateCtx({ completed_tasks: items })}
                placeholder="Add completed task..."
              />
            </section>

            {/* Last Request */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>💬 Last User Request</h2>
              <textarea className="input textarea" style={{ minHeight: 80 }}
                value={ctx.last_user_request || ""}
                onChange={(e) => updateCtx({ last_user_request: e.target.value })}
                id="edit-last-request" />
            </section>

            {/* Version History */}
            {context.versions.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>🕐 Version History</h2>
                <div className={styles.versionList}>
                  {context.versions.map((v) => (
                    <div key={v.version} className={styles.versionItem}>
                      <span className="badge badge-neutral">v{v.version}</span>
                      <span className={styles.versionSummary}>{v.changeSummary || "—"}</span>
                      <span className={styles.versionDate}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Continue modal */}
      {showContinue && (
        <ContinueModal contextId={context.id} onClose={() => setShowContinue(false)} />
      )}

      {/* Share modal */}
      {showShare && shareUrl && (
        <div className={styles.modalOverlay} onClick={() => setShowShare(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} id="share-modal">
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Share Context</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowShare(false)}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
              Anyone with this link can view your context and generate continuation prompts.
            </p>
            <div className={styles.shareUrlBox}>
              <input
                id="share-url-input"
                className="input"
                value={shareUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                id="copy-share-url-btn"
                className="btn btn-primary btn-sm"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
