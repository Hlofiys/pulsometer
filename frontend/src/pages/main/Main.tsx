import { FC } from "react";
import styles from "./Main.module.scss";
import Button from "../../ui/buttons/primary/Button";
import AdditionalButton from "../../ui/buttons/additional/Button";
import DevicesList from "../../ui/devices/list/DevicesList";
import { useNavigate } from "react-router-dom";
import { useGetDevices } from "../../api/hooks/device/useGetDevices";
import { Spin } from "antd";
import { RouterPath } from "../../router/Router";
import Empty from "../../ui/empty/Empty";

const Main: FC = () => {
  const { data: devices, isLoading } = useGetDevices();
  const nav = useNavigate();

  const hasDevices = (devices?.data || []).length > 0;

  return (
    <main className={styles.mainContainer}>
      <section className={styles.hero}>
        <h1>Система мониторинга физиологических показателей обучающихся</h1>
        <p>
          Мониторинг жизненно важных показателей включает использование устройств,
          таких как пульсометр, для измерения состояния организма в режиме
          реального времени. Полученные данные отображаются на экране и помогают
          отслеживать изменения в различных режимах активности.
        </p>
        <div className={styles.actions}>
          <Button
            size="lg"
            onClick={() => nav(RouterPath.CREATE)}
          >
            Добавить пользователя
          </Button>
          <AdditionalButton
            size="lg"
            onClick={() => nav(RouterPath.VIEW)}
          >
            Все пользователи
          </AdditionalButton>
        </div>
      </section>

      <section className={styles.devicesSection}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spin size="large" />
            <span>Загрузка устройств...</span>
          </div>
        ) : hasDevices ? (
          <DevicesList
            onCardClick={(deviceId) => {
              nav(`${RouterPath.VIEW}/${deviceId}`);
            }}
            devices={devices?.data || []}
          />
        ) : (
          <Empty description="Нет подключенных устройств" />
        )}
      </section>
    </main>
  );
};

export default Main;
