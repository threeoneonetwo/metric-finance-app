import styles from "@/components/brief-view.module.css";

// Shown instantly while a brief loads.
export default function BriefLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading your brief">
      <div className={styles.main}>
        <div className={`${styles.skel} ${styles.skelPill}`} />
        <div className={`${styles.skel} ${styles.skelTitle}`} />
        <div className={styles.skelChips}><div className={styles.skel} /><div className={styles.skel} /><div className={styles.skel} /></div>
        <div className={`${styles.skel} ${styles.skelFrame}`} />
      </div>
    </div>
  );
}
