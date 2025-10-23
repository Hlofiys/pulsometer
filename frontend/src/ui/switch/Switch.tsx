import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./Switch.module.scss";
import FadeWrapper from "../wrappers/FadeWrapper";

interface OptionConfig {
  icon?: React.ReactNode;
  label: string;
}

interface TypedSwitchProps<T extends string> {
  options: Record<T, OptionConfig>; // конфиг значений -> иконка + подпись
  value?: T; // текущий выбранный вариант
  onChange?: (val: T) => void; // при смене
  tooltipDuration?: number;
  tooltipLocation?: "right" | "left";
}

export const Switch = <T extends string>({
  options,
  value: controlledValue,
  onChange,
  tooltipDuration = 1500,
  tooltipLocation = "right",
}: TypedSwitchProps<T>) => {
  const keys = Object.keys(options) as T[];
  if (keys.length !== 2)
    throw new Error("TypedSwitch поддерживает ровно 2 варианта");

  const [internalValue, setInternalValue] = useState<T>(
    controlledValue ?? keys[0]
  );
  const [tooltipText, setTooltipText] = useState(options[internalValue].label);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // синхронизация с контролируемым value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
      setTooltipText(options[controlledValue].label);
    }
  }, [controlledValue, options]);

  const toggle = useCallback(() => {
    const newValue = internalValue === keys[0] ? keys[1] : keys[0];

    if (controlledValue === undefined) setInternalValue(newValue);

    onChange?.(newValue);

    setTooltipText(options[newValue].label);
    setShowTooltip(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => setShowTooltip(false),
      tooltipDuration
    );
  }, [
    controlledValue,
    internalValue,
    keys,
    onChange,
    options,
    tooltipDuration,
  ]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const active = internalValue === keys[1]; // правый вариант = active

  return (
    <div className={styles.switchWrapper}>
      <FadeWrapper
        show={showTooltip}
        className={`${styles.tooltip} ${styles[tooltipLocation]}`}
      >
        <motion.span
          key={tooltipText}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ display: "inline-block" }}
        >
          {tooltipText}
        </motion.span>
      </FadeWrapper>

      <div
        className={`${styles.switch} ${active ? styles.activeSwitch : ""}`}
        onClick={toggle}
      >
        <div className={`${styles.toggle} ${active ? styles.active : ""}`} />
        <div className={styles.iconContainer}>
          <div className={`${styles.icon} ${active ? styles.hidden : ""}`}>
            {options[keys[0]]?.icon}
          </div>
          <div className={`${styles.icon} ${!active ? styles.hidden : ""}`}>
            {options[keys[1]]?.icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Switch;
