import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketProps {
  url: string; // URL для подключения к WebSocket
  onMessage: (data: any) => void; // Callback для обработки входящих сообщений
  reconnectInterval?: number; // Интервал переподключения (мс)
  maxReconnectAttempts?: number; // Максимальное количество попыток переподключения
}

const useWebSocket = ({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = Infinity,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false); // Состояние подключения
  const [error, setError] = useState<string | null>(null); // Ошибки WebSocket
  const [reconnectAttempts, setReconnectAttempts] = useState(0); // Счётчик попыток переподключения
  const socketRef = useRef<WebSocket | null>(null); // Хранение WebSocket-инстанса

  const connect = useCallback(() => {
    const socket = new WebSocket(url); // Подключение к серверу
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
      setReconnectAttempts(0); // Сброс попыток переподключения
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Error parsing WebSocket message", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
      setError("WebSocket error occurred.");
    };

    socket.onclose = (event) => {
      console.warn("WebSocket closed:", event.reason || "No reason provided");
      setIsConnected(false);
      setReconnectAttempts((prev) => prev + 1);

      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(connect, reconnectInterval); // Переподключение через заданный интервал
      } else {
        console.error("Max reconnect attempts reached.");
      }
    };
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  useEffect(() => {
    connect(); // Инициализация подключения

    return () => {
      socketRef.current?.close(); // Очистка ресурса при размонтировании
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socketRef.current && isConnected) {
        socketRef.current.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket is not connected.");
      }
    },
    [isConnected]
  );

  return {
    isConnected,
    error,
    reconnectAttempts,
    sendMessage,
  };
};

export default useWebSocket;
