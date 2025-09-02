"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect } from "react";
import { useTheme } from "next-themes";

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

  const editor = useCreateBlockNote({
    initialContent: content,
  });

  // Handle content changes
  useEffect(() => {
    if (!editor || !onChange) return;

    const unsubscribe = editor.onChange(() => {
      const newContent = editor.document;
      onChange(newContent);
    });

    return unsubscribe;
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
