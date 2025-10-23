import { FC, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Params.module.scss";
import { convertMilliseconds } from "../../../../utils/functions/functions";
import { ISession } from "../../../../services/interfaces/Interfaces";
import Switch from "../../../../ui/switch/Switch";
import SessionPointList from "../../../../ui/sessionPointsList/SessionPointsList";
import { useParams } from "react-router-dom";
import { useGetSessionKeypoints } from "../../../../api/hooks/session/useGetSessionPoints";

interface IParamsProps {
  fio: string;
  deviceId: number;
  session?: ISession;
  time?: number;
}

const Params: FC<IParamsProps> = ({ fio, deviceId, session, time }) => {
  const { sessionId } = useParams();

  const { data: keypoints } = useGetSessionKeypoints(sessionId);
  const [showTable, setShowTable] = useState<"info" | "pointsTable">("info");

  const isLive = useMemo(() => session?.sessionStatus === "Open", [session]);

  const animationProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  };

  return (
    <aside className={styles.userParamsContainer}>
      {/* Switch для переключения */}
      {!isLive && (
        <Switch
          options={{
            info: {
              label: "Информация пользователя",
            },
            pointsTable: {
              label: "Таблица контрольных точек",
            },
          }}
          onChange={(option) => setShowTable(option)}
        />
      )}

      <AnimatePresence mode="wait">
        {showTable === "info" ? (
          <motion.div key="info" {...animationProps}>
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
                  <span
                    className={`${styles.liveIndicator} ${styles.liveStatus}`}
                  >
                    live
                  </span>
                )}
                <span className={isLive ? styles.liveStatus : ""}>
                  {!!session
                    ? convertMilliseconds({
                        ms: (!!time ? time : session.passed) || 0,
                        isLive,
                      }).formatNumberTime
                    : "00:00"}
                </span>
              </p>
            </article>
          </motion.div>
        ) : (
          <motion.div key="table" {...animationProps}>
            <SessionPointList points={keypoints?.data || []} />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Params;
