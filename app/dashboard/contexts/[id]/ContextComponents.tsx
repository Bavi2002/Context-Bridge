"use client";
import { useState, useCallback } from "react";
import { StructuredContext, AIProvider } from "@/lib/types";
import styles from "./context.module.css";

interface ContinueModalProps {
  contextId: string;
  onClose: () => void;
}

import { MessageSquare, Cpu, Sparkles, Binary, Globe, Copy, Check } from "lucide-react";

const PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", icon: <MessageSquare size={18} />, url: "https://chatgpt.com", desc: "GPT-4o, GPT-4" },
  { id: "claude", name: "Claude", icon: <Cpu size={18} />, url: "https://claude.ai", desc: "Claude 3.5 Sonnet, Haiku" },
  { id: "gemini", name: "Gemini", icon: <Sparkles size={18} />, url: "https://gemini.google.com", desc: "Gemini 1.5 Pro, Flash" },
  { id: "grok", name: "Grok", icon: <Binary size={18} />, url: "https://grok.com", desc: "Grok 2" },
  { id: "universal", name: "Universal", icon: <Globe size={18} />, url: "", desc: "Works with any AI" },
] as const;

export function ContinueModal({ contextId, onClose }: ContinueModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(providerId: string) {
    setSelectedProvider(providerId);
    setLoading(true);
    setPrompt(null);
    try {
      const res = await fetch(`/api/contexts/${contextId}/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId }),
      });
      const data = await res.json();
      setPrompt(data.prompt?.content || "");
    } catch {
      setPrompt("Error generating prompt.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const providerUrl = PROVIDERS.find(p => p.id === selectedProvider)?.url;

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} id="continue-modal">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Continue with AI</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-modal-btn">✕</button>
        </div>

        {!selectedProvider ? (
          <div className={styles.providerList}>
            <p className={styles.modalSubtitle}>
              Select an AI to generate a tailored continuation prompt.
            </p>
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                id={`choose-${p.id}`}
                className={styles.providerItem}
                onClick={() => handleGenerate(p.id)}
              >
                <span className={styles.providerItemIcon}>{p.icon}</span>
                <div className={styles.providerItemInfo}>
                  <div className={styles.providerItemName}>{p.name}</div>
                  <div className={styles.providerItemDesc}>{p.desc}</div>
                </div>
                <span className={styles.providerItemArrow}>→</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.promptPanel}>
            <div className={styles.promptHeader}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSelectedProvider(null); setPrompt(null); }}
                id="back-to-providers"
              >
                ← Back
              </button>
              <span className={styles.promptProviderLabel}>
                {PROVIDERS.find(p => p.id === selectedProvider)?.icon}{" "}
                {PROVIDERS.find(p => p.id === selectedProvider)?.name} Prompt
              </span>
            </div>

            {loading ? (
              <div className={styles.promptLoading}>
                <div className="spinner" />
                <span>Generating continuation prompt...</span>
              </div>
            ) : (
              <>
                <div className={styles.promptBox}>
                  <pre className={styles.promptText}>{prompt}</pre>
                </div>
                <div className={styles.promptStats}>
                  ~{Math.ceil((prompt?.length || 0) / 4).toLocaleString()} tokens
                  · {(prompt?.length || 0).toLocaleString()} characters
                </div>
                <div className={styles.promptActions}>
                  <button
                    id="copy-prompt-btn"
                    className="btn btn-primary"
                    onClick={handleCopy}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Prompt"}
                  </button>
                  {providerUrl && (
                    <a
                      id={`open-${selectedProvider}-btn`}
                      href={`${providerUrl}?cb_prompt=${encodeURIComponent(btoa(unescape(encodeURIComponent(prompt || ""))))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Open {PROVIDERS.find(p => p.id === selectedProvider)?.name} →
                    </a>
                  )}
                </div>
                <div className={styles.promptInstructions}>
                  <strong>Next steps:</strong> Copy the prompt above, open the AI provider,
                  paste it as your first message, and continue your conversation from where you left off.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function EditableList({ items, onChange, placeholder = "Add item..." }: EditableListProps) {
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleAdd() {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem("");
  }

  function handleDelete(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditValue(items[index]);
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const updated = [...items];
    updated[editingIndex] = editValue.trim() || items[editingIndex];
    onChange(updated);
    setEditingIndex(null);
  }

  return (
    <div className={styles.editableList}>
      {items.map((item, i) => (
        <div key={i} className={styles.editableItem}>
          {editingIndex === i ? (
            <div className={styles.editableItemEdit}>
              <input
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIndex(null); }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingIndex(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <span className={styles.editableItemText}>{item}</span>
              <div className={styles.editableItemActions}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(i)} title="Edit">✎</button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(i)} title="Delete" style={{ color: "var(--error)" }}>✕</button>
              </div>
            </>
          )}
        </div>
      ))}
      <div className={styles.editableAdd}>
        <input
          className="input"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <button className="btn btn-secondary btn-sm" onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
}

export interface CodeSnippet {
  code: string;
  language?: string;
  filename?: string;
  description?: string;
}

interface CodeSnippetListProps {
  items: (string | CodeSnippet)[];
  onChange: (items: (string | CodeSnippet)[]) => void;
  placeholder?: string;
}

export function CodeSnippetList({ items, onChange, placeholder = "Add snippet..." }: CodeSnippetListProps) {
  const [newItem, setNewItem] = useState<CodeSnippet>({ code: "", language: "", filename: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<CodeSnippet>({ code: "" });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function handleAdd() {
    if (!newItem.code.trim()) return;
    onChange([...items, { ...newItem, code: newItem.code.trim() }]);
    setNewItem({ code: "", language: "", filename: "" });
  }

  function handleDelete(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    const item = items[index];
    setEditValue(typeof item === "string" ? { code: item } : { ...item });
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const updated = [...items];
    updated[editingIndex] = { ...editValue, code: editValue.code.trim() || (typeof items[editingIndex] === "string" ? items[editingIndex] as string : (items[editingIndex] as CodeSnippet).code) };
    onChange(updated);
    setEditingIndex(null);
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className={styles.editableList} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {items.map((rawItem, i) => {
        const item: CodeSnippet = typeof rawItem === "string" ? { code: rawItem } : rawItem;
        return (
          <div key={i} className={styles.editableItem} style={{ flexDirection: "column", alignItems: "stretch", background: "#1e1e1e", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            {editingIndex === i ? (
              <div className={styles.editableItemEdit} style={{ flexDirection: "column", alignItems: "stretch", width: "100%", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input className="input" placeholder="Filename (e.g. app.js)" value={editValue.filename || ""} onChange={(e) => setEditValue({...editValue, filename: e.target.value})} style={{ flex: 1, background: "#252526", color: "#d4d4d4", border: "1px solid #3c3c3c" }} />
                  <input className="input" placeholder="Language (e.g. javascript)" value={editValue.language || ""} onChange={(e) => setEditValue({...editValue, language: e.target.value})} style={{ width: "150px", background: "#252526", color: "#d4d4d4", border: "1px solid #3c3c3c" }} />
                </div>
                <textarea
                  className="input textarea"
                  value={editValue.code}
                  onChange={(e) => setEditValue({...editValue, code: e.target.value})}
                  autoFocus
                  style={{ minHeight: "120px", fontFamily: "monospace", fontSize: "13px", width: "100%", background: "#252526", color: "#d4d4d4", border: "1px solid #3c3c3c" }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingIndex(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #333", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.filename && <span style={{ fontSize: "13px", fontWeight: 600, color: "#d4d4d4" }}>{item.filename}</span>}
                    {item.language && <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#888", border: "1px solid #333", padding: "2px 6px", borderRadius: "4px" }}>{item.language}</span>}
                    {!item.filename && !item.language && <span style={{ fontSize: "12px", color: "#888" }}>Code Snippet</span>}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      onClick={() => handleCopy(item.code, i)} 
                      title="Copy"
                      style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#a0a0a0" }}
                    >
                      {copiedIndex === i ? <><Check size={14} color="var(--success)" /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: "#a0a0a0" }} onClick={() => startEdit(i)} title="Edit">✎</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(i)} title="Delete" style={{ color: "var(--error)" }}>✕</button>
                  </div>
                </div>
                {item.description && <p style={{ fontSize: "12px", color: "#a0a0a0", marginBottom: "8px" }}>{item.description}</p>}
                <pre style={{ margin: 0, padding: 0, overflowX: "auto", fontFamily: "monospace", fontSize: "13px", color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  <code>{item.code}</code>
                </pre>
              </div>
            )}
          </div>
        );
      })}
      <div className={styles.editableAdd} style={{ flexDirection: "column", alignItems: "stretch", marginTop: "12px", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input className="input" placeholder="Filename (optional)" value={newItem.filename || ""} onChange={(e) => setNewItem({...newItem, filename: e.target.value})} style={{ flex: 1, background: "#1e1e1e", color: "#d4d4d4", border: "1px solid #3c3c3c" }} />
          <input className="input" placeholder="Language (optional)" value={newItem.language || ""} onChange={(e) => setNewItem({...newItem, language: e.target.value})} style={{ width: "150px", background: "#1e1e1e", color: "#d4d4d4", border: "1px solid #3c3c3c" }} />
        </div>
        <textarea
          className="input textarea"
          placeholder={placeholder}
          value={newItem.code}
          onChange={(e) => setNewItem({...newItem, code: e.target.value})}
          style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "13px", width: "100%", background: "#1e1e1e", color: "#d4d4d4", border: "1px solid #3c3c3c" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-sm" onClick={handleAdd}>+ Add Snippet</button>
        </div>
      </div>
    </div>
  );
}
