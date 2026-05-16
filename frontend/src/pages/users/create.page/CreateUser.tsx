import { ChangeEvent, FC, useCallback, useMemo } from "react";
import styles from "./CreateUser.module.scss";
import ScopeInput from "../../../ui/input/scopeInput/ScopeInput";
import Button from "../../../ui/buttons/primary/Button";
import {
  Controller,
  ControllerRenderProps,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import {
  capitalizeFirstLetter,
  hasAllValuesForKeys,
} from "../../../utils/functions/functions";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate } from "react-router-dom";
import { TCreateUser } from "../../../services/interfaces/Interfaces";
import { useCreateUser } from "../../../api/hooks/user/useCreateUser";
import { RouterPath } from "../../../router/Router";
import { useGetDeviceOptions } from "../../../api/hooks/device/useGetDeviceOptions";
import { message } from "antd";

interface INewUser {
  surname: string;
  name: string;
  middleName: string;
  deviceId: number;
  group: string;
}

const CreateUser: FC = () => {
  const nav = useNavigate();
  const {
    watch,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<INewUser>({
    mode: "onChange",
    defaultValues: {
      surname: "",
      name: "",
      middleName: "",
      group: "",
      deviceId: 0,
    },
  });
  const newUser = watch();

  const { mutateAsync: create_user, isPending: isLoadingCreate } =
    useCreateUser();

  const isDisabled = useMemo(
    () =>
      !hasAllValuesForKeys(newUser, [
        "surname",
        "name",
        "middleName",
        "deviceId",
      ]),
    [newUser]
  );

  const { devicesOptions, isLoadingDevices } = useGetDeviceOptions();

  const handleEnterFio = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      field: ControllerRenderProps<INewUser, keyof INewUser>
    ) => field.onChange(capitalizeFirstLetter(event.target.value)),
    []
  );

  const onSubmit: SubmitHandler<INewUser> = async (data) => {
    const formData: TCreateUser = {
      fio: `${data.surname.trim()} ${data.name.trim()} ${data.middleName.trim()}`,
      deviceId: data.deviceId,
      group: data.group,
    };

    await create_user(formData, {
      onSuccess: () => {
        reset();
        message.success("Пользователь успешно добавлен");
      },
      onError: () => {
        message.error("Не удалось добавить пользователя");
      },
    });
  };

  return (
    <main className={styles.createuserContainer}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <h1>Для добавления пользователя введите данные*:</h1>

        <div className={styles.field}>
          <Controller
            name="surname"
            control={control}
            rules={{ required: "Введите фамилию" }}
            render={({ field }) => (
              <ScopeInput
                inputProps={{
                  ...field,
                  onChange: (event) => handleEnterFio(event, field),
                }}
                ariaDescription="Фамилия"
              />
            )}
          />
          {errors.surname && (
            <span className={styles.error} role="alert">
              {errors.surname.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Введите имя" }}
            render={({ field }) => (
              <ScopeInput
                inputProps={{
                  ...field,
                  onChange: (event) => handleEnterFio(event, field),
                }}
                ariaDescription="Имя"
              />
            )}
          />
          {errors.name && (
            <span className={styles.error} role="alert">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <Controller
            name="middleName"
            control={control}
            rules={{ required: "Введите отчество" }}
            render={({ field }) => (
              <ScopeInput
                inputProps={{
                  ...field,
                  onChange: (event) => handleEnterFio(event, field),
                }}
                ariaDescription="Отчество"
              />
            )}
          />
          {errors.middleName && (
            <span className={styles.error} role="alert">
              {errors.middleName.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <Controller
            name="group"
            control={control}
            rules={{ required: "Введите группу" }}
            render={({ field }) => (
              <ScopeInput
                inputProps={{
                  ...field,
                  onChange: (event) => handleEnterFio(event, field),
                }}
                ariaDescription="Группа"
              />
            )}
          />
          {errors.group && (
            <span className={styles.error} role="alert">
              {errors.group.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <Controller
            name="deviceId"
            control={control}
            rules={{ required: "Выберите устройство" }}
            render={({ field }) => {
              const { ref, onChange, ...dropdownField } = field;
              return (
                <ScopeInput
                  dropdownProps={{
                    ...dropdownField,
                    value: field.value,
                    isLoading: isLoadingDevices,
                    isDropDown: true,
                    options: devicesOptions,
                    onChange: (device) => onChange(device.value),
                  }}
                  ariaDescription="Устройство"
                />
              );
            }}
          />
          {errors.deviceId && (
            <span className={styles.error} role="alert">
              {errors.deviceId.message}
            </span>
          )}
        </div>

        <Button
          disabled={isDisabled || isLoadingCreate}
          isLoading={isLoadingCreate}
          size="lg"
          style={{ marginTop: 8 }}
        >
          Добавить пользователя
        </Button>

        <Link onClick={() => nav(RouterPath.VIEW)}>
          Все пользователи <ArrowRight stroke="#14b8a6" />
        </Link>
      </form>

      <div className={styles.animation}>
        <svg viewBox="0 0 200 200" className={styles.animatedIcon} aria-hidden="true">
          <circle cx="100" cy="100" r="60" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="377" strokeDashoffset="100">
            <animate attributeName="stroke-dashoffset" values="377;0" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="40" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeDasharray="240" strokeDashoffset="0" opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;240" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </main>
  );
};

export default CreateUser;
