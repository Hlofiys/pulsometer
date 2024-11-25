import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialState } from "./Interfaces";
import { IUser } from "../services/interfaces/Interfaces";

const initialState: IInitialState = {
    users: [],
    // devices: []
};

const usersSlice = createSlice({
  name: "usersSlice",
  initialState: initialState.users,
  reducers: {
    setUsers: (_state, payload: PayloadAction<IUser[]>) =>
      (_state = payload.payload),
  },
});

// const devicesSlice = createSlice({
//   name: "devicesSlice",
//   initialState: initialState.devices,
//   reducers: {
//     setDevices: (_state, payload: PayloadAction<IDevice[]>) =>
//       (_state = payload.payload),
//   },
// });

//export all actions:
export const { setUsers } = usersSlice.actions;
// export const { setDevices } = devicesSlice.actions;

//export all redusers
export const usersReduce = usersSlice.reducer;
// export const devicesReduce = devicesSlice.reducer;
