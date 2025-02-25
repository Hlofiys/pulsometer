import { FC, useRef, useEffect, useMemo } from "react";
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
}
interface DashboardProps {
  dashboardData: IDashboardData;
  containerStyles?: React.CSSProperties; // Стили для контейнера
  xAxisLabel: string; // Название оси X
  yAxisLabel: string; // Название оси Y
}

const Dashboard: FC<DashboardProps> = ({
  dashboardData,
  containerStyles,
  xAxisLabel,
  yAxisLabel,
}) => {
  const chartRef = useRef<ChartJS | null>(null);

  // Данные графика
  const chartData: ChartData<"line"> = {
    labels: dashboardData.labels, // Временные отметки
    datasets: [
      {
        label: "Ударов в мин.",
        data: dashboardData.values, // Данные графика, переданные в props
        borderColor: "#00ff00", // Цвет линии
        backgroundColor: "rgba(0, 255, 0, 0.1)", // Цвет заливки
        fill: true, // Включение заливки
        pointHoverRadius: 5, // Размер точки при наведении
        tension: 0.4, // Сглаживание линии
        pointRadius: 1.5,
      },
    ],
  };

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: false,
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
              const trimmedStr = value.replace(/\s/g, "");

              const ms = /^\d+$/.test(trimmedStr)
                ? parseInt(trimmedStr, 10)
                : NaN; // Возвращаем NaN, если строка содержит буквы или другие символы
              const time = convertMilliseconds({
                ms: ms * 1000,
                withoutMs: true,
              }).formatNumberTime;

              return time;
            },
            afterTitle: (context) => {
              const value = context[0].formattedValue;
              const isAboveThreshold = +value > 120;

              return `${(isAboveThreshold && "Пульс превышен") || ""}`;
            },
          },
          position: "nearest",
          backgroundColor: "#fbfaf8",
          bodyColor: "black", // Белый фон tooltip
          titleColor: (context) => {
            const value = context.tooltip.title[0].split(" ")[0];
            const isAboveThreshold = +value > 120;

            return !isAboveThreshold ? "#1a1c21" : "#ff1a43";
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: xAxisLabel, // Используем название оси X из props
            color: "#fff",
            align: "end",
          },
          ticks: {
            color: "#fff",
            maxRotation: 0,
            minRotation: 0,
          },
          grid: {
            color: "gray", // Устанавливаем цвет линий сетки
            lineWidth: 0.97, // Устанавливаем толщину линий сетки
          },
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
          },
          grid: {
            color: "gray", // Устанавливаем цвет линий сетки
            lineWidth: 0.97, // Устанавливаем толщину линий сетки
          },
          min: 40,
          max: 160,
        },
      },
    }),
    [xAxisLabel, yAxisLabel]
  );

  // Кастомный плагин для визирных линий
  const crosshairPlugin: Plugin<"line"> = useMemo(
    () => ({
      id: "crosshairPlugin",
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        const midX = (scales.x.left + scales.x.right) / 2;
        const targetY = scales.y.getPixelForValue(120);

        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX, chartArea.top);
        ctx.lineTo(midX, chartArea.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chartArea.left, targetY);
        ctx.lineTo(chartArea.right, targetY);
        ctx.stroke();

        ctx.restore();
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Уничтожение графика при размонтировании компонента
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.dashboard} style={containerStyles}>
      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} plugins={[crosshairPlugin]} />
      </div>
    </div>
  );
};

export default Dashboard;
