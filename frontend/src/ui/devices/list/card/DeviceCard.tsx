import { FC, useState } from "react";
import pulsometerDefault from "../../../../assets/photos/images.png";
import TopArrow from "../../../icons/TopArrow";
import styles from "./DeviceCard.module.scss";
import {
  IDevice,
  TDeviceStatus,
} from "../../../../services/interfaces/Interfaces";
import { DeviceStatus } from "../../../../services/device/Device.service";
import useWebSocket from "react-use-websocket";

interface IDeviceCard {
  device: IDevice;
  isShowCard?: boolean;
  onClick?: (deviceId: number) => void;
}

export const DeviceCard: FC<IDeviceCard> = (props) => {
  const { device, isShowCard, onClick } = props;

  const [deviceStatus, setDeviceStatus] = useState<TDeviceStatus>(
    device.status || "off"
    // 'measuring'
  );

  useWebSocket("wss://pulse.hlofiys.xyz/ws/status", {
    shouldReconnect: () => true, // Попытки переподключения
    onMessage: (data) => {
      JSON.parse(data.data).id === device.deviceId &&
        setDeviceStatus(JSON.parse(data.data).status);
    },
    reconnectAttempts: 10,
    reconnectInterval: 5000, // Интервал между попытками
  });

  return (
    <li
      className={styles.deviceCardContainer}
      style={isShowCard ? { flexDirection: "column-reverse" } : undefined}
      onClick={() => onClick && onClick(device.deviceId)}
    >
      <p className={`${styles.deviceStatus} ${styles[deviceStatus]}`}>{DeviceStatus[deviceStatus]}</p>
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
