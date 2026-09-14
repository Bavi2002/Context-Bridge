"use client";
import { useSession } from "next-auth/react";
import styles from "../dashboard.module.css";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account preferences.</p>
        </div>
      </div>

      <div className={styles.pageContent} style={{ maxWidth: 600 }}>
        {/* Profile */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Profile</h2>
          <div className="form-group">
            <label className="label">Name</label>
            <input className="input" defaultValue={session?.user?.name || ""} readOnly />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" defaultValue={session?.user?.email || ""} readOnly />
          </div>
        </div>

        {/* API Keys */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>AI Processing</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            ContextBridge uses Google Gemini to extract structured context from your conversations.
            API calls are made server-side — your keys are never exposed to the browser.
          </p>
          <div className="badge badge-success" style={{ display: "inline-flex" }}>
            ✓ Gemini 1.5 Flash configured
          </div>
        </div>

        {/* Privacy */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Privacy</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Your conversations belong to you. We only process content necessary to extract structured context.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
            <span>✓ Conversations are processed server-side</span>
            <span>✓ Data is encrypted at rest</span>
            <span>✓ You can delete all your data at any time</span>
            <span>✓ We do not train AI on your conversations</span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--error)" }}>Danger Zone</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Irreversible actions. Proceed with caution.
          </p>
          <button id="delete-account-btn" className="btn btn-danger btn-sm">
            Delete Account & All Data
          </button>
        </div>
      </div>
    </div>
  );
}
