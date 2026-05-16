import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import styles from "./Switch.module.scss";
import FadeWrapper from "../wrappers/FadeWrapper";

interface OptionConfig {
  icon?: React.ReactNode;
  label: string;
}

interface TypedSwitchProps<T extends string> {
  options: Record<T, OptionConfig>;
  value?: T;
  onChange?: (val: T) => void;
  tooltipDuration?: number;
  tooltipLocation?: "right" | "left";
  ariaLabel?: string;
}

export const Switch = <T extends string>({
  options,
  value: controlledValue,
  onChange,
  tooltipDuration = 1500,
  tooltipLocation = "right",
  ariaLabel,
}: TypedSwitchProps<T>) => {
  const keys = Object.keys(options) as T[];
  if (keys.length !== 2)
    throw new Error("TypedSwitch supports exactly 2 options");

  const [internalValue, setInternalValue] = useState<T>(
    controlledValue ?? keys[0]
  );
  const [tooltipText, setTooltipText] = useState(options[internalValue].label);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<number | null>(null);

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const active = internalValue === keys[1];

  return (
    <div className={styles.switchWrapper}>
      <FadeWrapper
        show={showTooltip}
        className={`${styles.tooltip} ${styles[tooltipLocation]}`}
      >
        <motion.span
          key={tooltipText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {tooltipText}
        </motion.span>
      </FadeWrapper>

      <div
        className={`${styles.switch} ${active ? styles.activeSwitch : ""}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        role="switch"
        aria-checked={active}
        aria-label={
          ariaLabel || `${options[keys[0]].label} / ${options[keys[1]].label}`
        }
        tabIndex={0}
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
