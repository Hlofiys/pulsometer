import { ButtonHTMLAttributes, FC, memo } from "react";
import styles from "./Link.module.scss";

const Link: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button {...props} className={`${styles.link} ${props.className || ""}`}>
      {props.children}
    </button>
  );
};

export default memo(Link);
