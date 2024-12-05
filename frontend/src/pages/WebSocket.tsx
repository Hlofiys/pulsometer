import useWebSocket, { ReadyState } from "react-use-websocket";
// import { ISession } from "../services/interfaces/Interfaces";

const WebSocketComponent = () => {

  const { lastMessage, readyState } = useWebSocket('wss://pulse.hlofiys.xyz/ws/status', {
    shouldReconnect: () => true, // Попытки переподключения
    onMessage: (data)=>console.log(data),
    reconnectAttempts: 10,
    reconnectInterval: 5000, // Интервал между попытками
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      {/* {error && <p style={{ color: "red" }}>Error: {error}</p>} */}
      <button onClick={() => console.log(JSON.parse(lastMessage?.data).id)}>Send Ping</button>
      {lastMessage && <pre>{JSON.stringify(lastMessage, null, 2)}</pre>}
    </div>
  );
};

export default WebSocketComponent;
