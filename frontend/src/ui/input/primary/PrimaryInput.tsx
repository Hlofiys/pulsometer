import { FC, InputHTMLAttributes, forwardRef } from "react";
import styles from "./PrimaryInput.module.scss";

const Input: FC<InputHTMLAttributes<HTMLInputElement>> = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { required, autoComplete, ...rest } = props;
  return (
    <input
      {...rest}
      className={styles.primaryInput}
      ref={ref}
      required={required}
      autoComplete={autoComplete}
    />
  );
});

export default Input;
