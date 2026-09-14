import Link from "next/link";
import styles from "../landing.module.css";

export default function TermsPage() {
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
        <h1 style={{ fontSize: 32, marginBottom: 24, color: "var(--text-primary)" }}>Terms and Conditions</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>Last updated: September 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using ContextBridge, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>2. Description of Service</h2>
            <p>
              ContextBridge provides a tool to extract, structure, and transfer conversation context between various AI platforms. 
              We are not affiliated with OpenAI, Google, Anthropic, or xAI.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>3. User Conduct</h2>
            <p>
              You agree not to use the service to process, upload, or transmit any data that is unlawful, harmful, threatening, 
              abusive, harassing, defamatory, or otherwise objectionable. You are solely responsible for the context you save 
              using ContextBridge.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>4. Modifications to Service</h2>
            <p>
              ContextBridge reserves the right at any time to modify or discontinue, temporarily or permanently, the service 
              (or any part thereof) with or without notice.
            </p>
          </section>

          <section>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, marginBottom: 12 }}>5. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: <a href="mailto:sivabavithran16@gmail.com" style={{color: "var(--text-primary)", fontWeight: 600}}>sivabavithran16@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
