import { FC } from "react";
import pulsometerDefault from "../../../../assets/photos/defaultPulsometer.png";
import TopArrow from "../../../icons/TopArrow";
import styles from "./DeviceCard.module.scss";
import { IDevice } from "../../../../services/interfaces/Interfaces";

interface IDeviceCard {
  device: IDevice;
}

export const DeviceCard: FC<IDeviceCard> = ({ device }) => {
  return (
    <li className={styles.deviceCardContainer}>
      <img src={pulsometerDefault} alt="фото устройства" />
      <label>
        Устройство-{device.id}
        <TopArrow />
      </label>
    </li>
  );
};
