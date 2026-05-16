import { FC, useMemo } from "react";
import styles from "./StartMeasurements.module.scss";
import { DeviceCard } from "../../../ui/devices/list/card/DeviceCard";
import ScopeInput from "../../../ui/input/scopeInput/ScopeInput";
import Button from "../../../ui/buttons/primary/Button";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUsers } from "../../../api/hooks/user/useGetUsers";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { hasAllValuesForKeys } from "../../../utils/functions/functions";
import { useGetDevices } from "../../../api/hooks/device/useGetDevices";
import { Spin } from "antd";
import { useActivateMeasurements } from "../../../api/hooks/device/useActivateMeasurements";
import { RouterPath } from "../../../router/Router";
import { IOption } from "../../../ui/input/dropdown/Dropdown";

interface IStartMeasurements {
  userId: number;
  typeActivity: string;
}

const StartMeasurements: FC = () => {
  const nav = useNavigate();
  const { deviceId, userId } = useParams();

  const { data: users, isLoading: isLoadingUsers } = useGetUsers();
  const { mutateAsync: activate, isPending: isLoadingActivate } =
    useActivateMeasurements();
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IStartMeasurements>({
    mode: "onChange",
    defaultValues: {
      userId: (userId && +userId) || 0,
      typeActivity: "",
    },
  });
  const startParams = watch();

  const isDisabled = useMemo(
    () => !hasAllValuesForKeys(startParams, ["userId", "typeActivity"]),
    [startParams]
  );

  const onSubmit: SubmitHandler<IStartMeasurements> = async (data) => {
    const { userId, typeActivity } = data;

    await activate(
      {
        userId,
        typeActivity: typeActivity.trim(),
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const activeDevice = useMemo(
    () =>
      (devices?.data || []).find((device) => device.deviceId === +deviceId!),
    [devices, deviceId]
  );

  const userOptions = useMemo(
    () =>
      (!!deviceId &&
        !!users &&
        users.data
          .filter((user) => user.deviceId === +deviceId)
          .map((user) => ({
            label: user.fio,
            value: user.userId,
          }))) ||
      [],
    [deviceId, users]
  );

  const activityTypes: IOption<string>[] = useMemo(() => {
    return [
      {
        label: "Баскетбол",
        value: "Баскетбол",
      },
    ];
  }, []);

  return (
    <div className={styles.startContainer}>
      {(isLoadingDevices && (
        <div className={styles.deviceLoader}>
          <Spin size="large" />
        </div>
      )) || <DeviceCard isShowCard device={activeDevice!} />}

      <section className={styles.formSection}>
        <h1>Для запуска измерений выберите пользователя и вид активности:</h1>

        <form
          className={styles.measurementsForm}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className={styles.field}>
            <Controller
              name="userId"
              control={control}
              rules={{ required: "Выберите пользователя" }}
              render={({ field }) => {
                const { ref, onChange, ...dropdownField } = field;
                return (
                  <ScopeInput
                    dropdownProps={{
                      ...dropdownField,
                      onChange: (option) => onChange(option.value),
                      isLoading: isLoadingUsers,
                      isDropDown: true,
                      options: userOptions,
                    }}
                    ariaDescription="Список всех пользователей"
                  />
                );
              }}
            />
            {errors.userId && (
              <span className={styles.error} role="alert">
                {errors.userId.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <Controller
              name="typeActivity"
              control={control}
              rules={{ required: "Выберите вид активности" }}
              render={({ field }) => {
                const { ref, onChange, ...dropdownField } = field;
                return (
                  <ScopeInput
                    dropdownProps={{
                      ...dropdownField,
                      onChange: (option) => onChange(option.value),
                      isLoading: isLoadingUsers,
                      isDropDown: true,
                      options: activityTypes,
                    }}
                    ariaDescription="Вид активности"
                  />
                );
              }}
            />
            {errors.typeActivity && (
              <span className={styles.error} role="alert">
                {errors.typeActivity.message}
              </span>
            )}
          </div>
        </form>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isDisabled}
          isLoading={isLoadingActivate}
          size="lg"
        >
          Запустить измерения
        </Button>

        <Link onClick={() => nav(RouterPath.CREATE)}>
          Добавить пользователя <ArrowRight stroke="#14b8a6" />
        </Link>
      </section>
    </div>
  );
};

export default StartMeasurements;
