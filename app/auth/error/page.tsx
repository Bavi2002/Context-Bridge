import Link from "next/link";
import styles from "../auth.module.css";

export default function AuthErrorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>⬡</span> ContextBridge
        </Link>
        <h1 className={styles.title}>Authentication Error</h1>
        <p className={styles.subtitle}>
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/auth/signin" className="btn btn-primary w-full" style={{ justifyContent: "center" }}>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
