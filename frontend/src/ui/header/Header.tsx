import { FC } from "react";
import styles from "./Header.module.scss";
import logo from "../../assets/photos/logo.webp";
import { useNavigate } from "react-router-dom";
import { RouterPath } from "../../router/Router";
import { FundViewOutlined } from "@ant-design/icons";

//Белорусская государственная академия связи
const Header: FC = () => {
  const nav = useNavigate();

  return (
    <header className={styles.headerContainer}>
      <img src={logo} alt="логотип" onClick={() => nav(RouterPath.MAIN)} />
      <h5>УО “Белорусская государственная академия связи”</h5>
      <aside>
        <FundViewOutlined />
        <p>Система маниторинга</p>
      </aside>
    </header>
  );
};

export default Header;
