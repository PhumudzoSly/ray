"use client";

import {
  BlockNoteEditor,
  PartialBlock,
  createInlineContentSpec,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
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
import { getOrgMembers } from "../actions/account/user";

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
  entityType?:
    | "project"
    | "issue"
    | "feature"
    | "milestone"
    | "competitor"
    | "competitorSwot"
    | "competitiveMove"
    | "roadmapItem";
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

// Define member type based on actual API response
interface OrgMember {
  id: string;
  organizationId: string;
  role: "member" | "owner" | "admin";
  createdAt: Date;
  userId: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
}

export function CollaborativeEditor({
  entityType,
  entityId,
  documentId,
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
    const baseRoomId =
      `${entityType}-${entityId}` || documentId || "default-room";
    // Organization scoping disabled for development
    return baseRoomId;
  }, [entityType, entityId, documentId]);

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
            // Don't change to "connecting" for intermediate states to prevent blinking
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
        type?:
          | "project"
          | "issue"
          | "feature"
          | "milestone"
          | "competitor"
          | "competitorSwot"
          | "competitiveMove"
          | "roadmapItem";
        id?: string;
      } = {
        type: entityType,
        id: entityId,
      };

      // Backward compatibility: parse legacy documentId pattern like "project-<id>"
      if (!resolved.type && !resolved.id && documentId) {
        const match =
          /^(project|issue|feature|milestone|competitor|competitorSwot|competitiveMove|roadmapItem)-(\w[\w-]*)$/.exec(
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

  const { data: initialContent, isLoading: isFetchingInitialContent } =
    useQuery({
      queryKey: queryKeys.documents.entity(entityType, entityId),
      queryFn: async () => {
        if (!entityType || !entityId) return null;
        console.log("Fetching document for:", { entityType, entityId });
        const result = await getEntityDocumentContent({ entityType, entityId });
        console.log("Document fetch result:", result);
        if (result.success) {
          return result.document.content as PartialBlock[];
        }
        return null;
      },
      enabled: !!entityType && !!entityId,
    });

  // Fetch organization members for mentions
  const { data: orgMembers } = useQuery({
    queryKey: ["orgMembers"],
    queryFn: async () => {
      const members = await getOrgMembers();
      return members || [];
    },
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
    console.log("Content loading effect:", {
      hasEditor: !!editor,
      hasInitialContent: !!initialContent,
      initialContentLoaded,
      entityType,
      entityId,
    });

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
      console.log("No initial content, marking as loaded");
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

  // State for mention menu
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionMenuPosition, setMentionMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  // Filter members based on query
  const filteredMembers = useMemo(() => {
    if (!orgMembers || !mentionQuery) return orgMembers || [];

    return orgMembers
      .filter(
        (member: OrgMember) =>
          member.user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          member.user.email.toLowerCase().includes(mentionQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [orgMembers, mentionQuery]);

  // Handle mention insertion
  const insertMention = useCallback(
    (member: OrgMember) => {
      if (!editor) return;

      // For now, just insert the mention as regular text
      // We'll enhance this with proper inline content later
      const mentionText = `@${member.user.name} `;

      // Insert the mention by manipulating the DOM directly
      // This is a workaround until we implement proper BlockNote inline content
      try {
        const editorElement = document.querySelector(
          '.bn-editor [contenteditable="true"]'
        );
        if (editorElement) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // Delete the @ and query text
            const textNode = range.startContainer;
            if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
              const text = textNode.textContent;
              const atIndex = text.lastIndexOf("@");
              if (atIndex !== -1) {
                // Replace from @ to cursor with the mention
                const beforeAt = text.substring(0, atIndex);
                const afterCursor = text.substring(range.startOffset);
                textNode.textContent = beforeAt + mentionText + afterCursor;

                // Set cursor after the mention
                const newRange = document.createRange();
                newRange.setStart(
                  textNode,
                  beforeAt.length + mentionText.length
                );
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error inserting mention:", error);
        // Fallback: just log the mention
        console.log(`Mentioning: ${member.user.name}`);
      }

      setShowMentionMenu(false);
      setMentionQuery("");
    },
    [editor, mentionQuery]
  );

  // Handle keyboard events for mention detection
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showMentionMenu) {
        if (event.key === "Escape") {
          setShowMentionMenu(false);
          setMentionQuery("");
          event.preventDefault();
          return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          // Handle arrow navigation in mention menu
          event.preventDefault();
          return;
        }

        if (event.key === "Enter" && filteredMembers.length > 0) {
          insertMention(filteredMembers[0]!);
          event.preventDefault();
          return;
        }
      }
    };

    const handleInput = () => {
      const selection = editor.getTextCursorPosition();
      if (!selection) return;

      const block = selection.block;
      const content = block.content;

      // Check if we're typing after an @
      if (Array.isArray(content)) {
        const textContent = content
          .filter((item) => typeof item === "string")
          .join("");

        const atIndex = textContent.lastIndexOf("@");
        if (atIndex !== -1) {
          const afterAt = textContent.slice(atIndex + 1);

          // If there's no space after @, we're in mention mode
          if (!afterAt.includes(" ") && afterAt.length <= 20) {
            setMentionQuery(afterAt);
            setShowMentionMenu(true);

            // Get cursor position for menu placement
            const editorElement = document.querySelector(".bn-editor");
            if (editorElement) {
              const rect = editorElement.getBoundingClientRect();
              setMentionMenuPosition({
                x: rect.left,
                y: rect.top + 30,
              });
            }
            return;
          }
        }
      }

      // Hide mention menu if not in mention mode
      if (showMentionMenu) {
        setShowMentionMenu(false);
        setMentionQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    editor.onChange(handleInput);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, showMentionMenu, filteredMembers, insertMention]);

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

      {/* Mention Menu */}
      {showMentionMenu && filteredMembers.length > 0 && (
        <div
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-64"
          style={{
            left: mentionMenuPosition.x,
            top: mentionMenuPosition.y,
          }}
        >
          {filteredMembers.map((member: OrgMember, index: number) => (
            <div
              key={member.id}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              onClick={() => insertMention(member)}
            >
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {member.user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {member.user.email}
                </div>
              </div>
            </div>
          ))}
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
