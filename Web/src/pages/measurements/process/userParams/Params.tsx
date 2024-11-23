import { FC } from "react";
import styles from "./Params.module.scss";
import { convertMilliseconds } from "../../../../utils/functions/functions";

interface IParamsProps {
  fio: string;
  deviceId: number;
  activityType: string;
  time: number; //in milliseconds
}
const Params: FC<IParamsProps> = (props) => {
  const { fio, deviceId, activityType, time } = props;

  return (
    <aside className={styles.userParamsContainer}>
      <h1 className={styles.username}>{fio}</h1>
      <p className={styles.rowOption}>
        Устройство: <span className={styles.greenBorder}>Пульсометр #{deviceId}</span>
      </p>
      <p className={styles.rowOption}>
        Вид активности: <span>{activityType}</span>
      </p>
      <p className={styles.columnOption} style={{ marginTop: 30 }}>
        Время: <span>{convertMilliseconds(time).totalTime}</span>
      </p>
    </aside>
  );
};

export default Params;
