import { FC } from "react";
import styles from "./Empty.module.scss";

interface IEmptyProps {
  description?: string;
}

const Empty: FC<IEmptyProps> = ({ description }) => {
  return (
    <section className={styles.emptySection} aria-live="polite">
      <div className={styles.lottieWrap}>
        <div className={styles.placeholderAnimation} aria-hidden="true">
          <svg viewBox="0 0 120 120" className={styles.animatedCircle}>
            <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="251" strokeDashoffset="60">
              <animate attributeName="stroke-dashoffset" values="251;0" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
      <p className={styles.description}>{description ?? "Список пуст"}</p>
    </section>
  );
};

export default Empty;
