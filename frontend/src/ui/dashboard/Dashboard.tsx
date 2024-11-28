import { FC, useRef, useEffect, useState, useMemo } from "react";
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
import type { ChartData, ChartOptions, Plugin, TooltipModel } from "chart.js";
import styles from "./Dashboard.module.scss";

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
interface TooltipState {
  x: number;
  y: number;
  value: number | null;
  index: number | null;
  label: string | null;
}

interface DashboardProps {
  dashboardData: IDashboardData;
  // labels: number[];
  // data: number[]; // Массив значений пульса
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
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    x: 0,
    y: 0,
    value: null,
    index: null,
    label: null,
  });

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
        pointRadius: 0, // Скрываем точки по умолчанию
        pointHoverRadius: 8, // Размер точки при наведении
        tension: 0.4, // Сглаживание линии
      },
    ],
  };

  // Опции графика
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: (context) => handleTooltip(context),
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
        // max: dashboardData.values.length * 10,
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
  };

  // Кастомный плагин для визирных линий
  const crosshairPlugin: Plugin<"line"> = {
    id: "crosshairPlugin",
    afterDraw: (chart) => {
      const { ctx, chartArea, scales } = chart;
      const midX = (scales.x.left + scales.x.right) / 2; // Средина по оси X
      const targetY = scales.y.getPixelForValue(120); // Значение 120 по оси Y

      ctx.save();
      ctx.strokeStyle = "#e0022a";
      ctx.lineWidth = 0.97;

      // Вертикальная линия (средина времени)
      ctx.beginPath();
      ctx.moveTo(midX, chartArea.top);
      ctx.lineTo(midX, chartArea.bottom);
      ctx.stroke();

      // Горизонтальная линия (120 ударов в минуту)
      ctx.beginPath();
      ctx.moveTo(chartArea.left, targetY);
      ctx.lineTo(chartArea.right, targetY);
      ctx.stroke();

      ctx.restore();
    },
  };

  // Обработчик кастомного tooltip
  const handleTooltip = (context: {
    chart: ChartJS;
    tooltip: TooltipModel<"line">;
  }) => {
    const { tooltip } = context;

    if (!tooltip.opacity) {
      if (tooltipState.value !== null) {
        setTooltipState({ x: 0, y: 0, value: null, index: null, label: null });
      }
      return;
    }

    const tooltipModel = tooltip.dataPoints[0];
    if (tooltipModel) {
      const { element } = tooltipModel;
      const { x, y } = element;
      const value = tooltipModel.raw as number;
      const label = tooltipModel.label as string;

      if (
        tooltipState.x !== x ||
        tooltipState.y !== y ||
        tooltipState.value !== value ||
        tooltipState.label !== label
      ) {
        setTooltipState({
          x,
          y,
          value,
          index: 0,
          label,
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Уничтожение графика при размонтировании компонента
        chartRef.current = null;
      }
    };
  }, []);

  // Определяем, нужно ли добавлять красную рамку
  const isAboveThreshold = useMemo(() => {
    return tooltipState.value !== null && tooltipState.value > 120;
  }, [tooltipState.value]);

  return (
    <div className={styles.dashboard} style={containerStyles}>
      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} plugins={[crosshairPlugin]} />
        {tooltipState.value !== null && (
          <div
            className={`${styles.tooltip}`}
            style={{
              left: tooltipState.x + 10,
              top: tooltipState.y - 30,
            }}
          >
            <p className={`${isAboveThreshold ? styles.warning : ""}`}>
              {tooltipState.value}
              <span style={{ display: "block", margin: 0, padding: 0 }}>
                ({tooltipState.label}-я секунда)
              </span>
              {isAboveThreshold && <span>Пульс превышен!</span>}
            </p>
          </div>
        )}
        {tooltipState.index !== null && tooltipState.value !== null && (
          <div
            className={styles.redDot}
            style={{
              left: tooltipState.x - 5, // Центрируем точку по оси X
              top: tooltipState.y - 5, // Центрируем точку по оси Y
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
