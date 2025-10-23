import { ButtonHTMLAttributes, FC } from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean; // новое поле
}

const Button: FC<ButtonProps> = ({ className, loading = false, ...props }) => {
  return (
    <button
      className={`${styles.additionButton} ${className} ${
        loading ? styles.loading : ""
      }`}
      disabled={loading || props.disabled} // блокируем кнопку при загрузке
      {...props}
    >
      {loading ? (
        <span className={styles.spinner}></span> // спиннер через CSS
      ) : (
        props.children
      )}
    </button>
  );
};

export default Button;
