import { FC, useState, FormHTMLAttributes, InputHTMLAttributes } from "react";
import Magnifier from "../../icons/Mognifier";
import styles from "./SearchInput.module.scss";

interface ISearchInput {
  searchValueState?: [string, React.Dispatch<React.SetStateAction<string>>];
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
}

export const SearchInput: FC<ISearchInput> = ({
  searchValueState,
  formProps,
  inputProps,
  placeholder = "Поиск...",
}) => {
  const internalState = useState<string>("");
  const [searchValue, setSearchValue] = searchValueState || internalState;
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const showMagnifier = !isFocused && !searchValue;

  return (
    <form
      className={`${styles.searchForm} ${isFocused ? styles.focused : ""}`}
      onSubmit={(event) => event.preventDefault()}
      {...formProps}
      role="search"
    >
      <Magnifier
        className={`${styles.magnifier} ${showMagnifier ? styles.visible : styles.hidden}`}
        stroke="currentColor"
        aria-hidden="true"
      />
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        className={styles.input}
        placeholder={placeholder}
        type="search"
        {...inputProps}
      />
    </form>
  );
};
