import { FC } from "react";
import styles from './Skeleton.module.scss';

const Skeleton:FC = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonChart}></div>
      </div>
    </div>
  );
};

export default Skeleton;
