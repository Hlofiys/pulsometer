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
import useWebSocket from "react-use-websocket";
import { IMeasurements } from "../../../services/interfaces/Interfaces";

const ProcessSession: FC = () => {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [localMeasurements, setLocalMeasurements] = useState<IMeasurements[]>(
    []
  );
  const [shouldConnect, setShouldConnect] = useState(false);

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

  // Настройка WebSocket
  const { lastMessage } = useWebSocket(
    shouldConnect ? "wss://pulse.hlofiys.xyz/ws/data" : null,
    {
      shouldReconnect: () => true,
      onMessage: ({ data }) => {
        console.log(data);
      },
      onOpen: () => {
        console.log("Open data socket!");
      },
      onClose: () => {
        console.log("Close data socket!");
      },
      onError: () => {
        console.log("Error data status!");
      },
      reconnectAttempts: 10,
      reconnectInterval: 5000,
    }
  );

  // Обработка данных WebSocket
  useEffect(() => {
    if (!!lastMessage?.data&&lastMessage.data!=='ping') {
      if (Array.isArray(JSON.parse(lastMessage.data))) {
        setLocalMeasurements(
          (JSON.parse(lastMessage.data) as IMeasurements[])
        );
      }
      
    }
  }, [lastMessage]);

  useEffect(() => setLocalMeasurements(measurements || []), [measurements]);

  // Управление подключением WebSocket
  useEffect(() => {
    setShouldConnect(activeSession?.data.sessionStatus === "Open");
  }, [activeSession?.data.sessionStatus]);

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
    const averageOxygen =
      Math.round(oxygens.reduce((sum, bpm) => sum + bpm, 0) / oxygens.length);

    const dashboardParams = localMeasurements?.map(({ date, bpm }) => {
      const measurementTime = new Date(date).getTime();
      const secondsDiff = Math.round(measurementTime - startTime);
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
      averageBpm: Math.round(averageBpm),
    };
  }, [ activeSession?.data, localMeasurements, isLoadingActiveSession]);

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
