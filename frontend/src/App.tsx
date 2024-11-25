// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import { useGetUsers } from "./api/hooks/user/useGetUsers";
// import { useGetDevices } from "./api/hooks/device/useGetDevices";
// import { useGetUserById } from "./api/hooks/user/useGetUserById";
// import { useGetUsersByDeviceId } from "./api/hooks/device/useGetUsersByDeviceId";
import Router from "./router/Router";

function App() {
  // const [userId, setUserId] = useState<number>(0);
  // const [deviceId, setDeviceId] = useState<number>(0);

  // const { data: users, isLoading: isUsersLoading } = useGetUsers();
  // const { data: devices, isLoading: isDevicesLoading } = useGetDevices();

  // useGetUserById(userId);
  // useGetUsersByDeviceId(deviceId);

  return (
    <div
      style={{
        width: "100%",
        minWidth: 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 0,
      }}
    >
      {/* {contextHolder} */}
      <Router />
    </div>
  );
}

export default App;
