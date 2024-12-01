import { FC, useState, FormHTMLAttributes, InputHTMLAttributes } from "react";
import Magnifier from "../../icons/Mognifier";
import styles from "./SearchInput.module.scss";

interface ISearchInput {
  searchValueState?: [string, React.Dispatch<React.SetStateAction<string>>]; // Для управления состоянием извне
  formProps?: FormHTMLAttributes<HTMLFormElement>; // Пропсы для формы
  inputProps?: InputHTMLAttributes<HTMLInputElement>; // Пропсы для инпута
}

export const SearchInput: FC<ISearchInput> = (props) => {
  const { searchValueState, formProps, inputProps } = props;
  const [searchValue, setSearchValue] =
    searchValueState || useState<string>(""); // Локальное состояние, если state не передан
  const [isMagnifierVisible, setIsMagnifierVisible] = useState<boolean>(true);

  return (
    <form className={styles.searchForm} onSubmit={(event)=>event.preventDefault()} {...formProps}>
      <Magnifier
        style={{
          display:
            isMagnifierVisible && !Boolean(searchValue) ? undefined : "none",
          position: "absolute",
          marginLeft: 10,
        }}
        stroke="#fbfaf8"
      />
      <input
        onFocus={() => setIsMagnifierVisible(false)}
        onBlur={() => setIsMagnifierVisible(true)}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        className={styles.input}
        {...inputProps} // Пропсы для инпута
      />
    </form>
  );
};
