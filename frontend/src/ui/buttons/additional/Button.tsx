import { ButtonHTMLAttributes, FC } from "react";
import styles from "./Button.module.scss";

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button className={styles.additionButton} {...props}>
      {props.children}
    </button>
  );
};

export default Button;
