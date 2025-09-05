"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  saveEntityDocumentContent,
  getEntityDocumentContent,
} from "../actions/documents/document";
import { useTheme } from "next-themes";
import { useSession } from "../context/session-context";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/query-keys";

type DocumentEntityType =
  | "project"
  | "issue"
  | "feature"
  | "milestone"
  | "competitor"
  | "competitorSwot"
  | "competitiveMove"
  | "roadmapItem"
  | "actionItem";

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

interface CollaborativeEditorProps {
  // New API: save by entity type and id
  entityType?: DocumentEntityType;
  entityId?: string;
}

const USER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#FF9F43",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF9FF3",
  "#54A0FF",
  "#1DD1A1",
  "#FD79A8",
  "#FDCB6E",
  "#6C5CE7",
  "#A29BFE",
  "#FD79A8",
  "#E17055",
  "#00B894",
  "#00CEC9",
  "#E84393",
  "#FDCB6E",
  "#6C5CE7",
  "#74B9FF",
  "#55A3FF",
];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length] || "#000000";
}

export function CollaborativeEditor({
  entityType,
  entityId,
}: CollaborativeEditorProps) {
  const { theme } = useTheme();
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useSession();

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

  // Auto-save functionality with debouncing
  const debouncedSave = useCallback(
    debounce(async (content: PartialBlock[]) => {
      // Determine save strategy: entity-based preferred, fallback to legacy documentId
      const resolved: {
        type?: DocumentEntityType;
        id?: string;
      } = {
        type: entityType,
        id: entityId,
      };

      try {
        let result:
          | { success: true; document: any }
          | { success: false; error: string };

        if (resolved.type && resolved.id) {
          result = await saveEntityDocumentContent({
            entityType: resolved.type,
            entityId: resolved.id,
            content,
          });
        } else {
          return;
        }

        if (result.success) {
          console.log("Document saved successfully:", result.document.id);
        } else {
          console.error("Failed to save document:", result.error);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
      }
    }, 2000),
    [entityType, entityId]
  );

  const { data: initialContent, isLoading: isFetchingInitialContent } =
    useQuery({
      queryKey: queryKeys.documents.entity(entityType, entityId),
      queryFn: async () => {
        if (!entityType || !entityId) return null;
        const result = await getEntityDocumentContent({ entityType, entityId });
        if (result.success) {
          return result.document.content as PartialBlock[];
        }
        return null;
      },
      enabled: !!entityType && !!entityId,
    });

  const editor = useCreateBlockNote(
    {
      collaboration:
        provider && user
          ? {
              provider: provider,
              fragment: doc.getXmlFragment("document-store"),
              user: {
                name: user.name,
                color: getUserColor(user.userId),
              },
              showCursorLabels: "always",
            }
          : undefined,
    },
    [provider, user]
  );

  // Fallback: if editor is created but no provider, still mark as connected
  useEffect(() => {
    if (editor && !provider && connectionStatus === "connecting") {
      // Editor works without collaboration, so we're "connected" for editing purposes
      setTimeout(() => setConnectionStatus("connected"), 500);
    }
  }, [editor, provider, connectionStatus]);

  // State to track if initial content has been loaded
  const [initialContentLoaded, setInitialContentLoaded] = useState(false);

  // Effect to load initial content into the editor
  useEffect(() => {
    if (editor && initialContent && !initialContentLoaded) {
      console.log("Loading initial content into editor");
      editor.replaceBlocks(editor.document, initialContent);
      setInitialContentLoaded(true);
      // If we successfully load content, we're effectively "connected"
      setConnectionStatus("connected");
    } else if (
      editor &&
      !initialContent &&
      !initialContentLoaded &&
      !isFetchingInitialContent
    ) {
      // No initial content but editor is ready - mark as loaded and connected
      setInitialContentLoaded(true);
      setConnectionStatus("connected");
    }
  }, [
    editor,
    initialContent,
    initialContentLoaded,
    isFetchingInitialContent,
    entityType,
    entityId,
  ]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Handle document changes for auto-save
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const content = editor.document;
      debouncedSave(content);

      // If we're getting document changes, we're definitely connected
      if (connectionStatus !== "connected") {
        setConnectionStatus("connected");
      }
    };

    editor.onChange(handleChange);

    return () => {
      debouncedSave.cancel();
    };
  }, [editor, debouncedSave, connectionStatus]);

  // Add cleanup for Y.Doc
  useEffect(() => {
    return () => {
      doc.destroy();
    };
  }, [doc]);

  const isEditorLoading = isFetchingInitialContent || !initialContentLoaded;

  return (
    <div className="relative">
      {(connectionStatus !== "connected" || isEditorLoading) && (
        <div
          className={`absolute top-2 right-2 text-sm px-2 py-1 rounded z-10 ${
            connectionStatus === "connecting" || isEditorLoading
              ? "text-amber-600 bg-amber-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {connectionStatus === "connecting" || isEditorLoading
            ? "Connecting..."
            : "Reconnecting..."}
        </div>
      )}

      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        editor={editor}
        editable={!isEditorLoading}
        data-theming-css-variables-demo
        className="min-h-[100px] w-full h-full max-w-none w-full"
      />
    </div>
  );
}
