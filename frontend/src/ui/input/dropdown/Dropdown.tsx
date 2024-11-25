// Dropdown.tsx
import React, { useState, useRef, useEffect, CSSProperties } from "react";
import styles from "./Dropdown.module.scss";
import { Spin } from "antd";

export interface IOption<T> {
  label: string;
  value: T;
}

export interface IDropdownProps<T> {
  containersStyles?: CSSProperties;
  options: IOption<T>[];
  placeholder?: string;
  isLoading?: boolean;
  //   isSearch?: boolean;
  onSelect: (option: IOption<T>) => void;
}

const Dropdown = <T,>({
  containersStyles,
  options,
  placeholder = "Выберите...",
  isLoading,
  //   isSearch,
  onSelect,
}: IDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => setFilteredOptions(options), [options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      )
    );
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredOptions.length) % filteredOptions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const option = filteredOptions[selectedIndex];
        setInputValue(option.label);
        setIsOpen(false);
        onSelect(option);
      }
    }
  };

  const handleOptionClick = (option: IOption<T>) => {
    setInputValue(option.label);
    setIsOpen(false);
    onSelect(option);
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
        />
      )}
      <div className={`${styles.dropdownList} ${isOpen ? "" : styles.hidden}`}>
        {!!filteredOptions.length ? (
          filteredOptions.map((option, index) => (
            <div
              key={(option.value as string | number).toString()}
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
