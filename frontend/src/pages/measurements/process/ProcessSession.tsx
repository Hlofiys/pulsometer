import { FC, useEffect, useMemo, useState, useCallback } from "react";
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
import {
  calculateHeartRateDeltaZones,
  convertMilliseconds,
} from "../../../utils/functions/functions";
import { useGetSessionById } from "../../../api/hooks/session/useSessionById";
import { useDeactivateMeasurements } from "../../../api/hooks/device/useDeactivateMeasurements";
import { IMeasurements } from "../../../services/interfaces/Interfaces";
import { useSSEOptions } from "../../../api/hooks/sse/useSSEOptions";
import ResultTable, { HeartRateData } from "../../../ui/table/ResultTable";
import { useAlert } from "../../../context/alert/AlertProvider";

const ProcessSession: FC = () => {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const { showAlert, hideAlert } = useAlert();
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

  const { mutateAsync: deactivate, isPending: isLoadingDeactivate } =
    useDeactivateMeasurements();

  const { start } = useSSEOptions("https://pulse.hlofiys.xyz/sse/data", {
    onMessage: (event: MessageEvent) => {
      const measurements = (JSON.parse(event.data) as IMeasurements[]).filter(
        (el) => !!sessionId && el.sessionId === +sessionId
      );
      setLocalMeasurements((pre) =>
        !!measurements.length ? measurements : pre
      );
    },
    onError: (error: Event) => {
      console.error("Ошибка SSE:", error);
    },
    onOpen: () => {
      console.log("Соединение установлено");
    },
  });

  useEffect(() => {
    if (activeSession?.data.sessionStatus === "Open") {
      start();
    }
  }, [activeSession?.data, start]);

  useEffect(() => {
    if (!sessionId) return;

    const sessionMeasurements = (measurements || [])?.filter(
      (measurement) => measurement.sessionId === +sessionId
    );

    setLocalMeasurements([...sessionMeasurements]);
  }, [measurements, sessionId]);

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

    const dashboardParams = localMeasurements?.map(
      ({ date, bpm, measurementId }) => {
        const measurementTime = new Date(date).getTime();
        const secondsDiff = Math.round(measurementTime - startTime);
        return {
          label: convertMilliseconds({ ms: secondsDiff }).totalSeconds / 60,
          value: bpm,
          measurementId,
        };
      }
    );

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

  const activeTime = useMemo(() => {
    if (
      activeSession?.data.sessionStatus === "Open" &&
      localMeasurements.length !== 0
    ) {
      const timeStartMeasurements = new Date(
        activeSession?.data.time || ""
      ).getTime();
      const timeLastMeasurement = new Date(
        localMeasurements[localMeasurements.length - 1].date
      ).getTime();
      return timeLastMeasurement - timeStartMeasurements;
    }
    return;
  }, [localMeasurements, activeSession?.data]);

  const tableData: Partial<HeartRateData> = useMemo(() => {
    const { introductory, preparatory, main, final } =
      calculateHeartRateDeltaZones(dashboardData.dashboardParams);

    return {
      fullName: userData?.data.fio || "",
      initial: introductory?.delta,
      afterWarmUp: preparatory?.delta,
      mainPart: main?.delta,
      afterMain: final?.delta,
      afterFiveMin: 0,
    };
  }, [
    dashboardData.dashboardParams,
    userData?.data.fio,
    calculateHeartRateDeltaZones,
  ]);

  const handleStop = useCallback(() => {
    showAlert({
      title: "Остановить измерения?",
      closableOverlay: true,
      buttons: [
        {
          text: "Отмена",
          type: "cancel",
          onClick: hideAlert,
        },
        {
          text: "Остановить",
          type: "destructive",
          onClick: async () => {
            await deactivate(activeSession?.data.userId || 0, {
              onSuccess: () => refetch(),
            });
          },
        },
      ],
    });
  }, [showAlert, hideAlert, deactivate, activeSession?.data.userId, refetch]);

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
            time={activeTime}
          />
        )}
        <Statistic
          dashboardData={dashboardData.dashboardParams}
          isLoading={isLoadingMeasurements || isLoadingActiveSession}
          paramSet={paramSet}
          sessionStatus={activeSession?.data.sessionStatus ?? "Closed"}
        />
      </div>

      <section className={styles.buttons}>
        {activeSession?.data.sessionStatus === "Open" && (
          <Button
            isLoading={isLoadingDeactivate}
            disabled={isLoadingDeactivate}
            onClick={handleStop}
            variant="danger"
            size="lg"
          >
            Остановить измерения
          </Button>
        )}
      </section>

      <ResultTable data={tableData} />

      <Link
        onClick={() =>
          nav(RouterPath.REVIEW_SESSION + `/${activeSession?.data.userId}`)
        }
      >
        Смотреть другие результаты <ArrowRight stroke="#14b8a6" />
      </Link>
    </div>
  );
};

export default ProcessSession;
