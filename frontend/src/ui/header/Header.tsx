import { FC } from "react";
import styles from "./Header.module.scss";
import logo from "../../assets/photos/logo.webp";
import { useNavigate } from "react-router-dom";
import { RouterPath } from "../../router/Router";
import { FundViewOutlined } from "@ant-design/icons";

const Header: FC = () => {
  const nav = useNavigate();

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerInner}>
        <div className={styles.brand} onClick={() => nav(RouterPath.MAIN)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && nav(RouterPath.MAIN)}>
          <img src={logo} alt="логотип" />
          <h1>УО "Белорусская государственная академия связи"</h1>
        </div>
        <aside className={styles.meta}>
          <FundViewOutlined aria-hidden="true" />
          <span>Система мониторинга</span>
        </aside>
      </div>
    </header>
  );
};

export default Header;
