import React, { useState, useRef, useEffect, CSSProperties } from "react";
import styles from "./Dropdown.module.scss";
import { Spin } from "antd";

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
  onChange?: (option: IOption<T>) => void; // Событие изменения значения
}

const Dropdown = <T,>({
  containersStyles,
  options,
  placeholder = "Выберите...",
  isLoading,
  value,
  defaultValue,
  inputStyles,
  onChange,
}: IDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]); // Хранение ссылок на опции

  // Устанавливаем значение по умолчанию или контролируемое значение
  useEffect(() => {
    const defaultOption = options.find((option) => option.value == defaultValue);
    const controlledOption = options.find((option) => option.value == value);

    const initialOption = controlledOption || defaultOption || null;
    setInputValue(initialOption?.label || "");
    setSelectedIndex(
      initialOption ? options.findIndex((option) => option.value === initialOption.value) : -1
    );
  }, [defaultValue, value, options]);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => setFilteredOptions(options), [options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(input.toLowerCase())
      )
    );
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const scrollToActiveOption = () => {
    if (selectedIndex < 0 || !listRef.current || !optionRefs.current[selectedIndex]) return;

    const activeOption = optionRefs.current[selectedIndex];
    const dropdownList = listRef.current;

    if (activeOption && dropdownList) {
      const { offsetTop, offsetHeight } = activeOption;
      const { scrollTop, clientHeight } = dropdownList;

      if (offsetTop < scrollTop) {
        dropdownList.scrollTop = offsetTop; // Прокрутка вверх
      } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
        dropdownList.scrollTop = offsetTop + offsetHeight - clientHeight; // Прокрутка вниз
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % filteredOptions.length;
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => {
        const nextIndex = (prevIndex - 1 + filteredOptions.length) % filteredOptions.length;
        return nextIndex;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const option = filteredOptions[selectedIndex];
        setInputValue(option.label);
        setIsOpen(false);
        onChange?.(option); // Сообщаем об изменении
      }
    }
  };

  useEffect(() => {
    scrollToActiveOption(); // Прокрутка при изменении активного элемента
  }, [selectedIndex]);

  const handleOptionClick = (option: IOption<T>) => {
    setInputValue(option.label);
    setIsOpen(false);
    onChange?.(option); // Сообщаем об изменении
  };

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

  return (
    <div
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
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          style={inputStyles}
        />
      )}
      <div
        ref={listRef}
        className={`${styles.dropdownList} ${isOpen ? "" : styles.hidden}`}
      >
        {!!filteredOptions.length ? (
          filteredOptions.map((option, index) => (
            <div
              key={(option.value as string | number).toString()}
              ref={(el) => (optionRefs.current[index] = el)} // Сохраняем ссылки на элементы
              className={`${styles.option} ${
                index === selectedIndex ? styles.optionActive : ""
              }`}
              onClick={() => handleOptionClick(option)}
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
