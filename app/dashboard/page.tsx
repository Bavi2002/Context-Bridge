import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./dashboard.module.css";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const AI_ICONS: Record<string, string> = {
  chatgpt: "🟢",
  claude: "🟠",
  gemini: "🔵",
  grok: "⚫",
  other: "🔘",
  unknown: "🔘",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [contexts, projectCount, sharedCount] = await Promise.all([
    prisma.context.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        conversation: { select: { sourceAI: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.project.count({ where: { userId } }),
    prisma.sharedContext.count({ where: { userId } }),
  ]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = session!.user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {greeting()}, {firstName} 👋
          </h1>
          <p className={styles.pageSubtitle}>
            Your AI contexts are ready to travel.
          </p>
        </div>
        <Link href="/dashboard/contexts/new" id="new-context-btn" className="btn btn-primary">
          + New Context
        </Link>
      </div>

      <div className={styles.pageContent}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⬡</div>
            <div className={styles.statValue}>{contexts.length}</div>
            <div className={styles.statLabel}>Total Contexts</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <div className={styles.statValue}>{contexts.length}</div>
            <div className={styles.statLabel}>Saved Conversations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔗</div>
            <div className={styles.statValue}>{sharedCount}</div>
            <div className={styles.statLabel}>Shared Contexts</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>◫</div>
            <div className={styles.statValue}>{projectCount}</div>
            <div className={styles.statLabel}>Projects</div>
          </div>
        </div>

        {/* Recent Contexts */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Contexts</h2>
          <Link href="/dashboard/contexts" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>

        <div className={styles.contextList}>
          {contexts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>⬡</div>
              <h3 className={styles.emptyStateTitle}>No contexts yet</h3>
              <p className={styles.emptyStateText}>
                Import your first AI conversation to get started.
              </p>
              <Link href="/dashboard/contexts/new" className="btn btn-primary">
                + Create your first context
              </Link>
            </div>
          ) : (
            contexts.map((ctx) => {
              const sourceAI = ctx.conversation?.sourceAI || "unknown";
              return (
                <Link
                  key={ctx.id}
                  href={`/dashboard/contexts/${ctx.id}`}
                  id={`context-card-${ctx.id}`}
                  className={styles.contextCard}
                >
                  <div className={styles.contextCardTitle}>{ctx.title}</div>
                  <div className={styles.contextCardMeta}>
                    <span className="badge badge-neutral">
                      {AI_ICONS[sourceAI]} {sourceAI.charAt(0).toUpperCase() + sourceAI.slice(1)}
                    </span>
                    {ctx.project && (
                      <span className="badge badge-accent">{ctx.project.name}</span>
                    )}
                    <span className="badge badge-neutral">v{ctx.currentVersion}</span>
                  </div>
                  <div className={styles.contextCardTime}>
                    Updated {timeAgo(ctx.updatedAt)}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
