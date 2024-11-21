import { FC } from "react";
import styles from "./Main.module.scss";
import Button from "../../ui/buttons/primary/Button";
import AdditionalButton from "../../ui/buttons/additional/Button";
import DevicesList from "../../ui/devices/list/DevicesList";
import { useNavigate } from "react-router-dom";

const Main: FC = () => {
  const nav = useNavigate();
  return (
    <main className={styles.mainContainer}>
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
          onClick={() => nav("/create")}
        >
          Добавить пользователя
        </Button>
        <AdditionalButton
          style={{ width: 304, height: 52 }}
          onClick={() => nav("/view")}
        >
          Все пользователи
        </AdditionalButton>
      </section>

      <DevicesList style={{ marginTop: 50 }} />
    </main>
  );
};

export default Main;
