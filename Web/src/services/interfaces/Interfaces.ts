export interface IUser {
  id: number;
  fio: string;
  deviceId: number;
  pulseMeasurements: number[];
}

export type TCreateUser = Pick<IUser, "fio" | "deviceId">;
export type TUpdateUser = Pick<IUser, "id" | "fio" | "deviceId">;

export interface IDevice{
  id: number;
  status: "ready"|"measuring"|'off';
  activeUserId: number;
  lastContact: string; //"2024-11-14T18:44:54.585Z";
  users: number[];
}
export interface IMeasurements {
  id: number;
  bpm: number;
  userId: number;
  date: string; //"2024-11-14T18:15:07.482Z";
}
