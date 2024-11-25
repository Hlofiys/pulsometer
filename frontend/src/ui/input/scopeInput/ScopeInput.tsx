import { FC, InputHTMLAttributes } from "react";
import styles from "./ScopeInput.module.scss";
import Input from "../primary/PrimaryInput";
import Dropdown, { IDropdownProps } from "../dropdown/Dropdown";

interface IScopeInput<T> {
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  dropdownProps?: IDropdownProps<T> & {
    isDropDown?: boolean;
  };
  ariaDescription: string
}
const ScopeInput: FC<IScopeInput<string|number>> = (props) => {
  const { inputProps, dropdownProps, ariaDescription } = props;
  // const label = (inputProps!['aria-description'] || dropdownProps!['aria-description'] || '');

  return (
    <div className={styles.scopeInputcontainer}>
      <label htmlFor={ariaDescription}>
        {ariaDescription}
      </label>
      {dropdownProps?.isDropDown ? (
        <Dropdown  {...dropdownProps} />
      ) : (
        <Input {...inputProps} id={ariaDescription} />
      )}
    </div>
  );
};

export default ScopeInput;
