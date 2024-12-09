import { FC, useEffect, useMemo, useState } from "react";
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
import { IMeasurements } from "../../../services/interfaces/Interfaces";
import { useSSEOptions } from "../../../api/hooks/sse/useSSEOptions";

const ProcessSession: FC = () => {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [localMeasurements, setLocalMeasurements] = useState<IMeasurements[]>(
    []
  );

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

  const { start } = useSSEOptions("https://pulse.hlofiys.xyz/sse/data", {
    onMessage: (event: MessageEvent) => {
      console.log("Новое сообщение:", JSON.parse(event.data));
      setLocalMeasurements(JSON.parse(event.data));
    },
    onError: (error: Event) => {
      console.error("Ошибка SSE:", error);
    },
    onOpen: () => {
      console.log("Соединение установлено");
    },
  });

  useEffect(() => {
    console.log("start sse");
    start();
  }, []);

  useEffect(() => setLocalMeasurements(measurements || []), [measurements]);

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

    if (localMeasurements?.length === 0) {
      return {
        dashboardParams: [],
        oxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        averageBpm: 0,
      };
    }

    const bpms = localMeasurements?.map(({ bpm }) => bpm) || [];
    const oxygens = localMeasurements?.map(({ oxygen }) => oxygen) || [];

    const maxBpm = Math.max(...bpms);
    const minBpm = Math.min(...bpms);
    const averageBpm = bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length;
    const averageOxygen = Math.round(
      oxygens.reduce((sum, bpm) => sum + bpm, 0) / oxygens.length
    );

    const dashboardParams = localMeasurements?.map(({ date, bpm }) => {
      const measurementTime = new Date(date).getTime();
      const secondsDiff = Math.round(measurementTime - startTime);
      return {
        label: convertMilliseconds({ ms: secondsDiff }).totalSeconds,
        value: bpm,
      };
    });

    return {
      dashboardParams: dashboardParams || [],
      oxygen: averageOxygen || 0,
      maxBpm,
      minBpm,
      averageBpm: Math.round(averageBpm),
    };
  }, [activeSession?.data, localMeasurements, isLoadingActiveSession]);

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
            session={activeSession?.data}
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
