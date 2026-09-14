import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "../dashboard.module.css";

const AI_ICONS: Record<string, string> = {
  chatgpt: "🟢", claude: "🟠", gemini: "🔵", grok: "⚫", other: "🔘", unknown: "🔘",
};

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

export default async function ContextsPage() {
  const session = await auth();
  const contexts = await prisma.context.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { updatedAt: "desc" },
    include: {
      conversation: { select: { sourceAI: true } },
      project: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Contexts</h1>
          <p className={styles.pageSubtitle}>
            {contexts.length} context{contexts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href="/dashboard/contexts/new" id="new-context-btn" className="btn btn-primary">
          + New Context
        </Link>
      </div>

      <div className={styles.pageContent}>
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
              const comprPct = ctx.tokensOriginal > 0
                ? Math.round(((ctx.tokensOriginal - ctx.tokensCompressed) / ctx.tokensOriginal) * 100)
                : 0;
              return (
                <Link
                  key={ctx.id}
                  href={`/dashboard/contexts/${ctx.id}`}
                  id={`context-${ctx.id}`}
                  className={styles.contextCard}
                >
                  <div className={styles.contextCardTitle}>{ctx.title}</div>
                  <div className={styles.contextCardMeta}>
                    <span className="badge badge-neutral">
                      {AI_ICONS[sourceAI]} {sourceAI.charAt(0).toUpperCase() + sourceAI.slice(1)}
                    </span>
                    {ctx.project && <span className="badge badge-accent">{ctx.project.name}</span>}
                    <span className="badge badge-neutral">v{ctx.currentVersion}</span>
                    {comprPct > 0 && <span className="badge badge-success">{comprPct}% compressed</span>}
                  </div>
                  <div className={styles.contextCardTime}>Updated {timeAgo(ctx.updatedAt)}</div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
