import { FC } from "react";
import styles from "./Header.module.scss";
import logo from "../../assets/photos/logo.png";
import { useNavigate } from "react-router-dom";

const Header: FC = () => {
  const nav = useNavigate();
  return (
    <header className={styles.headerContainer}>
      <img src={logo} alt="логотип" onClick={() => nav("/")} />
      <h5>УО “Белорусская государственная академия связи”</h5>
      <aside>
        <p>О проекте</p>
        <p>Пульсометр</p>
      </aside>
    </header>
  );
};

export default Header;