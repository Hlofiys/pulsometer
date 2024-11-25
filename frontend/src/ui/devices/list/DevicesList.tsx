import { FC, HTMLAttributes } from "react";
import { IDevice } from "../../../services/interfaces/Interfaces";
import { DeviceCard } from "./card/DeviceCard";
import styles from "./DevicesList.module.scss";

interface IDevicesList extends HTMLAttributes<HTMLUListElement>{
  devices: IDevice[]
  onCardClick?: (deviceId: number)=>void;
}
const DevicesList: FC<IDevicesList> = (props) => {
  const {devices, onCardClick, ...ulProps} = props
  return (
    <ul className={styles.listContainer} {...ulProps}>
      {devices.map((device) => (
        <DeviceCard onClick={onCardClick} key={device.id} device={device} />
      ))}
    </ul>
  );
};

export default DevicesList;
