import { FC, useMemo } from "react";
import styles from "./Params.module.scss";
import { convertMilliseconds } from "../../../../utils/functions/functions";
import { ISession } from "../../../../services/interfaces/Interfaces";

interface IParamsProps {
  fio: string;
  deviceId: number;
  session?: ISession;
}
const Params: FC<IParamsProps> = (props) => {
  const { fio, deviceId, session } = props;

  const isLive = useMemo(() => {
    return session?.sessionStatus === "Open";
  }, [session]);

  return (
    <aside className={styles.userParamsContainer}>
      <h1 className={styles.username}>{fio}</h1>
      <p className={styles.rowOption}>
        Устройство:{" "}
        <span className={styles.greenBorder}>Пульсометр #{deviceId}</span>
      </p>
      <p className={styles.rowOption}>
        Вид активности: <span>{session?.typeActivity || "-//-"}</span>
      </p>
      <article className={styles.columnOption} style={{ marginTop: 30 }}>
        Время:{" "}
        <p>
          {isLive && (
            <span className={`${styles.liveIndicator} ${styles.liveStatus}}`}>
              live
            </span>
          )}
          <span className={isLive ? styles.liveStatus : ""}>
            {!!session
              ? convertMilliseconds({
                  ms:
                    (!!session.passed && session.passed - 3 * 60 * 60 * 1000) ||
                    0,
                  isLive,
                }).formatNumberTime
              : "00:00"}
          </span>
        </p>
      </article>
    </aside>
  );
};

export default Params;
