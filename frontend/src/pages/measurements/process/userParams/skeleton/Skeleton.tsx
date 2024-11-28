import { FC } from "react";
import styles from "./Skeleton.module.scss";

const SkeletonParams: FC = () => {
  return (
    <aside className={styles.userParamsContainer}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonRow}></div>
      <div className={styles.skeletonRow}></div>
      <div className={styles.skeletonRow} style={{ marginTop: 30 }}></div>
    </aside>
  );
};

export default SkeletonParams;
