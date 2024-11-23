import { FC, HTMLAttributes } from "react";
import { IDevice } from "../../../services/interfaces/Interfaces";
import { DeviceCard } from "./card/DeviceCard";
import styles from "./DevicesList.module.scss";

interface IDevicesList extends HTMLAttributes<HTMLUListElement>{
  devices: IDevice[]
}
const DevicesList: FC<IDevicesList> = (props) => {
  const {devices, ...ulProps} = props
  return (
    <ul className={styles.listContainer} {...ulProps}>
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </ul>
  );
};

export default DevicesList;
