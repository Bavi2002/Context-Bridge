import styles from "./dashboard.module.css";

export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", padding: 32 }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className={styles.skeletonBox} style={{ width: 250, height: 32 }} />
        <div className={styles.skeletonBox} style={{ width: 400, height: 20 }} />
      </div>

      {/* Content Skeleton Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={styles.skeletonBox} style={{ width: "100%", height: 120, borderRadius: 12 }} />
        <div className={styles.skeletonBox} style={{ width: "100%", height: 120, borderRadius: 12 }} />
        <div className={styles.skeletonBox} style={{ width: "100%", height: 120, borderRadius: 12 }} />
      </div>
    </div>
  );
}
