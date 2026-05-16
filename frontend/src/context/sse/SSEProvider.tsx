import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { IWithChildren } from "../../services/interfaces/Interfaces";
import { IDevice, TDeviceStatus } from "../../services/interfaces/Interfaces";

interface SSEContextType {
  deviceStatuses: Record<number, TDeviceStatus>;
}

const SSEContext = createContext<SSEContextType>({
  deviceStatuses: {},
});

let globalEventSource: EventSource | null = null;
let globalListeners: Array<(data: IDevice) => void> = [];
let globalConnected = false;

function getGlobalSSE() {
  return { globalEventSource, globalListeners, globalConnected };
}

export const SSEProvider: FC<IWithChildren> = ({ children }) => {
  const [deviceStatuses, setDeviceStatuses] = useState<
    Record<number, TDeviceStatus>
  >({});
  const listenersRef = useRef<Array<(data: IDevice) => void>>([]);

  useEffect(() => {
    const state = getGlobalSSE();

    const listener = (data: IDevice) => {
      setDeviceStatuses((prev) => ({
        ...prev,
        [data.deviceId]: data.status,
      }));
    };

    listenersRef.current.push(listener);
    state.globalListeners.push(listener);

    if (!state.globalEventSource) {
      const eventSource = new EventSource(
        "https://pulse.hlofiys.xyz/sse/status"
      );

      eventSource.onopen = () => {
        state.globalConnected = true;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as IDevice;
          state.globalListeners.forEach((l) => l(data));
        } catch {
          console.error("SSEProvider: failed to parse message");
        }
      };

      eventSource.onerror = () => {
        console.error("SSEProvider: connection error");
        state.globalConnected = false;
      };

      state.globalEventSource = eventSource;
    }

    return () => {
      listenersRef.current = listenersRef.current.filter(
        (l) => l !== listener
      );
      state.globalListeners = state.globalListeners.filter(
        (l) => l !== listener
      );

      if (state.globalListeners.length === 0 && state.globalEventSource) {
        state.globalEventSource.close();
        state.globalEventSource = null;
        state.globalConnected = false;
      }
    };
  }, []);

  return (
    <SSEContext.Provider value={{ deviceStatuses }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSEContext = (): SSEContextType => {
  return useContext(SSEContext);
};
