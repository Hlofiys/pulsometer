import { FC, useMemo } from "react";
import styles from "./StartMeasurements.module.scss";
import { DeviceCard } from "../../../ui/devices/list/card/DeviceCard";
import { IOption } from "../../../ui/input/dropdown/Dropdown";
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

const options: IOption<number>[] = [
  { label: "Бег", value: 1 },
  { label: "Спортивная ходьба", value: 2 },
];

interface IStartMeasurements {
  userId: number;
  activityId: number;
}
const StartMeasurements: FC = () => {
  const nav = useNavigate();
  const { deviceId, userId } = useParams();

  const { data: users, isLoading: isLoadingUsers } = useGetUsers();
  const { mutateAsync: activate, isLoading: isLoadingActivate } =
    useActivateMeasurements();
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices();

  const { control, handleSubmit, reset, watch } = useForm<IStartMeasurements>({
    mode: "onChange",
    defaultValues: {
      userId: userId && +userId || 0,
      activityId: 0,
    },
  });
  const startParams = watch();

  const isDisabled = useMemo(
    () => !hasAllValuesForKeys(startParams, ["userId", "activityId"]),
    [startParams]
  );

  const onSubmit: SubmitHandler<IStartMeasurements> = async (data) => {
    const { userId } = data;

    await activate({
      activeUserId: userId,
      // deviceId: +deviceId!,
    }, {onSuccess: ()=>reset()} );
  };

  const activeDevice = useMemo(
    () => (devices?.data || []).find((device) => device.deviceId === +deviceId!),
    [devices, deviceId]
  );

  return (
    <div className={styles.startContainer}>
      {(isLoadingDevices && <Spin />) || (
        <DeviceCard isShowCard device={activeDevice!} />
      )}

      <section>
        <h1>Для запуска измерений выберите пользователя и вид активности:</h1>
        <form
          action=""
          className={styles.measurementsFormProps}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="userId"
            key={"userId"}
            control={control}
            render={({ field }) => {
              const { ref, onChange, ...dropdownField } = field;
              return (
                <ScopeInput
                  // inputProps={}
                  dropdownProps={{
                    ...dropdownField,
                    onChange: (option) => onChange(option.value),
                    isLoading: isLoadingUsers,
                    containersStyles: { width: "50%" },
                    isDropDown: true,
                    options:
                      users?.data.map((user) => ({
                        label: user.fio,
                        value: user.userId,
                      })) || [],
                  }}
                  ariaDescription={"Список всех пользователей"}
                />
              );
            }}
          />
          <Controller
            name="activityId"
            key={"activityId"}
            control={control}
            render={({ field }) => {
              const { ref, onChange, ...dropdownField } = field;
              return (
                <ScopeInput
                  dropdownProps={{
                    ...dropdownField,
                    onChange: (option) => onChange(option.value),
                    containersStyles: { width: "50%" },
                    isDropDown: true,
                    options: options,
                  }}
                  ariaDescription={"Вид активности"}
                />
              );
            }}
          />
        </form>
        <Button
          style={{ width: 300, height: 52 }}
          onClick={handleSubmit(onSubmit)}
          disabled={isDisabled}
          isLoading={isLoadingActivate}
        >
          Запустить измерения
        </Button>

        <Link onClick={() => nav(RouterPath.CREATE)}>
          Добавить пользователя <ArrowRight stroke="#23E70A" />
        </Link>
      </section>
    </div>
  );
};

export default StartMeasurements;
