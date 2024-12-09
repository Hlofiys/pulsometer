import { FC, HTMLAttributes, useMemo } from "react";
import { IDevice } from "../../../services/interfaces/Interfaces";
import { DeviceCard } from "./card/DeviceCard";
import styles from "./DevicesList.module.scss";

interface IDevicesList extends HTMLAttributes<HTMLUListElement> {
  devices: IDevice[];
  onCardClick?: (deviceId: number) => void;
}
const DevicesList: FC<IDevicesList> = (props) => {
  const { devices, onCardClick, ...ulProps } = props;

  const sortingDevices = useMemo(
    () =>
      devices.sort(
        (prevDevice, nextDevice) => prevDevice.deviceId - nextDevice.deviceId
      ),
    [devices]
  );

  return (
    <ul className={styles.listContainer} {...ulProps}>
      {sortingDevices.map((device) => (
        <DeviceCard
          key={device.deviceId}
          onClick={onCardClick}
          device={device}
        />
      ))}
    </ul>
  );
};

export default DevicesList;
