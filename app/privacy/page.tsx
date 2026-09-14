import Link from "next/link";
import styles from "../landing.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>⬡</span>
            ContextBridge
          </Link>
          <div className={styles.navCta}>
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">Sign in</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 64px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 24, color: "var(--text-primary)" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>Last updated: September 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>1. Information We Collect</h2>
            <p>
              When you use ContextBridge, we collect basic profile information (name, email) for authentication purposes. 
              The core of our service processes conversation contexts that you actively choose to save from AI platforms.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>2. How We Use Your Data</h2>
            <p>
              Your saved conversation context is securely processed server-side to extract structured data (topics, entities, code snippets).
              We do not use your data for advertising, and we do not train our own AI models on your private conversations.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>3. Data Storage and Security</h2>
            <p>
              Your data is stored in our secure database (powered by Neon) and encrypted at rest. 
              Only you have access to your saved contexts and projects.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>4. Your Rights</h2>
            <p>
              You have the right to access, modify, or completely delete all your data at any time from your dashboard settings.
              If you delete your account, all associated contexts and projects will be permanently removed.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:sivabavithran16@gmail.com" style={{color: "var(--text-primary)", fontWeight: 600}}>sivabavithran16@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
