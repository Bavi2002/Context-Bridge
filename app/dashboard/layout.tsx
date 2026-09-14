import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className={styles.shell}>
      <Sidebar user={session.user} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
