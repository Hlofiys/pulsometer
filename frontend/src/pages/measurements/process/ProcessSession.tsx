import { FC } from "react";
import styles from "./ProcessSession.module.scss";
import Params from "./userParams/Params";
import Statistic from "./statistic/Statistic";
import Button from "../../../ui/buttons/primary/Button";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";

const ProcessSession: FC = () => {
  return (
    <div className={styles.mainProcessContainer}>
      <div className={styles.processMeasurementsContainer}>
        <Params
          fio="Кирик Константин Андреевич"
          deviceId={1}
          activityType="Бег"
          time={21332233}
        />
        <Statistic
          paramSet={[
            { label: "Среднее значение:", value: "120 ударов в мин." },
            { label: "Макс. значение:", value: "143 ударов в мин." },
            { label: "Мин. значение:", value: "47 ударов в мин." },
            { label: "Кислород:", value: "93%" },
          ]}
        />
      </div>

      <section className={styles.buttons}>
        <Button>Сохранить изменения:</Button>
        <Link>Смотреть другие результаты <ArrowRight stroke="#23E70A" /></Link>
      </section>
    </div>
  );
};

export default ProcessSession;
