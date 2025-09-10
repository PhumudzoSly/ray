"use client";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useMemo } from "react";

export function useWebsocketProvider(
  entityType: string | undefined,
  entityId: string | undefined,
  doc: Y.Doc
) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create stable room ID (org scoping disabled for dev mode)
  const stableRoomId = useMemo(() => {
    const baseRoomId = `${entityType}-${entityId}` || "default-room";
    // Organization scoping disabled for development
    return baseRoomId;
  }, [entityType, entityId]);

  // Initialize provider once and handle cleanup
  useEffect(() => {
    // WebSocket initialization (authentication disabled for dev mode)

    let websocketProvider: WebsocketProvider | null = null;
    let mounted = true;

    const initProvider = async () => {
      try {
        // Build WebSocket URL with room path (dev mode)
        const baseUrl =
          process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:1234";
        const wsUrl = `${baseUrl}/${stableRoomId}`;

        websocketProvider = new WebsocketProvider(wsUrl, stableRoomId, doc);

        // Add connection event listeners for debugging
        websocketProvider.on("status", (event: any) => {
          console.log("WebSocket status:", event.status);
          if (mounted) {
            if (event.status === "connected") {
              setConnectionStatus("connected");
            } else if (event.status === "disconnected") {
              setConnectionStatus("disconnected");
            }
          }
        });

        websocketProvider.on("connection-close", (event: any) => {
          console.log("WebSocket connection closed:", event);
          if (mounted) {
            setConnectionStatus("disconnected");
            // Auto-reconnect after a delay
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mounted && websocketProvider) {
                console.log("Attempting to reconnect WebSocket...");
                setConnectionStatus("connecting");
                websocketProvider.connect();
              }
            }, 3000); // Reconnect after 3 seconds
          }
        });

        websocketProvider.on("connection-error", (event: any) => {
          console.error("WebSocket connection error:", event);
          if (mounted) {
            setConnectionStatus("disconnected");
            // Auto-reconnect after a delay on error
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mounted && websocketProvider) {
                console.log("Attempting to reconnect after error...");
                setConnectionStatus("connecting");
                websocketProvider.connect();
              }
            }, 5000); // Longer delay for errors
          }
        });

        // Small delay to allow initial connection and prevent rapid reconnection cycles
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (mounted) {
          setProvider(websocketProvider);
        }
      } catch (e) {
        console.error("Failed to create WebsocketProvider:", e);
        if (mounted) {
          setProvider(null);
          setConnectionStatus("disconnected");
        }
      }
    };

    initProvider();

    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocketProvider) {
        websocketProvider.destroy();
      }
    };
  }, [stableRoomId, doc]);

  return {
    provider,
    connectionStatus,
    setConnectionStatus,
  };
}
