import { FC, useEffect, useState } from "react";
import pulsometerDefault from "../../../../assets/photos/defaultPulsometer.webp";
import TopArrow from "../../../icons/TopArrow";
import styles from "./DeviceCard.module.scss";
import {
  IDevice,
  TDeviceStatus,
} from "../../../../services/interfaces/Interfaces";
import { DeviceStatus } from "../../../../services/device/Device.service";
import { useSSEOptions } from "../../../../api/hooks/sse/useSSEOptions";

interface IDeviceCard {
  device: IDevice;
  isShowCard?: boolean;
  onClick?: (deviceId: number) => void;
}

export const DeviceCard: FC<IDeviceCard> = (props) => {
  const { device, isShowCard, onClick } = props;

  const [deviceStatus, setDeviceStatus] = useState<TDeviceStatus>(
    device.status || "off"
  );

  const { start } = useSSEOptions("https://pulse.hlofiys.xyz/sse/status", {
    onMessage: (event: MessageEvent) => {
      console.log("Новое сообщение:", JSON.parse(event.data));
      device.deviceId === (JSON.parse(event.data) as IDevice).deviceId &&
        setDeviceStatus((JSON.parse(event.data) as IDevice).status);
    },
    onError: (error: Event) => {
      console.error("Ошибка SSE:", error);
    },
    onOpen: () => {
      console.log("Соединение установлено");
    },
  });

  useEffect(() => {
    console.log("start sse");
    start();
  }, []);

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
