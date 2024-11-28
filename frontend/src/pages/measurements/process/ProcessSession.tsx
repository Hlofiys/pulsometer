import { FC, useMemo } from "react";
import styles from "./ProcessSession.module.scss";
import Params from "./userParams/Params";
import Statistic from "./statistic/Statistic";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMeasurementsBySessionId } from "../../../api/hooks/session/useGetMeasurementsBySessionId";
import { useGetSessions } from "../../../api/hooks/session/useGetSessions";
import { useGetUserById } from "../../../api/hooks/user/useGetUserById";
import SkeletonParams from "./userParams/skeleton/Skeleton";
import { RouterPath } from "../../../router/Router";

const ProcessSession: FC = () => {
  const { userId, sessionId, startMeasurementTime } = useParams();
  const nav = useNavigate();

  const { data: measurements, isLoading: isLoadingMeasurements } =
    useGetMeasurementsBySessionId(+sessionId!);
  const { data: userSessions, isLoading: isLoadingSessions } = useGetSessions(
    +userId!
  );
  const { data: userData, isLoading: isLoadingUserData } = useGetUserById(
    +userId!
  );

  const dashboardData = useMemo(() => {
    const startTime = new Date(startMeasurementTime!).getTime();

    // Проверяем, есть ли элементы в массиве
    if (measurements?.data.length === 0) {
      return {
        dashboardParams: [],
        oxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        averageBpm: 0,
      };
    }

    const oxygen = measurements?.data[0].oxygen; // Значение oxygen неизменно
    const bpms = measurements?.data.map(({ bpm }) => bpm) || []; // Массив всех значений bpm

    const maxBpm = Math.max(...bpms); // Максимальное значение bpm
    const minBpm = Math.min(...bpms); // Минимальное значение bpm
    const averageBpm = bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length; // Среднее значение bpm

    const dashboardParams = measurements?.data.map(({ date, bpm }) => {
      const measurementTime = new Date(date).getTime();
      const secondsDiff = Math.round((startTime - measurementTime) / 1000); // Разница в секундах
      return { label: secondsDiff, value: bpm };
    });

    return {
      dashboardParams: dashboardParams || [],
      oxygen: oxygen || 0,
      maxBpm,
      minBpm,
      averageBpm: Math.round(averageBpm), // Округляем до целого
    };
  }, [measurements]);

  const paramSet = useMemo(() => {
    return [
      {
        label: "Сред. значение:",
        value: `${dashboardData.averageBpm} ударов/мин`,
      },
      {
        label: "Макс. значение:",
        value: `${dashboardData.maxBpm} ударов/мин`,
      },
      {
        label: "Мин. значение:",
        value: `${dashboardData.minBpm} ударов/мин`,
      },
      { label: "Кислород:", value: `${dashboardData.oxygen}%` },
    ];
  }, [dashboardData]);

  const activeSession = useMemo(
    () => userSessions?.data.find((user) => user.sessionId === +sessionId!),
    [sessionId, userSessions]
  );
  return (
    <div className={styles.mainProcessContainer}>
      <div className={styles.processMeasurementsContainer}>
        {isLoadingSessions || isLoadingUserData ? (
          <SkeletonParams />
        ) : (
          <Params
            fio={userData?.data.fio || ""}
            deviceId={userData?.data.deviceId || 0}
            activityType="Бег"
            time={activeSession?.passed || 0}
          />
        )}
        <Statistic
          dashboardData={dashboardData.dashboardParams}
          isLoading={isLoadingMeasurements}
          paramSet={paramSet}
        />
      </div>

      <section className={styles.buttons}>
        {/* <Button onClick={() => console.log(dashboardData.dashboardParams)}>
          Сохранить изменения:
        </Button> */}
        <Link onClick={() => nav(RouterPath.REVIEW_SESSION+`/${userId}`)}>
          Смотреть другие результаты <ArrowRight stroke="#23E70A" />
        </Link>
      </section>
    </div>
  );
};

export default ProcessSession;
