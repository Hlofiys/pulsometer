import { FC } from "react";
import styles from "./Empty.module.scss";
import Lottie from "lottie-react";
import EmptyLottie from "../../assets/animation/empty/Empty.json";

interface IEmptyProps {
  description?: string;
}
const Empty: FC<IEmptyProps> = (props) => {
  const { description } = props;
  return (
    <section className={styles.emptyParagraph}>
      <Lottie
        animationData={EmptyLottie}
        loop={true}
        className={styles.lottieSection}
      />
      <p>{description ?? "Список пуст"}</p>
    </section>
  );
};

export default Empty;
