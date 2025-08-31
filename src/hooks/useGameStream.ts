import { useEffect, useState, useRef } from "react";

interface UseGameStreamProps {
  gameCode?: string;
  enabled: boolean;
}

interface StreamEvent {
  type: "connected" | "gameUpdate" | "playerJoined" | "gameStarted";
  gameRoom?: any;
  message?: string;
}

export function useGameStream({ gameCode, enabled }: UseGameStreamProps) {
  const [gameRoom, setGameRoom] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !gameCode) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource(`/api/game/room/${gameCode}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log("🔗 Connected to game stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("📡 Stream connected");
            break;
          case "gameUpdate":
            if (data.gameRoom) {
              setGameRoom(data.gameRoom);
            }
            break;
          default:
            console.log("📨 Unknown stream event:", data);
        }
      } catch (err) {
        console.error("Failed to parse stream data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ Stream error:", err);
      setIsConnected(false);
      setError("Connection lost. Attempting to reconnect...");

      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log("🔄 Attempting to reconnect...");
          // The useEffect will handle reconnection when dependencies change
        }
      }, 3000);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [gameCode, enabled]);

  // Manual disconnect function
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  };

  return {
    gameRoom,
    isConnected,
    error,
    disconnect,
  };
}
