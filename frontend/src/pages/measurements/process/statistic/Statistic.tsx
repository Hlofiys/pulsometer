import { FC, useMemo } from "react";
import styles from "./Statistic.module.scss";
import Dashboard, { IDashboardData } from "../../../../ui/dashboard/Dashboard";
import Skeleton from "../../../../ui/dashboard/skeleton/Skeleton";
import { TSessionStatus } from "../../../../services/interfaces/Interfaces";
export interface IParamSet {
  label: string;
  value: string;
  measurementId: number;
}
interface IStatisticProps {
  paramSet: Omit<IParamSet, "measurementId">[];
  dashboardData: { value: number; label: number; measurementId: number }[];
  isLoading?: boolean;
  sessionStatus: TSessionStatus;
}
const Statistic: FC<IStatisticProps> = (props) => {
  const { paramSet, dashboardData, isLoading, sessionStatus } = props;

  const dashboardParams: IDashboardData = useMemo(
    () => ({
      labels: dashboardData.map((item) => item.label),
      values: dashboardData.map((item) => item.value),
      measurementIds: dashboardData.map((item) => item.measurementId),
    }),
    [dashboardData]
  );

  return (
    <section className={styles.statisticContainer}>
      <ul className={styles.paramSet}>
        {paramSet.map((param) => (
          <li key={param.label} className={styles.paramCard}>
            <p className={styles.paramLabel}>{param.label}</p>
            <span className={styles.paramValue}>
              {isLoading ? "-//-" : param.value}
            </span>
          </li>
        ))}
      </ul>

      {isLoading ? (
        <Skeleton />
      ) : (
        <Dashboard
          dashboardData={dashboardParams}
          xAxisLabel="Время, минут"
          yAxisLabel="Ударов в мин."
          sessionStatus={sessionStatus}
        />
      )}
    </section>
  );
};

export default Statistic;
