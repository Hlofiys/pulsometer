import { FC, useMemo } from "react";
import styles from "./Statistic.module.scss";
import Dashboard, { IDashboardData } from "../../../../ui/dashboard/Dashboard";
import Skeleton from "../../../../ui/dashboard/skeleton/Skeleton";
export interface IParamSet {
  label: string;
  value: string;
}
interface IStatisticProps {
  paramSet: IParamSet[];
  dashboardData: { value: number; label: number }[];
  isLoading?: boolean;
}
const Statistic: FC<IStatisticProps> = (props) => {
  const { paramSet, dashboardData, isLoading } = props;

  const dashboardParams: IDashboardData = useMemo(
    () => ({
      labels: dashboardData.map((item) => item.label),
      values: dashboardData.map((item) => item.value),
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
          containerStyles={{ flex: 1 }}
          xAxisLabel="Время, секунд"
          yAxisLabel="Ударов в мин."
        />
      )}
    </section>
  );
};

export default Statistic;
