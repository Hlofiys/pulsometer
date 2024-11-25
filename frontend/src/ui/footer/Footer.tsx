import { FC, memo } from "react";
import styles from "./Footer.module.scss";

const Footer: FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <article>
        <p>УО “Белорусская государственная академия связи” © 2024</p>
      </article>
      <article>
        <p>Адрес:</p>г. Минск, ул. Ф.Скорины, 8/2
      </article>
      <article>
        <p>Разработчики:</p>
        <ul>
          <li>Board management controller, Арсений Рябчинский</li>
          <li>Frontend developer, Константин Кирик</li>
          <li>Backend developer, Тимофей Заневский</li>
          <li>UX/UI Designer, Анжелика Корнеева</li>
        </ul>
      </article>
    </footer>
  );
};

export default memo(Footer);
