import { configureStore } from "@reduxjs/toolkit";
import { usersReduce } from "./Slices";

const store = configureStore({
  reducer: {
    users: usersReduce,
    // devices: devicesReduce,
  },
});

export default store;
