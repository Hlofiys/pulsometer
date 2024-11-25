import { ButtonHTMLAttributes, FC } from "react";
import styles from "./Button.module.scss";
import { Spin } from "antd";

interface IPrimaryButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}
const Button: FC<IPrimaryButton> = (props) => {
  const { isLoading, ...buttonProps } = props;
  
  return (
    <button className={styles.primaryContainer} {...buttonProps}>
      {isLoading ? <Spin /> : props.children}
    </button>
  );
};

export default Button;
