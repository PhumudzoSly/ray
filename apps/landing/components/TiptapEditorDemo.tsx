"use client";

import { useState } from "react";
import { Editor } from "@workspace/tiptap-editor";
import "@workspace/tiptap-editor/styles";

export function TiptapEditorDemo() {
  const [content, setContent] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Tiptap Editor with Slash Commands
        </h2>
        <p className="text-muted-foreground mb-4">
          Start typing or press "/" to see available commands. Use arrow keys to
          navigate and Enter to select.
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-background">
        <Editor
          content={content}
          onUpdate={setContent}
          placeholder="Start typing or press '/' for commands..."
          className="min-h-[300px]"
        />
      </div>

      {content && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Generated HTML:</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
