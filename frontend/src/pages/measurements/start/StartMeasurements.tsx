import { FC } from "react";
import styles from "./StartMeasurements.module.scss";
import { DeviceCard } from "../../../ui/devices/list/card/DeviceCard";
import { IOption } from "../../../ui/input/dropdown/Dropdown";
import ScopeInput from "../../../ui/input/scopeInput/ScopeInput";
import Button from "../../../ui/buttons/primary/Button";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate } from "react-router-dom";
import { useGetUsers } from "../../../api/hooks/user/useGetUsers";

const options: IOption<string>[] = [
  { label: "Корнеюк Ольга Викторовна", value: "1" },
  { label: "Корнеева Анжелика Федоровна", value: "2" },
];

const StartMeasurements: FC = () => {
  const nav = useNavigate();

  const { data: users, isLoading: isLoadingUsers } = useGetUsers();

  return (
    <div className={styles.startContainer}>
      <DeviceCard
        isShowCard
        device={{
          id: 1,
          status: "off",
          activeUserId: 1,
          lastContact: "2024-11-14T18:44:54.585Z",
          users: [1],
        }}
      />

      <section>
        <h1>Для запуска измерений выберите пользователя и вид активности:</h1>
        <form action="" className={styles.measurementsFormProps}>
          <ScopeInput
            // inputProps={}
            dropdownProps={{
              isLoading: isLoadingUsers,
              containersStyles: { width: "50%" },
              isDropDown: true,
              options:
                users?.data.map((user) => ({
                  label: user.fio,
                  value: user.id,
                })) || [],
            }}
            ariaDescription={"Список всех пользователей"}
          />
          <ScopeInput
            // inputProps={}
            dropdownProps={{
              containersStyles: { width: "50%" },
              isDropDown: true,
              options: options,
            }}
            ariaDescription={"Вид активности"}
          />
        </form>

        <Button style={{ width: 300, height: 52 }}>Запустить измерения</Button>
        <Link onClick={() => nav("/create")}>
          Добавить пользователя <ArrowRight stroke="#23E70A" />
        </Link>
      </section>
    </div>
  );
};

export default StartMeasurements;
