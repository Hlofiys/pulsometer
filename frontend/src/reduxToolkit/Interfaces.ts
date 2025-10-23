import { ReactNode } from "react";
import { IUser } from "../services/interfaces/Interfaces";

export interface IInitialState {
  users: IUser[];
  // devices: IDevice[]
}

export interface IWithChildren {
  children?: ReactNode;
}
