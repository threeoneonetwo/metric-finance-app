import styles from "./learn.module.css";

// Shown instantly while a Learn page loads, so navigation never feels blank.
export default function LearnLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading">
      <div className={styles.main}>
        <div className={`${styles.skel} ${styles.skelPill}`} />
        <div className={`${styles.skel} ${styles.skelTitle}`} />
        <div className={`${styles.skel} ${styles.skelTitle}`} style={{ width: "55%" }} />
        <div className={`${styles.skel} ${styles.skelLine}`} />
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: "70%" }} />
        <div className={styles.skelGrid}>
          {[0, 1, 2, 3].map((item) => <div key={item} className={`${styles.skel} ${styles.skelCard}`} />)}
        </div>
      </div>
    </div>
  );
}
