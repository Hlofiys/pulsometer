import { FC, useMemo } from "react";
import styles from "./ProcessSession.module.scss";
import Params from "./userParams/Params";
import Statistic from "./statistic/Statistic";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMeasurementsBySessionId } from "../../../api/hooks/session/useGetMeasurementsBySessionId";
import { useGetUserById } from "../../../api/hooks/user/useGetUserById";
import SkeletonParams from "./userParams/skeleton/Skeleton";
import { RouterPath } from "../../../router/Router";
import Button from "../../../ui/buttons/primary/Button";
import { convertMilliseconds } from "../../../utils/functions/functions";
import { useGetSessionById } from "../../../api/hooks/session/useSessionById";
import { useDeactivateMeasurements } from "../../../api/hooks/device/useDeactivateMeasurements";
// import useWebSocket from "react-use-websocket";

const ProcessSession: FC = () => {
  const { sessionId } = useParams();
  const nav = useNavigate();
  // const [localMeasurements, setLocalMeasurements] = useState<IMeasurements[]>(
  //   []
  // );

  const { data: measurements, isLoading: isLoadingMeasurements } =
    useGetMeasurementsBySessionId(+sessionId!);

  const {
    data: activeSession,
    isLoading: isLoadingActiveSession,
    refetch,
  } = useGetSessionById(+sessionId!);

  const { data: userData, isLoading: isLoadingUserData } = useGetUserById(
    activeSession?.data.userId || 0,
    !isLoadingActiveSession
  );

  const { mutateAsync: deactivate, isLoading: isLoadingDeactivate } =
    useDeactivateMeasurements();

  // useEffect(()=>{
  //   activeSession?.data.sessionStatus === "Open" &&
  //     useWebSocket("wss://pulse.hlofiys.xyz/ws/data", {
  //       shouldReconnect: () => true, // Попытки переподключения
  //       onMessage: (data) => {
  //         (JSON.parse(data.data) as IMeasurements[])
  //           setLocalMeasurements(JSON.parse(data.data));
  //       },
  //       reconnectAttempts: 10,
  //       reconnectInterval: 5000, // Интервал между попытками
  //     });

  // }, [activeSession?.data]);

  const dashboardData = useMemo(() => {
    if (!!activeSession?.data && isLoadingActiveSession) {
      return {
        dashboardParams: [],
        oxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        averageBpm: 0,
      };
    }

    const startTime = new Date(activeSession?.data.time || "").getTime();

    if (measurements?.length === 0) {
      return {
        dashboardParams: [],
        oxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        averageBpm: 0,
      };
    }

    const bpms = measurements?.map(({ bpm }) => bpm) || []; // Массив всех значений bpm
    const oxygens = measurements?.map(({ oxygen }) => oxygen) || []; // Массив всех значений bpm

    const maxBpm = Math.max(...bpms); // Максимальное значение bpm
    const minBpm = Math.min(...bpms); // Минимальное значение bpm
    const averageBpm = bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length; // Среднее значение bpm
    const averageOxygen =
      oxygens.reduce((sum, bpm) => sum + bpm, 0) / oxygens.length; // Среднее значение oxygen

    const dashboardParams = measurements?.map(({ date, bpm }) => {
      const measurementTime = new Date(date).getTime();
      // console.log('measurementTim: ', measurementTime, "startTime: ", startTime, startTime - measurementTime)
      const secondsDiff = Math.round(measurementTime - startTime); // Разница в секундах
      return {
        label: convertMilliseconds(secondsDiff).totalSeconds,
        value: bpm,
      };
    });

    return {
      dashboardParams: dashboardParams || [],
      oxygen: averageOxygen || 0,
      maxBpm,
      minBpm,
      averageBpm: Math.round(averageBpm), // Округляем до целого
    };
  }, [measurements, activeSession?.data, isLoadingActiveSession]);

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

  return (
    <div className={styles.mainProcessContainer}>
      <div className={styles.processMeasurementsContainer}>
        {isLoadingActiveSession || isLoadingUserData ? (
          <SkeletonParams />
        ) : (
          <Params
            fio={userData?.data.fio || ""}
            deviceId={userData?.data.deviceId || 0}
            activityType={activeSession?.data.typeActivity.trim() || ""}
            time={
              (!!activeSession?.data.passed &&
                activeSession!.data.passed - 3 * 60 * 60 * 1000) ||
              0
            }
          />
        )}
        <Statistic
          dashboardData={dashboardData.dashboardParams}
          isLoading={isLoadingMeasurements || isLoadingActiveSession}
          paramSet={paramSet}
        />
      </div>

      <section className={styles.buttons}>
        {activeSession?.data.sessionStatus === "Open" && (
          <Button
            isLoading={isLoadingDeactivate}
            disabled={isLoadingDeactivate}
            onClick={() =>
              deactivate(activeSession?.data.userId || 0, {
                onSuccess: () => refetch(),
              })
            }
          >
            Остановить измерения
          </Button>
        )}
        <Link
          onClick={() =>
            nav(RouterPath.REVIEW_SESSION + `/${activeSession?.data.userId}`)
          }
        >
          Смотреть другие результаты <ArrowRight stroke="#23E70A" />
        </Link>
      </section>
    </div>
  );
};

export default ProcessSession;
