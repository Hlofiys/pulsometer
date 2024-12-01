import React, {
  useState,
  useRef,
  useEffect,
  CSSProperties,
  useMemo,
} from "react";
import styles from "./Dropdown.module.scss";
import { Spin } from "antd";
import ArrowLeft from "../../icons/ArrowLeft";
import ArrowRight from "../../icons/ArrowRight";

export interface IOption<T> {
  label: string;
  value: T;
}

export interface IDropdownProps<T> {
  containersStyles?: CSSProperties;
  inputStyles?: CSSProperties;
  options: IOption<T>[];
  placeholder?: string;
  isLoading?: boolean;
  value?: T; // Контролируемое значение
  defaultValue?: T; // Значение по умолчанию
  isHorizontal?: boolean;
  onChange?: (option: IOption<T>) => void; // Событие изменения значения
}

const Dropdown = <T extends string | number>({
  containersStyles,
  options,
  placeholder,
  isLoading,
  value,
  defaultValue,
  inputStyles,
  isHorizontal,
  onChange,
}: IDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState<string>("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false); // Флаг для блокировки повторных кликов во время анимации

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, options]
  );

  useEffect(() => {
    const initialOption = options.find(
      (option) => option.value === (value ?? defaultValue)
    );
    setInputValue(initialOption?.label || "");
    setSelectedIndex(
      initialOption
        ? options.findIndex((option) => option.value === initialOption.value)
        : -1
    );
  }, [value, defaultValue, options]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const scrollToActiveOption = () => {
    if (
      selectedIndex < 0 ||
      !listRef.current ||
      !optionRefs.current[selectedIndex]
    )
      return;

    const activeOption = optionRefs.current[selectedIndex];
    const dropdownList = listRef.current;

    if (activeOption && dropdownList) {
      const { offsetTop, offsetHeight } = activeOption;
      const { scrollTop, clientHeight } = dropdownList;

      if (offsetTop < scrollTop) {
        dropdownList.scrollTop = offsetTop;
      } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
        dropdownList.scrollTop = offsetTop + offsetHeight - clientHeight;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => {
        const offset = e.key === "ArrowDown" ? 1 : -1;
        return (
          (prevIndex + offset + filteredOptions.length) % filteredOptions.length
        );
      });
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectOption(filteredOptions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectOption = (option: IOption<T>) => {
    setInputValue(option.label);
    setIsOpen(false);
    onChange?.(option);
  };

  useEffect(() => scrollToActiveOption(), [selectedIndex]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionSelect = (index: number) => {
    const option = options[index];
    if (option) {
      setInputValue(option.label);
      onChange?.(option);
    }
  };

  const handleArrowClick = (direction: "left" | "right") => {
    if (isAnimating) return;
  
    setSlideDirection(direction);
    setIsAnimating(true);
  
    setTimeout(() => {
      setSelectedIndex((prevIndex) => {
        const newIndex =
          direction === "left"
            ? (prevIndex - 1 + options.length) % options.length
            : (prevIndex + 1) % options.length;
  
        handleOptionSelect(newIndex);
        return newIndex;
      });
    }, 200);
  
    setTimeout(() => {
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };  

  if (isHorizontal) {
    return (
      <div
        data-dropdown="true"
        className={`${styles.dropdownContainer} ${styles.horizontal}`}
        ref={dropdownRef}
        style={containersStyles}
      >
        <ArrowLeft onClick={() => handleArrowClick("left")} />
        <div className={styles.optionWrapper}>
          {slideDirection && (
            <div
              className={`${styles.optionText} ${
                slideDirection === "left" ? styles["exit-left"] : ""
              } ${slideDirection === "right" ? styles["exit-right"] : ""}`}
            >
              {inputValue}
            </div>
          )}
          <div
            className={`${styles.optionText} ${
              slideDirection === "left" ? styles["enter-left"] : ""
            } ${slideDirection === "right" ? styles["enter-right"] : ""}`}
          >
            {options[selectedIndex]?.label || ""}
          </div>
        </div>
        <ArrowRight onClick={() => handleArrowClick("right")} />
      </div>
    );
  }

  return (
    <div
      data-dropdown="true"
      className={styles.dropdownContainer}
      ref={dropdownRef}
      style={containersStyles}
    >
      {isLoading ? (
        <Spin />
      ) : (
        <input
          type="text"
          className={styles.inputField}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={inputStyles}
        />
      )}
      <div
        ref={listRef}
        className={`${styles.dropdownList} ${
          isOpen && !isHorizontal ? "" : styles.hidden
        }`}
      >
        {filteredOptions.length ? (
          filteredOptions.map((option, index) => (
            <div
              key={option.value}
              ref={(el) => (optionRefs.current[index] = el)}
              className={`${styles.option} ${
                index === selectedIndex ? styles.optionActive : ""
              }`}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className={`${styles.option} ${styles.emptyItem}`}>
            Список пуст
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
