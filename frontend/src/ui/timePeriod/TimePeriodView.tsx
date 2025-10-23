import React, { useState, useMemo, ChangeEvent } from "react";
import styles from "./TimePeriodView.module.scss";
import Button from "../buttons/additional/Button";
import { MyChartPoint } from "../dashboard/Dashboard";
import { useSetKeypoint } from "../../api/hooks/session/useSetKeypoint";

interface TimePeriodInputProps {
  startPoint: MyChartPoint;
  endPoint: MyChartPoint;
  sessionId: number;
  onChangeName?: (name: string) => void;
  onSetTimePeriod?: () => void;
}

export const TimePeriodView: React.FC<TimePeriodInputProps> = ({
  startPoint,
  endPoint,
  sessionId,
  onChangeName,
  onSetTimePeriod,
}) => {
  const { mutateAsync: set_point, isLoading: isLoadingSetPoint } =
    useSetKeypoint();
  const [periodName, setPeriodName] = useState("");
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const periodText = useMemo(() => {
    return `${formatTime(startPoint.x)} - ${formatTime(endPoint.x)}`;
  }, [startPoint.x, endPoint.x]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPeriodName(e.target.value);
    onChangeName?.(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.periodInfo}>
        <span className={styles.periodLabel}>Период времени:</span>
        <span className={styles.periodValue}>
          {/* {`${startPoint.x}`} - {`${endPoint.x}`} */}
          {periodText}
        </span>
      </div>
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>Название периода:</label>
        <input
          type="text"
          value={periodName}
          onChange={handleChange}
          placeholder="Введите название периода"
          className={styles.inputField}
        />
      </div>
      <Button
        style={{ height: 30, borderRadius: 8, fontSize: "10pt", marginTop: 10 }}
        loading={isLoadingSetPoint}
        disabled={!periodName}
        onClick={() =>
          set_point(
            {
              startMeasurementId: startPoint.id,
              endMeasurementId: endPoint.id,
              name: periodName,
              sessionId,
            },
            { onSuccess: () => onSetTimePeriod?.() }
          )
        }
      >
        Установить
      </Button>
    </div>
  );
};
