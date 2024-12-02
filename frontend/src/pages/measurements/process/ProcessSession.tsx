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
import Button from "../../../ui/buttons/primary/Button";
import { convertMilliseconds } from "../../../utils/functions/functions";

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
    // const startTime =new Date(convertTime(new Date(startMeasurementTime!))).getTime();
    // const startTime = new Date(startMeasurementTime!).getTime();
    // console.log(convertTime(new Date(startMeasurementTime!)))
    // Проверяем, есть ли элементы в массиве
    if (measurements?.length === 0) {
      return {
        dashboardParams: [],
        oxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        averageBpm: 0,
      };
    }

    const oxygen = measurements?.[0].oxygen; // Значение oxygen неизменно
    const bpms = measurements?.map(({ bpm }) => bpm) || []; // Массив всех значений bpm

    const maxBpm = Math.max(...bpms); // Максимальное значение bpm
    const minBpm = Math.min(...bpms); // Минимальное значение bpm
    const averageBpm = bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length; // Среднее значение bpm

    const dashboardParams = measurements?.map(({ date, bpm }) => {
      const measurementTime = new Date(date).getTime();
      // console.log('measurementTim: ', measurementTime, "startTime: ", startTime, startTime - measurementTime)
      const secondsDiff = Math.round((measurementTime - startTime)); // Разница в секундах
      return { label: convertMilliseconds(secondsDiff).totalSeconds, value: bpm };
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
    () => userSessions?.find((user) => user.sessionId === +sessionId!),
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
            time={!!activeSession?.passed && (activeSession!.passed - 3 * 60 * 60 * 1000) || 0}
          />
        )}
        <Statistic
          dashboardData={dashboardData.dashboardParams}
          isLoading={isLoadingMeasurements}
          paramSet={paramSet}
        />
      </div>

      <section className={styles.buttons}>
        <Button onClick={() => console.log(dashboardData.dashboardParams[5], convertMilliseconds(dashboardData.dashboardParams[5].label * 1000))}>
          Сохранить изменения:
        </Button>
        <Link onClick={() => nav(RouterPath.REVIEW_SESSION+`/${userId}`)}>
          Смотреть другие результаты <ArrowRight stroke="#23E70A" />
        </Link>
      </section>
    </div>
  );
};

export default ProcessSession;
