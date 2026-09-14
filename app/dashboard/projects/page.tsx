import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "../dashboard.module.css";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await prisma.project.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { conversations: true, contexts: true } },
    },
  });



  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageSubtitle}>
            Organize contexts by project. Build persistent AI memory.
          </p>
        </div>
        <button id="new-project-btn" className="btn btn-primary">+ New Project</button>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.contextList}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>◫</div>
              <h3 className={styles.emptyStateTitle}>No projects yet</h3>
              <p className={styles.emptyStateText}>
                Projects help you organize multiple conversations around a common goal.
              </p>
              <button id="create-first-project" className="btn btn-primary">+ Create your first project</button>
            </div>
          ) : (
            projects.map((project: any) => (
              <div key={project.id} id={`project-${project.id}`} className={styles.contextCard} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className={styles.contextCardTitle}>{project.name}</div>
                <div className={styles.contextCardMeta}>
                  <span className="badge badge-neutral">
                    {project._count.conversations} conversation{project._count.conversations !== 1 ? "s" : ""}
                  </span>
                  <span className="badge badge-neutral">
                    {project._count.contexts} context{project._count.contexts !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.contextCardTime}>
                  Last updated {timeAgo(project.updatedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
