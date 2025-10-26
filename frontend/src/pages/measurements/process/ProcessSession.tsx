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
import {
  calculateHeartRateDeltaZones,
  convertMilliseconds,
} from "../../../utils/functions/functions";
import { useGetSessionById } from "../../../api/hooks/session/useSessionById";
import { useDeactivateMeasurements } from "../../../api/hooks/device/useDeactivateMeasurements";
import { IMeasurements } from "../../../services/interfaces/Interfaces";
import { useSSEOptions } from "../../../api/hooks/sse/useSSEOptions";
import ResultTable, { HeartRateData } from "../../../ui/table/ResultTable";
// import { ContactsFilled } from "@ant-design/icons";

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
      const measurements = (JSON.parse(event.data) as IMeasurements[]).filter(
        (el) => !!sessionId && el.sessionId === +sessionId
      );
      console.log("Новое сообщение:", JSON.parse(event.data));
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
      console.log("start sse");
      start();
    }
  }, [activeSession?.data]);

  useEffect(() => {
    if (!sessionId) return;

    const sessionMeasurements = (measurements || [])?.filter(
      (measurement) => measurement.sessionId === +sessionId
    );

    console.log('filtered data: ', sessionMeasurements)

    // const additionalMeasurements = [
    //   {
    //     measurementId: 2060,
    //     bpm: 76,
    //     oxygen: 98,
    //     date: "2025-10-14T14:31:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2063,
    //     bpm: 78,
    //     oxygen: 98,
    //     date: "2025-10-14T14:33:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2067,
    //     bpm: 81,
    //     oxygen: 98,
    //     date: "2025-10-14T14:34:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2072,
    //     bpm: 79,
    //     oxygen: 98,
    //     date: "2025-10-14T14:35:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2076,
    //     bpm: 82,
    //     oxygen: 98,
    //     date: "2025-10-14T14:36:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2081,
    //     bpm: 84,
    //     oxygen: 98,
    //     date: "2025-10-14T14:37:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2087,
    //     bpm: 83,
    //     oxygen: 98,
    //     date: "2025-10-14T14:38:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2092,
    //     bpm: 91,
    //     oxygen: 98,
    //     date: "2025-10-14T14:39:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2098,
    //     bpm: 110,
    //     oxygen: 98,
    //     date: "2025-10-14T14:40:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2105,
    //     bpm: 121,
    //     oxygen: 98,
    //     date: "2025-10-14T14:41:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2110,
    //     bpm: 130,
    //     oxygen: 98,
    //     date: "2025-10-14T14:42:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2115,
    //     bpm: 140,
    //     oxygen: 98,
    //     date: "2025-10-14T14:43:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2120,
    //     bpm: 136,
    //     oxygen: 98,
    //     date: "2025-10-14T14:44:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2125,
    //     bpm: 137,
    //     oxygen: 98,
    //     date: "2025-10-14T14:45:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2130,
    //     bpm: 138,
    //     oxygen: 98,
    //     date: "2025-10-14T14:46:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2135,
    //     bpm: 139,
    //     oxygen: 98,
    //     date: "2025-10-14T14:47:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2140,
    //     bpm: 150,
    //     oxygen: 98,
    //     date: "2025-10-14T14:48:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2145,
    //     bpm: 160,
    //     oxygen: 98,
    //     date: "2025-10-14T14:49:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2150,
    //     bpm: 180,
    //     oxygen: 98,
    //     date: "2025-10-14T14:50:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2155,
    //     bpm: 185,
    //     oxygen: 98,
    //     date: "2025-10-14T14:51:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2160,
    //     bpm: 190,
    //     oxygen: 98,
    //     date: "2025-10-14T14:52:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2165,
    //     bpm: 180,
    //     oxygen: 98,
    //     date: "2025-10-14T14:53:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2170,
    //     bpm: 170,
    //     oxygen: 98,
    //     date: "2025-10-14T14:54:40",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2175,
    //     bpm: 160,
    //     oxygen: 98,
    //     date: "2025-10-14T14:55:55",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2180,
    //     bpm: 150,
    //     oxygen: 98,
    //     date: "2025-10-14T14:56:10",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2185,
    //     bpm: 140,
    //     oxygen: 98,
    //     date: "2025-10-14T14:57:25",
    //     sessionId: 282,
    //   },
    //   {
    //     measurementId: 2185,
    //     bpm: 140,
    //     oxygen: 98,
    //     date: "2025-10-14T14:58:25",
    //     sessionId: 283,
    //   },
    // ];

    setLocalMeasurements([
      ...sessionMeasurements /*, ...additionalMeasurements*/,
    ]);
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
    } else {
      return;
    }
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
            onClick={() =>
              deactivate(activeSession?.data.userId || 0, {
                onSuccess: () => refetch(),
              })
            }
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
        Смотреть другие результаты <ArrowRight stroke="#23E70A" />
      </Link>
    </div>
  );
};

export default ProcessSession;
