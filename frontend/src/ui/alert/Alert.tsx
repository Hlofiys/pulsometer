import { FC, useCallback, useEffect } from "react";
import moduleStyles from "./Alert.module.scss";
import { CloseCircleOutlined } from "@ant-design/icons";
import { motion, Variants } from "framer-motion";
import { IAlertParams } from "../../context/alert/AlertProvider";
import Button from "../buttons/primary/Button";

interface IAlertProps extends IAlertParams {
  onClose: () => void;
  startX?: number;
  startY?: number;
}

const Alert: FC<IAlertProps> = (props) => {
  const {
    styles,
    title,
    buttons,
    children,
    isWaitAsync = false,
    closable = true,
    closableOverlay = true,
    onClose,
    centered,
    startX = window.innerWidth / 2,
    startY = window.innerHeight / 2,
  } = props;

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleBtnClick = useCallback(
    async (onClick: (() => void | Promise<void>) | undefined) => {
      try {
        const result = onClick?.();
        if (result instanceof Promise) {
          await result;
        }
      } catch (e) {
        console.error("Alert button action failed:", e);
      } finally {
        if (!isWaitAsync) {
          onClose();
        }
      }
    },
    [onClose, isWaitAsync]
  );

  const handleOverlayClick = () => {
    if (closableOverlay) onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      x: startX - window.innerWidth / 2,
      y: startY - window.innerHeight / 2,
      transition: { duration: 0, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: { duration: 0, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.3,
      x: startX - window.innerWidth / 2,
      y: startY - window.innerHeight / 2,
      transition: { duration: 0, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={`${moduleStyles.overlay} ${
        (centered && moduleStyles.centered) || ""
      }`}
      style={styles?.overlay}
      onClick={handleOverlayClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0, ease: "easeOut" } }}
    >
      <motion.div
        className={moduleStyles.alertBox}
        onClick={handleContentClick}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        style={{
          originX: 0.5,
          originY: 0.5,
          position: "fixed",
          ...styles?.alertBox,
        }}
      >
        <div
          className={`${moduleStyles.headerContainer} ${
            (!title && moduleStyles.onlyCloseIcon) || ""
          }`}
        >
          {title && (
            <p className={moduleStyles.titleContent} style={styles?.title}>
              {title}
            </p>
          )}
          {closable && (
            <CloseCircleOutlined
              onClick={onClose}
              className={moduleStyles.closeIcon}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClose();
              }}
            />
          )}
        </div>

        {/* <div className={moduleStyles.content} style={styles?.content}> */}
          {children}
        {/* </div> */}

        {!!buttons?.length && (
          <footer className={moduleStyles.footer} style={styles?.footer}>
            {buttons.map((button) => {
              const {
                type = "default",
                text,
                onClick,
                isLoading,
                disabled,
                ...btnProps
              } = button;
              return (
                <Button
                  key={`${type}-${text}`}
                  onClick={() => handleBtnClick(onClick)}
                  isLoading={isLoading}
                  disabled={disabled}
                  value={type === "cancel" ? "text" : undefined}
                  className={`${moduleStyles.alertButton} ${
                    moduleStyles[type] || ""
                  }`}
                  {...btnProps}
                >
                  {text}
                </Button>
              );
            })}
          </footer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Alert;
