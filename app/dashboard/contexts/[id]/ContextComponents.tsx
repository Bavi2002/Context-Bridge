"use client";
import { useState, useCallback } from "react";
import { StructuredContext, AIProvider } from "@/lib/types";
import styles from "./context.module.css";

interface ContinueModalProps {
  contextId: string;
  onClose: () => void;
}

import { MessageSquare, Cpu, Sparkles, Binary, Globe } from "lucide-react";

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
