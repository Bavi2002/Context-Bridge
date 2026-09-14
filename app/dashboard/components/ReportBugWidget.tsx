"use client";

import { useState } from "react";
import { Bug } from "lucide-react";

export default function ReportBugWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: bugDescription }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setBugDescription("");
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: "rgba(247, 242, 235, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 999,
          color: "var(--text-primary)",
        }}
        title="Report a Bug"
      >
        <Bug size={20} />
      </button>

      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 84,
          right: 24,
          width: 320,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
          borderRadius: 16,
          padding: 20,
          zIndex: 999,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Report a Bug</h3>
          {status === "success" ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--accent)" }}>
              Report sent! Thanks.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                className="input textarea"
                placeholder="What went wrong?"
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                style={{ minHeight: 100, marginBottom: 12, resize: "none" }}
                required
              />
              {status === "error" && (
                <p style={{ color: "var(--error)", fontSize: 13, marginBottom: 12 }}>
                  Failed to send report. Check SMTP config.
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsOpen(false)}
                  disabled={status === "sending"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={status === "sending" || !bugDescription.trim()}
                >
                  {status === "sending" ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
