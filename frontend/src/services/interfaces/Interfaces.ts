export interface IUser {
  userId: number;
  fio: string;
  group: string;
  deviceId: number;
}

export type TCreateUser = Pick<IUser, "fio" | "deviceId" | "group">;
export type TUpdateUser = IUser;
export type TTableUserRow = IUser;
// export type TTableMeasurementRow = IMeasurements &
//   Pick<IUser, "userId" | "fio" | "deviceId">;

export type TDeviceStatus = "ready" | "measuring" | "off";
export interface IDevice {
  deviceId: number;
  status: TDeviceStatus;
  activeUserId: number;
  lastContact: string; //"2024-11-14T18:44:54.585Z";
  users: number[];
}

export interface TActivateMeasurements
  extends Pick<ISession, "userId" | "typeActivity"> {}

// export type TDeviceStatus = "activate" | "deactivate";

export interface ISession {
  sessionId: number;
  userId: number;
  time: string; //"2024-11-26T17:56:10.928611" начало сессии;
  passed: number; //пройдено времени *60
  sessionStatus: "Closed" | "Open";
  typeActivity: string;
}
export interface IMeasurements {
  measurementId: number;
  bpm: number;
  oxygen: number;
  date: string; //"2024-11-26T18:37:15.777Z";
  sessionId: number;
}
