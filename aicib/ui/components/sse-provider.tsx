"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

export interface SSEEvent {
  type: string;
  data: unknown;
}

interface SSEContextValue {
  lastEvent: SSEEvent | null;
  connected: boolean;
}

const SSEContext = createContext<SSEContextValue>({
  lastEvent: null,
  connected: false,
});

export function SSEProvider({ children }: { children: ReactNode }) {
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/stream");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as SSEEvent;
        setLastEvent(parsed);
      } catch {
        // Ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return (
    <SSEContext.Provider value={{ lastEvent, connected }}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE(): SSEContextValue {
  return useContext(SSEContext);
}
