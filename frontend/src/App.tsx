// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import { useGetUsers } from "./api/hooks/user/useGetUsers";
// import { useGetDevices } from "./api/hooks/device/useGetDevices";
// import { useGetUserById } from "./api/hooks/user/useGetUserById";
// import { useGetUsersByDeviceId } from "./api/hooks/device/useGetUsersByDeviceId";
// import { SSEProvider } from 'react-hooks-sse';
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
        minWidth: 1250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 0,
      }}
    >
      {/* {contextHolder} */}
      {/* <SSEProvider endpoint={'https://pulse.hlofiys.xyz/sse/status'}> */}
        <Router />
      {/* </SSEProvider> */}
    </div>
  );
}

export default App;
