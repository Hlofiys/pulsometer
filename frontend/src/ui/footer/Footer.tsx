import { FC, memo } from "react";
import styles from "./Footer.module.scss";
import logo from '../../assets/photos/logo.webp';

const Footer: FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        <section className={styles.brand}>
          <img src={logo} alt="логотип" />
          <p>
            УО "Белорусская государственная академия связи"
            <span className={styles.copyright}>© 2026</span>
          </p>
        </section>
        <section className={styles.info}>
          <h4>Адрес</h4>
          <address>г. Минск, ул. Ф.Скорины, 8/2</address>
        </section>
        <section className={styles.team}>
          <h4>Разработчики</h4>
          <ul>
            <li>Board management controller — Арсений Рябчинский</li>
            <li>Frontend developer — Константин Кирик</li>
            <li>Backend developer — Тимофей Заневский</li>
            <li>UX/UI Designer — Анжелика Корнеева</li>
          </ul>
        </section>
      </div>
    </footer>
  );
};

export default memo(Footer);
