import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "../dashboard.module.css";

export default async function SharedPage() {
  const session = await auth();
  const sharedContexts = await prisma.sharedContext.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { createdAt: "desc" },
    include: {
      context: { select: { title: true } },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shared Contexts</h1>
          <p className={styles.pageSubtitle}>
            Manage your shared context links.
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {sharedContexts.length === 0 ? (
          <div className={styles.emptyState} style={{ gridColumn: "1/-1" }}>
            <div className={styles.emptyStateIcon}>🔗</div>
            <h3 className={styles.emptyStateTitle}>No shared contexts</h3>
            <p className={styles.emptyStateText}>
              Share a context from the context viewer to generate a public link.
            </p>
            <Link href="/dashboard/contexts" className="btn btn-primary">
              Browse contexts
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sharedContexts.map((sc: any) => (
              <div
                key={sc.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{sc.context.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {baseUrl}/shared/{sc.token}
                  </div>
                </div>
                <span className="badge badge-neutral">{sc.viewCount} views</span>
                <a
                  href={`/shared/${sc.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  Open →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
