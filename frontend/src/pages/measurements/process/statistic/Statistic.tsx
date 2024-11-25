import { FC } from "react";
import styles from "./Statistic.module.scss";
import Dashboard from "../../../../ui/dashboard/Dashboard";

export interface IParamSet {
  label: string;
  value: string;
}
interface IStatisticProps {
  paramSet: IParamSet[];
}
const Statistic: FC<IStatisticProps> = (props) => {
  const { paramSet } = props;
  return (
    <section className={styles.statisticContainer}>
      <ul className={styles.paramSet}>
        {paramSet.map((param) => (
          <li key={param.label} className={styles.paramCard}>
            <p className={styles.paramLabel}>{param.label}</p>
            <span className={styles.paramValue}>{param.value}</span>
          </li>
        ))}
      </ul>

       <Dashboard
        data={[
          90, 110, 120, 80, 90, 100, 47, 120, 90, 110, 120, 80, 90, 100, 130,
          120, 90, 110, 120, 80, 90, 100, 130, 120,
        ]}
        containerStyles={{ flex: 1 }}
        xAxisLabel="Время,секунд"
        yAxisLabel="Ударов в мин."
      />
    </section>
  );
};

export default Statistic;
