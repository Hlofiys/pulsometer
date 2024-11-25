import { FC, useMemo } from "react";
import styles from "./CreateUser.module.scss";
import ScopeInput from "../../../ui/input/scopeInput/ScopeInput";
import Button from "../../../ui/buttons/primary/Button";
import { Controller, useForm } from "react-hook-form";
import { hasAllValuesForKeys } from "../../../utils/functions/functions";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate } from "react-router-dom";

interface INewUser {
  surname: string;
  name: string;
  middleName: string;
}
const CreateUser: FC = () => {
  const nav = useNavigate();
  const { watch, control } = useForm<INewUser>({
    mode: "onChange",
    defaultValues: {
      surname: "",
      name: "",
      middleName: "",
    },
  });
  const newUser = watch();

  const isDisabled = useMemo(
    () => !hasAllValuesForKeys(newUser, ["surname", "name", "middleName"]),
    [newUser]
  );
  return (
    <main className={styles.createuserContainer}>
      <form>
        <h1>Для добавления пользователя введите данные*: </h1>
        <Controller
          name="surname"
          control={control}
          render={({ field }) => (
            <ScopeInput {...field} aria-description="Фамилия" />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <ScopeInput {...field} aria-description="Имя" />
          )}
        />
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <ScopeInput {...field} aria-description="Отчество" />
          )}
        />

        <Button style={{ marginTop: 20, height: 45 }} disabled={isDisabled}>
          Добавить пользователя
        </Button>
        <Link onClick={() => nav("/view")}>
          Все пользователи <ArrowRight stroke="#23E70A" />
        </Link>
      </form>
      <section className={styles.section}></section>
    </main>
  );
};

export default CreateUser;
