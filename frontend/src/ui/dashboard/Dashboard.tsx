import { FC, useEffect, useMemo, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Filler,
  PointElement,
} from "chart.js";
import type { ChartData, ChartOptions, Plugin } from "chart.js";
import styles from "./Dashboard.module.scss";
import { convertMilliseconds } from "../../utils/functions/functions";
import Switch from "../switch/Switch";
import {
  ISessionPoint,
  TSessionStatus,
} from "../../services/interfaces/Interfaces";
import { useAlert } from "../../context/alert/AlertProvider";
import { TimePeriodView } from "../timePeriod/TimePeriodView";
import { useParams } from "react-router-dom";
import { useGetSessionKeypoints } from "../../api/hooks/session/useGetSessionPoints";
import { useHoverKeypont } from "../../context/hoverKeypoint/HoverKeypointContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Filler,
  PointElement
);

export interface IDashboardData {
  labels: number[];
  values: number[];
  measurementIds: number[];
}

interface DashboardProps {
  dashboardData: IDashboardData;
  sessionStatus?: TSessionStatus;
  containerStyles?: React.CSSProperties;
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface MyChartPoint {
  x: number;
  y: number;
  id: number;
}

const Dashboard: FC<DashboardProps> = ({
  dashboardData,
  containerStyles,
  xAxisLabel,
  yAxisLabel,
  sessionStatus,
}) => {
  const { sessionId } = useParams();
  const { chartRef, hoveredAreasRef } = useHoverKeypont();
  const { data: keypoints, isLoading: isLoadingGetKeypoints } =
    useGetSessionKeypoints(sessionId);

  const [filledAreas, setFilledArea] = useState<ISessionPoint[]>([]);
  const [isFullView, setIsFullView] = useState<boolean>(false);
  const [pointPeriod, setPointPeriod] = useState<MyChartPoint[]>([]);

  useEffect(() => setIsFullView(sessionStatus === "Closed"), [sessionStatus]);

  const { showAlert, hideAlert } = useAlert();

  const chartData: ChartData<"line"> = {
    labels: dashboardData.labels,
    datasets: [
      {
        label: "Ударов в мин.",
        data: dashboardData.values.map((value, index) => ({
          x: dashboardData.labels[index],
          y: value,
          id: dashboardData.measurementIds[index],
        })),
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20,184,166,0.12)",
        fill: true,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        tension: 0.4,
        pointBackgroundColor: dashboardData.values.map((_, index) => {
          const id = dashboardData.measurementIds[index];
          return pointPeriod.find((p) => p.id === id) ? "#ef4444" : "#e5e7eb";
        }),
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
      },
    ],
  };

  const isPointInArea = useCallback(
    (point: { id: number }) => {
      return filledAreas.some(
        (area) =>
          point.id >= area.startMeasurementId &&
          point.id <= area.endMeasurementId
      );
    },
    [filledAreas]
  );

  const options: ChartOptions<"line"> = useMemo(() => {
    const xMinMax =
      (isFullView && {
        min: 0,
        max: 50,
      }) ||
      undefined;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      onClick: (event, _, chart) => {
        if (!chart) return;
        const nativeEvent = event.native;
        if (!nativeEvent) return;

        const points = chart.getElementsAtEventForMode(
          nativeEvent,
          "nearest",
          { intersect: true },
          false
        );

        if (points.length === 0) return;

        const point = points[0];
        const datasetIndex = point.datasetIndex;
        const index = point.index;

        const dataset = chart.data.datasets[datasetIndex];
        const value = dataset.data[index] as MyChartPoint;

        if (isPointInArea(value)) return;

        setPointPeriod((prev) => {
          const exists = prev.find((p) => p.id === value.id);
          let newArray: typeof prev;

          if (exists) {
            newArray = prev.filter((p) => p.id !== value.id);
          } else {
            newArray = [...prev, value];
            newArray.sort((a, b) => a.x - b.x);
            newArray = newArray.slice(0, 2);
          }

          return newArray;
        });
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          intersect: false,
          displayColors: false,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: "'Lora-SemiBold', serif", size: 13 },
          bodyFont: { family: "system-ui, sans-serif", size: 12 },
          footerFont: { family: "system-ui, sans-serif", size: 11 },
          backgroundColor: "rgba(17,20,25,0.95)",
          titleColor: "#f0f2f5",
          bodyColor: "#9ca3af",
          footerColor: "#ef4444",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          callbacks: {
            title: (context) => {
              const value = context[0].formattedValue;
              return `${value} уд/мин`;
            },
            label: (context) => {
              const value = context.label;
              const normalized = String(value).trim().replace(",", ".");
              const isNumber = /^-?\d+(\.\d+)?$/.test(normalized);
              if (!isNumber) return "";

              const minutes = parseFloat(normalized);
              const ms = minutes * 60 * 1000;
              const time = convertMilliseconds({
                ms,
                withoutMs: true,
              }).formatNumberTime;

              return time;
            },
            afterTitle: (context) => {
              const value = context[0].formattedValue;
              const isAboveThreshold = +value > 180;
              return isAboveThreshold ? "Пульс превышен" : "";
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: xAxisLabel,
            color: "#9ca3af",
            align: "end",
            font: { family: "system-ui, sans-serif", size: 11, weight: 500 },
          },
          ticks: {
            color: "#6b7280",
            maxRotation: 0,
            minRotation: 0,
            stepSize: 5,
            font: { family: "system-ui, sans-serif", size: 11 },
          },
          grid: {
            color: "rgba(255,255,255,0.04)",
            lineWidth: 1,
          },
          ...xMinMax,
        },
        y: {
          type: "linear",
          title: {
            display: true,
            text: yAxisLabel,
            color: "#9ca3af",
            align: "end",
            font: { family: "system-ui, sans-serif", size: 11, weight: 500 },
          },
          ticks: {
            color: "#6b7280",
            stepSize: 40,
            font: { family: "system-ui, sans-serif", size: 11 },
          },
          grid: {
            color: "rgba(255,255,255,0.04)",
            lineWidth: 1,
          },
          min: 40,
          max: 240,
        },
      },
    };
  }, [xAxisLabel, yAxisLabel, isFullView, pointPeriod, isPointInArea]);

  const crosshairPlugin: Plugin<"line"> = useMemo(
    () => ({
      id: "crosshairPlugin",
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        const targetY = scales.y.getPixelForValue(180);

        ctx.save();
        ctx.strokeStyle = "rgba(239,68,68,0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(chartArea.left, targetY);
        ctx.lineTo(chartArea.right, targetY);
        ctx.stroke();
        ctx.restore();
      },
    }),
    []
  );

  const quadrantPlugin: Plugin<"line"> = useMemo(
    () => ({
      id: "quadrantPlugin",
      beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        const { left, right, top, bottom } = chartArea;
        const totalWidth = right - left;

        const chartDuration = 50;
        const referenceDuration = 45;

        const basePercentages = [0.08, 0.19, 0.63, 0.1];
        const labels = ["Вводная", "Подгот-я", "Основная", "Закл-я", "Заминка"];

        ctx.save();
        ctx.strokeStyle = "rgba(245,158,11,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "500 10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        let accumulated = 0;
        for (let i = 0; i < basePercentages.length; i++) {
          accumulated += basePercentages[i];
          const positionMinutes = accumulated * referenceDuration;
          const x = left + (positionMinutes / chartDuration) * totalWidth;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
        }

        accumulated = 0;
        for (let i = 0; i < basePercentages.length; i++) {
          const startMin = accumulated * referenceDuration;
          const endMin = (accumulated + basePercentages[i]) * referenceDuration;
          const centerMin = startMin + (endMin - startMin) / 2;
          const centerX = left + (centerMin / chartDuration) * totalWidth;
          ctx.fillText(labels[i], centerX, top + 14);
          accumulated += basePercentages[i];
        }

        const centerLast = (45 + 50) / 2;
        const centerXLast = left + (centerLast / chartDuration) * totalWidth;
        ctx.fillText(labels[4], centerXLast, top + 14);

        ctx.restore();
      },
    }),
    []
  );

  const highlightAreaPlugin: Plugin<"line"> = useMemo(() => {
    return {
      id: "highlightArea",
      afterDatasetsDraw: (chart) => {
        const { ctx, chartArea, scales, data } = chart;
        if (!chartArea) return;
        const { bottom } = chartArea;

        ctx.save();

        filledAreas.forEach((area) => {
          const isHovered = hoveredAreasRef.current.includes(area.keyPointId);
          ctx.fillStyle = isHovered
            ? "rgba(245,158,11,0.25)"
            : "rgba(20,184,166,0.12)";

          const dataset = data.datasets[0];
          const points = dataset.data as MyChartPoint[];
          const areaPoints = points.filter(
            (p) =>
              p.id >= area.startMeasurementId && p.id <= area.endMeasurementId
          );
          if (!areaPoints.length) return;

          ctx.beginPath();
          areaPoints.forEach((p, i) => {
            const x = scales.x.getPixelForValue(p.x);
            const y = scales.y.getPixelForValue(p.y);
            if (i === 0) ctx.moveTo(x, bottom);
            ctx.lineTo(x, y);
          });
          const lastX = scales.x.getPixelForValue(
            areaPoints[areaPoints.length - 1].x
          );
          ctx.lineTo(lastX, bottom);
          ctx.closePath();
          ctx.fill();
        });

        ctx.restore();
      },
    };
  }, [filledAreas, hoveredAreasRef]);

  const plugins = useMemo(() => {
    const activePlugins: Plugin<"line", any>[] = [crosshairPlugin];
    if (isFullView) activePlugins.push(quadrantPlugin);
    if (isFullView && !isLoadingGetKeypoints && filledAreas.length) {
      activePlugins.push(highlightAreaPlugin);
    }
    return activePlugins;
  }, [
    isFullView,
    crosshairPlugin,
    quadrantPlugin,
    filledAreas,
    isLoadingGetKeypoints,
    highlightAreaPlugin,
  ]);

  useEffect(() => {
    if (pointPeriod.length === 2 && !!sessionId) {
      const [startPoint, endPoint] = pointPeriod;
      showAlert({
        title: "Установите значение для выделенного периода",
        onClose: () => setPointPeriod([]),
        closableOverlay: false,
        styles: {
          alertBox: {
            alignItems: "center",
            justifyContent: "center",
          },
        },
        children: (
          <TimePeriodView
            onSetTimePeriod={() => {
              hideAlert();
              setPointPeriod([]);
            }}
            startPoint={{ ...startPoint, x: startPoint.x * 60 }}
            endPoint={{ ...endPoint, x: endPoint.x * 60 }}
            sessionId={+sessionId}
          />
        ),
      });
    }
  }, [pointPeriod, sessionId, showAlert, hideAlert]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartRef]);

  useEffect(() => setFilledArea(keypoints?.data || []), [keypoints?.data]);

  const lineKey = useMemo(() => {
    return isFullView
      ? `full-${filledAreas.length}`
      : `normal-${filledAreas.length}`;
  }, [isFullView, filledAreas]);

  return (
    <div className={styles.dashboard} style={containerStyles}>
      {sessionStatus === "Closed" && (
        <div className={styles.controls}>
          <p className={styles.hint}>
            Выберите две точки на графике, чтобы задать период
          </p>
          <Switch
            tooltipLocation="left"
            onChange={() => setIsFullView((pre) => !pre)}
            value={!isFullView ? "complete" : "progress"}
            options={{
              progress: { label: "Текущий прогресс" },
              complete: { label: "Полный график" },
            }}
          />
        </div>
      )}
      <div className={styles.chartContainer}>
        <Line
          key={lineKey}
          ref={chartRef as any}
          data={chartData}
          options={options}
          plugins={plugins}
        />
      </div>
    </div>
  );
};

export default Dashboard;
