import { configureStore } from "@reduxjs/toolkit";
import { devicesReduce, usersReduce } from "./Slices";

const store = configureStore({
  reducer: {
    users: usersReduce,
    devices: devicesReduce,
  },
});

export default store;
