"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { uploadFiles } from "@/lib/uploadthing";
import { debounce } from "./editor/index";

export function Editor({
  content,
  editable = false,
  onChange,
}: {
  content?: PartialBlock[];
  editable?: boolean;
  onChange?: (content: PartialBlock[]) => void;
}) {
  const { theme } = useTheme();

  // Upload function for BlockNote editor
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

  const editor = useCreateBlockNote({
    initialContent: content,
    uploadFile,
  });

  // Handle content changes
  useEffect(() => {
    if (!editor || !onChange) return;

    // Create a debounced version of the onChange callback
    const debouncedOnChange = debounce(() => {
      const newContent = editor.document;
      onChange(newContent);
    }, 500); // 500ms debounce

    const unsubscribe = editor.onChange(() => {
      debouncedOnChange();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      debouncedOnChange.cancel();
    };
  }, [editor, onChange]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (!editor || !content) return;

    // Only update if the content is different from current editor content
    const currentContent = editor.document;
    const contentChanged =
      JSON.stringify(currentContent) !== JSON.stringify(content);

    if (contentChanged) {
      editor.replaceBlocks(editor.document, content);
    }
  }, [editor, content]);

  return (
    <div className="relative">
      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        editor={editor}
        editable={editable}
        data-theming-css-variables-demo
        className="min-h-[100px] w-full h-full max-w-none w-full"
      />
    </div>
  );
}
