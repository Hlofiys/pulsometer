import { FC, InputHTMLAttributes, forwardRef } from "react";
import styles from "./PrimaryInput.module.scss";

const Input: FC<InputHTMLAttributes<HTMLInputElement>> = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <input
      {...props}
      className={styles.primaryInput}
      ref={ref}
      required
      autoComplete="off"
    />
  );
});

export default Input;
