import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useGetUsers } from "./api/hooks/user/useGetUsers";
import { useGetDevices } from "./api/hooks/device/useGetDevices";
import { useGetUserById } from "./api/hooks/user/useGetUserById";
import { useGetUsersByDeviceId } from "./api/hooks/device/useGetUsersByDeviceId";

function App() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<number>(0);

  const { data: users, isLoading: isUsersLoading } = useGetUsers();
  const { data: devices, isLoading: isDevicesLoading } = useGetDevices();

  useGetUserById(userId);
  useGetUsersByDeviceId(deviceId);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {/* <button>get users</button> */}
        {/* <button>get devices</button> */}
        <button
          disabled={isUsersLoading}
          onClick={() => setUserId(users?.data[0].id || 0)}
        >
          getUserById
        </button>
        <button
          disabled={isDevicesLoading}
          onClick={() => setDeviceId(devices?.data[0].id || 0)}
        >
          getUsersByDeviceId
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
