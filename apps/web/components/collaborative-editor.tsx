"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { useTheme } from "next-themes";
import { useSession } from "../context/session-context";
import { CollaborativeEditorProps, getUserColor } from "./editor/index";
import { useWebsocketProvider } from "./editor/use-websocket-provider";
import { useAutoSave } from "./editor/use-auto-save";
import { useInitialContent } from "./editor/use-initial-content";
import { uploadFiles } from "@/lib/uploadthing";

export function CollaborativeEditor({
  entityType,
  entityId,
}: CollaborativeEditorProps) {
  const { theme } = useTheme();
  const [doc] = useState(() => new Y.Doc());
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const user = useSession();

  const { provider, connectionStatus, setConnectionStatus } =
    useWebsocketProvider(entityType, entityId, doc);

  const debouncedSave = useAutoSave(entityType, entityId);

  const uploadFile = async (file: File) => {
    try {
      const res = await uploadFiles("fileUpload", { files: [file] });
      const uploaded = Array.isArray(res) ? res[0] : res;
      return uploaded?.ufsUrl || "";
    } catch (error) {
      console.error("Error uploading file:", error);
      return "";
    }
  };

  const {
    initialContent,
    isFetchingInitialContent,
    initialContentLoaded,
    setInitialContentLoaded,
  } = useInitialContent(entityType, entityId);

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
      uploadFile,
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
      // Cancel any pending debounced save when component unmounts
      if (typeof debouncedSave.cancel === "function") {
        debouncedSave.cancel();
      }
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
