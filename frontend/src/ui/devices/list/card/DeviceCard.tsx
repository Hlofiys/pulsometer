import { FC } from "react";
import pulsometerDefault from "../../../../assets/photos/defaultPulsometer.png";
import TopArrow from "../../../icons/TopArrow";
import styles from "./DeviceCard.module.scss";
import { IDevice } from "../../../../services/interfaces/Interfaces";

interface IDeviceCard {
  device: IDevice;
  isShowCard?: boolean;
  onClick?:(deviceId: number)=>void;
}

export const DeviceCard: FC<IDeviceCard> = (props) => {

  const { device, isShowCard, onClick } = props;

  return (
    <li
      className={styles.deviceCardContainer}
      style={isShowCard ? { flexDirection: "column-reverse" } : undefined}
      onClick={()=>{
        // console.log(device)
        onClick && onClick(device.deviceId)
      }}
    >
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
