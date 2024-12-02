import { FC } from "react";
import styles from "./Header.module.scss";
import logo from "../../assets/photos/logo.webp";
import { useNavigate } from "react-router-dom";
import { RouterPath } from "../../router/Router";

const Header: FC = () => {
  const nav = useNavigate();
  return (
    <header className={styles.headerContainer}>
      <img src={logo} alt="логотип" onClick={() => nav(RouterPath.MAIN)} />
      <h5>УО “Белорусская государственная академия связи”</h5>
      <aside>
        <p>О проекте</p>
        <p>Пульсометр</p>
      </aside>
    </header>
  );
};

export default Header;
