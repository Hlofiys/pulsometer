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
import Lottie from "lottie-react";
import CreateUserAnimation from "../../../assets/animation/createUser/CreateUser.json";

interface INewUser {
  surname: string;
  name: string;
  middleName: string;
  deviceId: number;
  group: string;
}
const CreateUser: FC = () => {
  const nav = useNavigate();
  const { watch, control, handleSubmit, reset } = useForm<INewUser>({
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

  const { mutateAsync: create_user, isLoading: isLoadingCreate } =
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

  const useEnterFio = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      field: ControllerRenderProps<INewUser, keyof INewUser>
    ) => field.onChange(capitalizeFirstLetter(event.target.value)),
    [capitalizeFirstLetter]
  );

  const onSubmit: SubmitHandler<INewUser> = (data) => {
    const formData: TCreateUser = {
      fio: `${data.surname.trim()} ${data.name.trim()} ${data.middleName.trim()}`,
      deviceId: data.deviceId,
      group: data.group,
    };

    create_user(formData, { onSuccess: () => reset() });
  };

  return (
    <main className={styles.createuserContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Для добавления пользователя введите данные*: </h1>
        <Controller
          name="surname"
          control={control}
          render={({ field }) => (
            <ScopeInput
              inputProps={{
                ...field,
                onChange: (event) => useEnterFio(event, field),
              }}
              ariaDescription={"Фамилия"}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <ScopeInput
              inputProps={{
                ...field,
                onChange: (event) => useEnterFio(event, field),
              }}
              ariaDescription={"Имя"}
            />
          )}
        />
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <ScopeInput
              inputProps={{
                ...field,
                onChange: (event) => useEnterFio(event, field),
              }}
              ariaDescription={"Отчество"}
            />
          )}
        />
        
        <Controller
          name="group"
          control={control}
          render={({ field }) => (
            <ScopeInput
              inputProps={{
                ...field,
                onChange: (event) => useEnterFio(event, field),
              }}
              ariaDescription={"Группа"}
            />
          )}
        />

        <Controller
          name="deviceId"
          control={control}
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
                ariaDescription={"Устройство"}
              />
            );
          }}
        />

        <Button
          style={{ marginTop: 20, height: 45 }}
          disabled={isDisabled || isLoadingCreate}
          isLoading={isLoadingCreate}
        >
          Добавить пользователя
        </Button>
        <Link onClick={() => nav(RouterPath.VIEW)}>
          Все пользователи <ArrowRight stroke="#23E70A" />
        </Link>
      </form>

      <Lottie
        animationData={CreateUserAnimation}
        loop={true}
        className={styles.section}
      />
    </main>
  );
};

export default CreateUser;
