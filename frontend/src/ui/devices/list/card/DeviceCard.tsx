import { FC } from "react";
import pulsometerDefault from "../../../../assets/photos/defaultPulsometer.webp";
import TopArrow from "../../../icons/TopArrow";
import styles from "./DeviceCard.module.scss";
import {
  IDevice,
  TDeviceStatus,
} from "../../../../services/interfaces/Interfaces";
import { DeviceStatus } from "../../../../services/device/Device.service";
import { useSSEContext } from "../../../../context/sse/SSEProvider";

interface IDeviceCard {
  device: IDevice;
  isShowCard?: boolean;
  onClick?: (deviceId: number) => void;
}

export const DeviceCard: FC<IDeviceCard> = (props) => {
  const { device, isShowCard, onClick } = props;
  const { deviceStatuses } = useSSEContext();

  const sseStatus = deviceStatuses[device.deviceId];
  const deviceStatus: TDeviceStatus = sseStatus || device.status || "off";

  return (
    <li
      className={styles.deviceCardContainer}
      style={isShowCard ? { flexDirection: "column-reverse" } : undefined}
      onClick={() => onClick && onClick(device.deviceId)}
    >
      <p className={`${styles.deviceStatus} ${styles[deviceStatus]}`}>
        {DeviceStatus[deviceStatus]}
      </p>
      <img src={pulsometerDefault} alt="фото устройства" />
      <label
        style={
          isShowCard
            ? {
                justifyContent: "center",
              }
            : undefined
        }
      >
        Устройство-{device.deviceId}
        {!isShowCard && <TopArrow />}
      </label>
    </li>
  );
};
