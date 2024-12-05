import { FC, HTMLAttributes, useMemo } from "react";
import { IDevice } from "../../../services/interfaces/Interfaces";
import { DeviceCard } from "./card/DeviceCard";
import styles from "./DevicesList.module.scss";
// import useWebSocket from "react-use-websocket";

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
  // const {} = useWebSocket("wss://pulse.hlofiys.xyz/ws/status")

  return (
    <ul className={styles.listContainer} {...ulProps}>
      {sortingDevices.map((device) => (
        <DeviceCard
          onClick={onCardClick}
          key={device.deviceId}
          device={device}
        />
      ))}
    </ul>
  );
};

export default DevicesList;
