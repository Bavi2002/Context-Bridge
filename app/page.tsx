import Link from "next/link";
import styles from "./landing.module.css";

const PROVIDERS = [
  { name: "ChatGPT", icon: "🟢", color: "#10a37f" },
  { name: "Claude", icon: "🟠", color: "#d97706" },
  { name: "Gemini", icon: "🔵", color: "#4285f4" },
  { name: "Grok", icon: "⚫", color: "#e5e7eb" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Smart Context Extraction",
    desc: "AI-powered analysis distills hours of conversation into structured, reusable context.",
  },
  {
    icon: "🔀",
    title: "Provider-Ready Prompts",
    desc: "Generate continuation prompts tuned for ChatGPT, Claude, Gemini, or Grok.",
  },
  {
    icon: "📦",
    title: "Context Compression",
    desc: "Reduce 80K tokens of conversation to 8K of essential context — without losing anything important.",
  },
  {
    icon: "📂",
    title: "Project Memory",
    desc: "Attach multiple conversations to a project. Your context evolves with your work.",
  },
  {
    icon: "🔗",
    title: "Shareable Contexts",
    desc: "Share a context link so collaborators can pick up and continue with any AI.",
  },
  {
    icon: "🕐",
    title: "Version History",
    desc: "Every update creates a version snapshot. Restore or compare previous states any time.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Capture",
    desc: "Paste your AI conversation or upload an exported file. We accept .txt, .md, .json, and .pdf.",
  },
  {
    step: "02",
    title: "Structure",
    desc: "Our AI engine extracts requirements, decisions, preferences, tech stack, open issues, and more into clean structured context.",
  },
  {
    step: "03",
    title: "Continue",
    desc: "Choose your next AI provider. Get a ready-to-paste continuation prompt. Open the AI and keep going.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 contexts / month",
      "Basic compression",
      "Context export",
      "Universal prompts",
      "7-day context storage",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    features: [
      "Unlimited contexts",
      "Advanced AI compression",
      "Project memory",
      "Browser extension",
      "Version history",
      "Context sharing",
      "Priority processing",
      "Unlimited storage",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "Coming soon",
    period: "",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Shared project memory",
      "Admin controls",
      "SSO",
    ],
    cta: "Join Waitlist",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ===== NAV ===== */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>⬡</span>
            ContextBridge
          </Link>
          <div className={styles.navLinks}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#how-it-works" className={styles.navLink}>How it works</Link>
            <Link href="#pricing" className={styles.navLink}>Pricing</Link>
          </div>
          <div className={styles.navCta}>
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgGlow1} />
          <div className={styles.heroBgGlow2} />
          <div className={styles.heroBgGrid} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Now in early access
          </div>

          <h1 className={styles.heroTitle}>
            Your AI context
            <br />
            <span className={styles.heroTitleGradient}>shouldn&apos;t be locked</span>
            <br />
            to one AI.
          </h1>

          <p className={styles.heroSubtitle}>
            Move conversations between ChatGPT, Claude, Gemini, and Grok
            without losing context, decisions, or progress.
            <br />
            <strong>Start anywhere. Continue anywhere.</strong>
          </p>

          <div className={styles.heroCta}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Start for Free →
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </Link>
          </div>

          <div className={styles.heroProviders}>
            {PROVIDERS.map((p) => (
              <div key={p.name} className={styles.providerChip}>
                <span>{p.icon}</span>
                {p.name}
              </div>
            ))}
            <span className={styles.providerMore}>+ more</span>
          </div>
        </div>

        {/* Flow diagram */}
        <div className={styles.heroFlow}>
          <div className={styles.flowCard}>
            <div className={styles.flowCardIcon}>🟢</div>
            <div className={styles.flowCardLabel}>ChatGPT</div>
            <div className={styles.flowCardSub}>Long conversation</div>
          </div>
          <div className={styles.flowArrow}>
            <div className={styles.flowArrowLine} />
            <div className={styles.flowArrowBadge}>ContextBridge</div>
            <div className={styles.flowArrowLine} />
          </div>
          <div className={styles.flowTargets}>
            <div className={styles.flowCard} style={{ opacity: 0.9 }}>
              <div className={styles.flowCardIcon}>🔵</div>
              <div className={styles.flowCardLabel}>Gemini</div>
              <div className={styles.flowCardSub}>Continue →</div>
            </div>
            <div className={styles.flowCard} style={{ opacity: 0.7 }}>
              <div className={styles.flowCardIcon}>🟠</div>
              <div className={styles.flowCardLabel}>Claude</div>
              <div className={styles.flowCardSub}>Continue →</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className={styles.problem}>
        <div className={styles.container}>
          <div className={styles.problemGrid}>
            <div className={styles.problemBefore}>
              <div className={styles.problemLabel} data-type="before">Before</div>
              <h3 className={styles.problemTitle}>The painful way</h3>
              <div className={styles.problemFlow}>
                {[
                  "Reach ChatGPT usage limit",
                  "Open Claude or Gemini",
                  "\"Here's the context...\"",
                  "Paste huge conversation",
                  "Re-explain everything",
                  "Upload files again",
                  "Lose context & decisions",
                ].map((step, i) => (
                  <div key={i} className={styles.problemStep}>
                    <div className={styles.problemStepDot} data-bad="true" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.problemAfter}>
              <div className={styles.problemLabel} data-type="after">After</div>
              <h3 className={styles.problemTitle}>The ContextBridge way</h3>
              <div className={styles.problemFlow}>
                {[
                  "Reach ChatGPT usage limit",
                  "Open ContextBridge",
                  "Paste your conversation",
                  "AI extracts structured context",
                  "Generate Gemini prompt",
                  "Copy & paste — done",
                  "Continue with full context",
                ].map((step, i) => (
                  <div key={i} className={styles.problemStep}>
                    <div className={styles.problemStepDot} data-good="true" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>How it works</div>
            <h2 className={styles.sectionTitle}>Three steps to context freedom</h2>
            <p className={styles.sectionSubtitle}>
              No more copy-pasting. No more re-explaining. Just structured, portable context.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Features</div>
            <h2 className={styles.sectionTitle}>Built for AI power users</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to maintain context across AI providers.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`${styles.featureCard} card card-hover`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPRESSION STAT ===== */}
      <section className={styles.compressionSection}>
        <div className={styles.container}>
          <div className={styles.compressionCard}>
            <div className={styles.compressionStat}>
              <div className={styles.compressionBig}>~85%</div>
              <div className={styles.compressionLabel}>Average context compression</div>
            </div>
            <div className={styles.compressionDivider} />
            <div className={styles.compressionText}>
              <h3>Stop wasting tokens on re-explanation</h3>
              <p>
                ContextBridge compresses a 40,000-token conversation down to the essential
                8,000-token context. You save tokens. Your new AI gets better context.
                Everyone wins.
              </p>
              <div className={styles.compressionExample}>
                <div className={styles.compressionBar}>
                  <div className={styles.compressionBarFill} style={{ width: "100%" }}>
                    <span>Original: 42K tokens</span>
                  </div>
                </div>
                <div className={styles.compressionBar}>
                  <div className={styles.compressionBarFill} style={{ width: "18%", background: "var(--success)" }}>
                    <span>Context: 7.8K tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRIVACY ===== */}
      <section className={styles.privacy}>
        <div className={styles.container}>
          <div className={styles.privacyCard}>
            <div className={styles.privacyIcon}>🔒</div>
            <h2>Privacy-first</h2>
            <p>
              Your conversations belong to you. We only process content necessary to generate
              your portable context. Delete your contexts at any time. Shared contexts use
              unpredictable tokens — never exposing your identity.
            </p>
            <div className={styles.privacyPoints}>
              <div className={styles.privacyPoint}>✓ No conversation training</div>
              <div className={styles.privacyPoint}>✓ Delete anytime</div>
              <div className={styles.privacyPoint}>✓ Encrypted at rest</div>
              <div className={styles.privacyPoint}>✓ Private share links</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Pricing</div>
            <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
            <p className={styles.sectionSubtitle}>
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingCardHighlighted : ""}`}
              >
                {plan.highlighted && (
                  <div className={styles.pricingPopular}>Most Popular</div>
                )}
                <div className={styles.pricingName}>{plan.name}</div>
                <div className={styles.pricingPrice}>
                  {plan.price}
                  {plan.period && (
                    <span className={styles.pricingPeriod}> / {plan.period}</span>
                  )}
                </div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f) => (
                    <li key={f} className={styles.pricingFeature}>
                      <span className={styles.pricingCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Team" ? "#" : "/auth/signup"}
                  className={`btn w-full ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
                  style={{ justifyContent: "center" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Ready to take your context with you?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join developers, researchers, and AI power users who refuse to lose context.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Start for Free — No credit card required
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span className={styles.logoMark}>⬡</span>
            ContextBridge
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", marginTop: "16px" }}>
            <Link href="/terms" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Terms & Conditions</Link>
            <Link href="/privacy" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Privacy Policy</Link>
          </div>
          <p className={styles.footerTagline}>Start anywhere. Continue anywhere.</p>
          <p className={styles.footerCopy}>© 2026 ContextBridge. Built with care for AI power users.</p>
        </div>
      </footer>
    </div>
  );
}
