import { ButtonHTMLAttributes, FC } from "react";
import styles from "./Button.module.scss";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "secondary" | "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const Button: FC<ButtonProps> = ({
  className = "",
  loading: loadingProp,
  isLoading,
  size = "md",
  variant = "secondary",
  disabled,
  children,
  ...props
}) => {
  const loading = isLoading ?? loadingProp ?? false;
  const isDisabled = disabled || loading;

  const classes = [
    styles.button,
    styles[size],
    styles[variant],
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
