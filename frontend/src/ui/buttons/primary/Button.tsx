import { ButtonHTMLAttributes, FC } from "react";
import styles from "./Button.module.scss";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "danger" | "ghost";

interface IPrimaryButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const Button: FC<IPrimaryButton> = ({
  isLoading,
  size = "md",
  variant = "primary",
  className = "",
  disabled,
  children,
  ...buttonProps
}) => {
  const isDisabled = disabled || isLoading;

  const classes = [
    styles.button,
    styles[size],
    styles[variant],
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={isDisabled} {...buttonProps}>
      {isLoading ? (
        <span className={styles.skeleton} aria-hidden="true">
          <span className={styles.skeletonBar} />
          <span className={styles.skeletonBar} />
          <span className={styles.skeletonBar} />
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
