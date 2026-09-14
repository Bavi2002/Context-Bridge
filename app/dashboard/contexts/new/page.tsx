"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./new.module.css";

const AI_PROVIDERS = [
  { value: "chatgpt", label: "ChatGPT", icon: "🟢" },
  { value: "claude", label: "Claude", icon: "🟠" },
  { value: "gemini", label: "Gemini", icon: "🔵" },
  { value: "grok", label: "Grok", icon: "⚫" },
  { value: "other", label: "Other", icon: "🔘" },
];

export default function NewContextPage() {
  const [title, setTitle] = useState("");
  const [sourceAI, setSourceAI] = useState("chatgpt");
  const [importMethod, setImportMethod] = useState<"paste" | "upload">("paste");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const charCount = rawText.length;
  const estTokens = Math.ceil(charCount / 4);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) { setError("Please paste your conversation text."); return; }
    if (!title.trim()) { setError("Please enter a context name."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contexts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sourceAI, rawText }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Analysis failed."); return; }
      router.push(`/dashboard/contexts/${data.context.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawText(text);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard">Dashboard</Link>
            <span>›</span>
            <Link href="/dashboard/contexts">Contexts</Link>
            <span>›</span>
            <span>New</span>
          </div>
          <h1 className={styles.pageTitle}>Create Context</h1>
          <p className={styles.pageSubtitle}>
            Import an AI conversation and extract structured, portable context.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleAnalyze} className={styles.form}>
          <div className={styles.formSection}>
            <div className="form-group">
              <label className="label" htmlFor="context-title">Context name</label>
              <input
                id="context-title"
                type="text"
                className="input"
                placeholder="e.g. AutoUML Development, Research Project..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <label className="label">Source AI</label>
            <div className={styles.providerGrid}>
              {AI_PROVIDERS.map((p) => (
                <button key={p.value} type="button" id={`provider-${p.value}`}
                  className={`${styles.providerBtn} ${sourceAI === p.value ? styles.providerBtnActive : ""}`}
                  onClick={() => setSourceAI(p.value)}>
                  <span className={styles.providerBtnIcon}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <label className="label">Import method</label>
            <div className={styles.methodToggle}>
              <button type="button" id="method-paste"
                className={`${styles.methodBtn} ${importMethod === "paste" ? styles.methodBtnActive : ""}`}
                onClick={() => setImportMethod("paste")}>
                📋 Paste conversation
              </button>
              <button type="button" id="method-upload"
                className={`${styles.methodBtn} ${importMethod === "upload" ? styles.methodBtnActive : ""}`}
                onClick={() => setImportMethod("upload")}>
                📁 Upload file
              </button>
            </div>
          </div>

          {importMethod === "paste" ? (
            <div className={styles.formSection}>
              <div className="form-group">
                <label className="label" htmlFor="conversation-text">
                  Conversation
                  {charCount > 0 && (
                    <span className={styles.charCount}>
                      {" "}— {charCount.toLocaleString()} chars (~{estTokens.toLocaleString()} tokens)
                    </span>
                  )}
                </label>
                <textarea
                  id="conversation-text"
                  className={`input textarea ${styles.conversationArea}`}
                  placeholder={"Paste your AI conversation here...\n\nUser:\nI want to build a Next.js application...\n\nAssistant:\nSure! We can start with...\n\nUser:\nDon't use Firebase...\n\nAssistant:\nUnderstood, let's use PostgreSQL instead..."}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className={styles.formSection}>
              <div className={styles.uploadZone}>
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.uploadText}>
                  Drop your file here or click to browse
                </p>
                <p className={styles.uploadHint}>
                  Supports .txt, .md, .json, .pdf
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.md,.json,.pdf"
                  className={styles.uploadInput}
                  onChange={handleFileUpload}
                />
              </div>
              {rawText && (
                <p className={styles.uploadSuccess}>
                  ✓ File loaded — {charCount.toLocaleString()} characters
                </p>
              )}
            </div>
          )}

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.formActions}>
            <Link href="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              id="analyze-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !rawText.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing with AI...
                </>
              ) : (
                <>⚡ Analyze Context</>
              )}
            </button>
          </div>

          {loading && (
            <div className={styles.loadingHint}>
              <div className={styles.loadingSteps}>
                <div className={styles.loadingStep}>🔍 Reading conversation...</div>
                <div className={styles.loadingStep}>🧠 Extracting structure with Gemini...</div>
                <div className={styles.loadingStep}>💾 Saving context...</div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
