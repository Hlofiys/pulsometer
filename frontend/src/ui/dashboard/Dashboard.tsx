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

// Регистрация компонентов Chart.js
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
  containerStyles?: React.CSSProperties; // Стили для контейнера
  xAxisLabel: string; // Название оси X
  yAxisLabel: string; // Название оси Y
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
        borderColor: "#00ff00",
        backgroundColor: "rgba(0,255,0,0.1)",
        // backgroundColor: "red",

        fill: true,
        pointRadius: 1.5,
        pointHoverRadius: 4,
        tension: 0.4,
        pointBackgroundColor: dashboardData.values.map((_, index) => {
          const id = dashboardData.measurementIds[index];
          // Если точка выбрана — красный, иначе зеленый
          return pointPeriod.find((p) => p.id === id) ? "#ff1a43" : "white";
        }),
        pointBorderColor: "#fff", // можно добавить обводку для контраста
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
        min: 0, // начало оси X — 0 минут
        max: 50, // конец оси X — 50 минут (фиксировано)
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

        // event.native может быть null
        const nativeEvent = event.native;
        if (!nativeEvent) return;

        // получаем элементы под курсором
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
            // Если точка уже есть — убираем её
            newArray = prev.filter((p) => p.id !== value.id);
          } else {
            // Если точки ещё нет — добавляем
            newArray = [...prev, value];

            // Сортируем по X и оставляем максимум 2
            newArray.sort((a, b) => a.x - b.x);
            newArray = newArray.slice(0, 2);
          }

          return newArray;
        });
      },

      plugins: {
        tooltip: {
          enabled: true,
          // mode: "nearest",
          intersect: false,
          dataIndex: 1,
          displayColors: false,
          callbacks: {
            title: (context) => {
              const value = context[0].formattedValue;

              return `${value} уд/мин `;
            },
            label: (context) => {
              const value = context.label;

              // Преобразуем в строку, убираем пробелы и заменяем запятую на точку
              const normalized = String(value).trim().replace(",", ".");

              // Проверяем, число ли это
              const isNumber = /^-?\d+(\.\d+)?$/.test(normalized);
              if (!isNumber) return ""; // Если не число — пропускаем

              // Конвертируем минуты → миллисекунды
              const minutes = parseFloat(normalized);
              const ms = minutes * 60 * 1000;

              // Форматируем время
              const time = convertMilliseconds({
                ms,
                withoutMs: true,
              }).formatNumberTime;

              return time;
            },

            afterTitle: (context) => {
              const value = context[0].formattedValue;
              const isAboveThreshold = +value > 180;

              return `${(isAboveThreshold && "Пульс превышен") || ""}`;
            },
          },
          position: "nearest",
          backgroundColor: "#fbfaf8",
          bodyColor: "black", // Белый фон tooltip
          titleColor: (context) => {
            const value = context.tooltip.title[0].split(" ")[0];
            const isAboveThreshold = +value > 180;

            return !isAboveThreshold ? "#1a1c21" : "#ff1a43";
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: xAxisLabel, // Название оси X из props
            color: "#fff",
            align: "end",
          },
          ticks: {
            color: "#fff",
            maxRotation: 0,
            minRotation: 0,
            stepSize: 5, // шаг меток, например, каждые 5 минут
          },
          grid: {
            color: "gray",
            lineWidth: 0.5,
          },
          ...xMinMax,
        },

        y: {
          type: "linear",
          title: {
            display: true,
            text: yAxisLabel, // Используем название оси Y из props
            color: "#fff",
            align: "end",
          },
          ticks: {
            color: "#fff",
            stepSize: 40,
          },
          grid: {
            color: "gray", // Устанавливаем цвет линий сетки
            lineWidth: 0.5, // Устанавливаем толщину линий сетки
          },
          min: 40,
          max: 240,
        },
      },
    };
  }, [xAxisLabel, yAxisLabel, isFullView, pointPeriod]);

  // Кастомный плагин для визирных линий
  const crosshairPlugin: Plugin<"line"> = useMemo(
    () => ({
      id: "crosshairPlugin",
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        const targetY = scales.y.getPixelForValue(180); // горизонтальная линия на значении 180

        ctx.save();
        ctx.strokeStyle = "#b22222";
        ctx.lineWidth = 2;

        // горизонтальная линия
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

        const chartDuration = 50; // полная длина графика (0–50 мин)
        const referenceDuration = 45; // базовая длительность для первых 4 сегментов

        // первые 4 сегмента делятся по 45 минут
        const basePercentages = [0.08, 0.19, 0.63, 0.1];
        const labels = ["Вводная", "Подгот-я", "Основная", "Закл-я", "Заминка"];

        ctx.save();
        ctx.strokeStyle = "#e05252";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#fff";
        ctx.font = "8pt Lora-Regular";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        // ---------- ВЕРТИКАЛЬНЫЕ ЛИНИИ ----------
        let accumulated = 0;

        // рисуем 4 границы (от 0 до 45 минут)
        for (let i = 0; i < basePercentages.length; i++) {
          accumulated += basePercentages[i];
          const positionMinutes = accumulated * referenceDuration;
          const x = left + (positionMinutes / chartDuration) * totalWidth;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
        }

        // ---------- ПОДПИСИ СЕГМЕНТОВ ----------
        accumulated = 0;
        for (let i = 0; i < basePercentages.length; i++) {
          const startMin = accumulated * referenceDuration;
          const endMin = (accumulated + basePercentages[i]) * referenceDuration;
          const centerMin = startMin + (endMin - startMin) / 2;
          const centerX = left + (centerMin / chartDuration) * totalWidth;
          ctx.fillText(labels[i], centerX, top + 1);
          accumulated += basePercentages[i];
        }

        // подпись для последнего (V) сегмента — от 45 до 50 минут
        const centerLast = (45 + 50) / 2;
        const centerXLast = left + (centerLast / chartDuration) * totalWidth;
        ctx.fillText(labels[4], centerXLast, top + 1);

        ctx.restore();
      },
    }),
    []
  );

  // highlightAreaPlugin
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
            ? "rgba(255, 140, 0, 0.5)" // MediumPurple с прозрачностью
            : "rgba(255, 255, 204, 0.2)";

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
  }, [filledAreas]);

  const plugins = useMemo(() => {
    const activePlugins: Plugin<"line", any>[] = [crosshairPlugin];

    // Горизонтальные линии и сегменты только для полноэкранного графика
    if (isFullView) activePlugins.push(quadrantPlugin);

    // Подсветка областей только если полноэкранный вид и есть данные
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
  }, [pointPeriod]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Уничтожение графика при размонтировании компонента
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => setFilledArea(keypoints?.data || []), [keypoints?.data]);

  const lineKey = useMemo(() => {
    return isFullView
      ? `full-${filledAreas.length}`
      : `normal-${filledAreas.length}`;
  }, [isFullView, filledAreas]);

  return (
    <div className={styles.dashboard} style={containerStyles}>
      {sessionStatus === "Closed" && (
        <Switch
          tooltipLocation="left"
          onChange={() => setIsFullView((pre) => !pre)}
          value={!isFullView ? "complete" : "progress"}
          options={{
            progress: {
              label: "Текущий прогресс",
            },
            complete: {
              label: "Полный график",
            },
          }}
        />
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
