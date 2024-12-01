import { FC, useMemo } from "react";
import styles from "./Main.module.scss";
import Button from "../../ui/buttons/primary/Button";
import AdditionalButton from "../../ui/buttons/additional/Button";
import DevicesList from "../../ui/devices/list/DevicesList";
import { useNavigate } from "react-router-dom";
import { useGetDevices } from "../../api/hooks/device/useGetDevices";
import { Spin } from "antd";
import { RouterPath } from "../../router/Router";
import Dropdown, { IOption } from "../../ui/input/dropdown/Dropdown";

const Main: FC = () => {
  const { data: devices, isLoading } = useGetDevices();
  const nav = useNavigate();

  const memoTestOptions = useMemo<IOption<number>[]>(
    () =>
      devices?.data.map((device) => ({
        label: `Пульсометр #${device.deviceId}`,
        value: device.deviceId,
      })) || [],
    [devices?.data]
  );
  return (
    <main className={styles.mainContainer}>
      <div style={{display: 'flex', alignItems: 'start', gap: 20}}>
        <Dropdown options={memoTestOptions} containersStyles={{ width: 200 }} value={1}/>
        <Dropdown options={memoTestOptions} containersStyles={{ width: 200 }} isHorizontal value={1}/>
      </div>
      <h1>Cистема мониторинга физиологических показателей обучающихся</h1>
      <p>
        Мониторинг жизненно важных показателей включает использование устройств,
        таких как пульсометр, для измерения состояния организма в режиме
        реального времени. Полученные данные отображаются на экране и помогают
        отслеживать изменения в различных режимах активности
      </p>
      <section>
        <Button
          style={{ width: 304, height: 52 }}
          onClick={() => nav(RouterPath.CREATE)}
        >
          Добавить пользователя
        </Button>
        <AdditionalButton
          style={{ width: 304, height: 52 }}
          onClick={() => nav(RouterPath.VIEW)}
        >
          Все пользователи
        </AdditionalButton>
      </section>

      {isLoading ? (
        <Spin />
      ) : (
        <DevicesList
          onCardClick={(deviceId) => {
            nav(`${RouterPath.VIEW}/${deviceId}`);
          }}
          devices={devices?.data || []}
          style={{ marginTop: 50 }}
        />
      )}
    </main>
  );
};

export default Main;
