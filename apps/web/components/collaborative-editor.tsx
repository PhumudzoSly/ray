"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { toast } from "sonner";
import {
  saveDocumentContent,
  saveEntityDocumentContent,
} from "../actions/documents/document";
import { useTheme } from "next-themes";
import { useSession } from "../context/session-context";
import { useQuery } from "@tanstack/react-query";
import { getEntityDocumentContent } from "../actions/documents/document";
import { queryKeys } from "../lib/query-keys";

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
  entityType?: "project" | "issue" | "feature" | "milestone";
  entityId?: string;
  documentId?: string;
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
  documentId,
}: CollaborativeEditorProps) {
  const { theme } = useTheme();
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useSession();

  // Create stable room ID
  const stableRoomId = useMemo(() => {
    return `${entityType}-${entityId}` || documentId || "default-room";
  }, [entityType, entityId, documentId]);

  // Initialize provider once and handle cleanup
  useEffect(() => {
    let webrtcProvider: WebrtcProvider | null = null;
    let mounted = true;

    const initProvider = async () => {
      try {
        webrtcProvider = new WebrtcProvider(stableRoomId, doc, {
          signaling: [
            "wss://signaling.yjs.dev",
            "wss://y-webrtc-signaling-eu.herokuapp.com",
            "wss://y-webrtc-signaling-us.herokuapp.com",
          ],
          filterBcConns: false,
          maxConns: 5000000000000,
          peerOpts: {},
        });

        // Add connection event listeners for debugging
        webrtcProvider.on("status", (event: any) => {
          console.log("WebRTC status:", event.status);
        });

        webrtcProvider.on("peers", (event: any) => {
          console.log(
            "Connected peers:",
            event.added,
            "Disconnected:",
            event.removed
          );
        });

        // Small delay to allow initial connection
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (mounted) {
          setProvider(webrtcProvider);

          // Set connected status after a reasonable delay
          // The provider is working if we can set it up successfully
          setTimeout(() => {
            if (mounted) {
              setConnectionStatus("connected");
            }
          }, 2000);
        }
      } catch (e) {
        console.error("Failed to create WebrtcProvider:", e);
        if (mounted) {
          setProvider(null);
        }
      }
    };

    initProvider();

    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (webrtcProvider) {
        webrtcProvider.destroy();
      }
    };
  }, [stableRoomId, doc]);

  // Auto-save functionality with debouncing
  const debouncedSave = useCallback(
    debounce(async (content: PartialBlock[]) => {
      // Determine save strategy: entity-based preferred, fallback to legacy documentId
      const resolved: {
        type?: "project" | "issue" | "feature" | "milestone";
        id?: string;
      } = {
        type: entityType,
        id: entityId,
      };

      // Backward compatibility: parse legacy documentId pattern like "project-<id>"
      if (!resolved.type && !resolved.id && documentId) {
        const match = /^(project|issue|feature|milestone)-(\w[\w-]*)$/.exec(
          documentId
        );
        if (match) {
          resolved.type = match[1] as any;
          resolved.id = match[2];
        }
      }

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
        } else if (documentId) {
          // Fallback to legacy save if only documentId is present
          result = await saveDocumentContent({
            documentId,
            content,
          });
        } else {
          toast.error("Missing entity reference to save document");
          return;
        }

        if (result.success) {
          console.log("Document saved successfully:", result.document.id);
        } else {
          console.error("Failed to save document:", result.error);
          toast.error(result.error || "Failed to save document");
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Failed to save document");
      } finally {
      }
    }, 2000),
    [entityType, entityId, documentId]
  );

  const { data: initialContent, isLoading: isFetchingInitialContent } = useQuery({
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

  // State to track if initial content has been loaded
  const [initialContentLoaded, setInitialContentLoaded] = useState(false);

  // Effect to load initial content into the editor
  useEffect(() => {
    if (editor && initialContent && !initialContentLoaded) {
      editor.replaceBlocks(editor.document, initialContent);
      setInitialContentLoaded(true);
    }
  }, [editor, initialContent, initialContentLoaded]);

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
