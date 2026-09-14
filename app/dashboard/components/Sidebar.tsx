"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "../dashboard.module.css";

import { LayoutDashboard, Hexagon, FolderGit2, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/contexts", label: "Contexts", icon: <Hexagon size={18} /> },
  { href: "/dashboard/projects", label: "Projects", icon: <FolderGit2 size={18} /> },
  { href: "/dashboard/shared", label: "Shared", icon: <Users size={18} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings size={18} /> },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <Link href="/" className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoMark}>⬡</span>
          <span className={styles.sidebarLogoText}>ContextBridge</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className={`${styles.sidebarNavItem} ${active ? styles.sidebarNavItemActive : ""}`}
              >
                <span className={styles.sidebarNavIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarUser}>
        <div className={styles.sidebarUserAvatar}>
          {user.image ? (
            <img src={user.image} alt={user.name || ""} width={32} height={32} />
          ) : (
            <span>{(user.name || user.email || "U")[0].toUpperCase()}</span>
          )}
        </div>
        <div className={styles.sidebarUserInfo}>
          <div className={styles.sidebarUserName}>{user.name || "User"}</div>
          <div className={styles.sidebarUserEmail}>{user.email}</div>
        </div>
        <button
          id="signout-btn"
          className={`btn btn-ghost btn-icon ${styles.sidebarSignOut}`}
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
        >
          →
        </button>
      </div>
    </aside>
  );
}
