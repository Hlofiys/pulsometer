import { FC, HTMLAttributes } from "react";
import { IDevice } from "../../../services/interfaces/Interfaces";
import { DeviceCard } from "./card/DeviceCard";
import styles from "./DevicesList.module.scss";

const staticArray: IDevice[] = [
  {
    id: 1,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
  {
    id: 2,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
  {
    id: 3,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
  {
    id: 4,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
  {
    id: 5,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
  {
    id: 6,
    status: "off",
    activeUserId: 0,
    lastContact: "2024-11-14T18:44:54.585Z",
    users: [],
  },
];
const DevicesList: FC<HTMLAttributes<HTMLUListElement>> = (props) => {
  return (
    <ul className={styles.listContainer} {...props}>
      {staticArray.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </ul>
  );
};

export default DevicesList;
