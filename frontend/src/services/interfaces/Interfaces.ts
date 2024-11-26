export interface IUser {
  userId: number;
  fio: string;
  deviceId: number;
}

export type TCreateUser = Pick<IUser, "fio" | "deviceId">;
export type TUpdateUser = Pick<IUser, "userId" | "fio" | "deviceId">;
export type TTableUserRow = Pick<IUser, "fio" | "userId" | "deviceId">;
// export type TTableMeasurementRow = IMeasurements &
//   Pick<IUser, "userId" | "fio" | "deviceId">;

export interface IDevice {
  deviceId: number;
  status: "ready" | "measuring" | "off";
  activeUserId: number;
  lastContact: string; //"2024-11-14T18:44:54.585Z";
  users: number[];
}

export interface TActivateMeasurements
  extends Pick<IDevice, "activeUserId" | "deviceId"> {}

// export type TDeviceStatus = "activate" | "deactivate";

export interface ISession {
  sessionId: number;
  userId: number;
  time: string; //"2024-11-26T17:56:10.928611" начало сессии;
  passed: number; //пройдено времени *60
}
export interface IMeasurements {
  measurementId: number;
  bpm: number;
  oxygen: number;
  date: string; //"2024-11-26T18:37:15.777Z";
  sessionId: number; 
}
