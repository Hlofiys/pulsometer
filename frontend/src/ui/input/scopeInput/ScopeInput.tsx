import { FC, InputHTMLAttributes } from "react";
import styles from "./ScopeInput.module.scss";
import Input from "../primary/PrimaryInput";

const ScopeInput: FC<InputHTMLAttributes<HTMLInputElement>> = ((props) => {
  return (
    <div className={styles.scopeInputcontainer}>
      <label htmlFor={props["aria-description"]}>{props["aria-description"]}</label>
      <Input {...props} id={props['aria-description']}/>
    </div>
  );
});

export default ScopeInput;
