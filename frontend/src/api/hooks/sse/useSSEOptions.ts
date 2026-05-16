import { useEffect, useRef, useState, useCallback } from "react";

interface UseSSEOptions {
  onMessage?: (event: MessageEvent) => void; // Обработка входящих сообщений
  onError?: (error: Event) => void; // Обработка ошибок
  onOpen?: (event: Event) => void; // Обработка открытия соединения
  reconnectInterval?: number; // Начальная задержка для реконнекта (в миллисекундах)
  maxReconnectInterval?: number; // Максимальная задержка для реконнекта (в миллисекундах)
  maxRetries?: number; // Максимальное количество попыток реконнекта
}

interface UseSSEReturn {
  start: () => void; // Старт соединения
  stop: () => void; // Остановка соединения
  isConnected: boolean; // Состояние соединения
}

export const useSSEOptions = (
  url: string,
  options: UseSSEOptions = {}
): UseSSEReturn => {
  const {
    onMessage,
    onError,
    onOpen,
    reconnectInterval = 1000, // Начальная задержка реконнекта (по умолчанию 1 сек)
    maxReconnectInterval = 60000, // Максимальная задержка реконнекта (по умолчанию 60 сек)
    maxRetries = 10 // Максимальное количество попыток реконнекта
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const currentReconnectInterval = useRef<number>(reconnectInterval); // Инициализируем с числом

  // Подключение SSE
  const start = useCallback(() => {
    if (eventSourceRef.current) return; // Если уже есть подключение, то выходим

    const eventSource = new EventSource(url);

    eventSource.onopen = (event) => {
      setIsConnected(true);
      retryCountRef.current = 0; // Сброс счетчика попыток реконнекта
      currentReconnectInterval.current = reconnectInterval; // Сброс интервала реконнекта
      onOpen && onOpen(event);
    };

    eventSource.onmessage = (event) => {
      onMessage && onMessage(event);
    };

    eventSource.onerror = (error) => {
      console.error("❌ Ошибка SSE", error);
      setIsConnected(false);
      onError && onError(error);

      stop(); // Закрываем текущее соединение
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        currentReconnectInterval.current = Math.min(
          currentReconnectInterval.current * 2,
          maxReconnectInterval
        );
        reconnectTimeoutRef.current = setTimeout(start, currentReconnectInterval.current);
      }
    };

    eventSourceRef.current = eventSource;
  }, [url, onOpen, onMessage, onError, reconnectInterval, maxReconnectInterval, maxRetries]);

  // Остановка SSE
  const stop = useCallback(() => {
    if (!eventSourceRef.current) return;
    eventSourceRef.current.close();
    eventSourceRef.current = null;
    setIsConnected(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop, isConnected };
};
