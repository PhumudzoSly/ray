import styles from "./Loading.module.css";

export function Loading() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  );
}
