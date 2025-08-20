"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import { Send, Paperclip, Smile, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { suggestion } from "./mention-suggestion";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { uploadFiles } from "@/lib/uploadthing";

// Add mention styles
const mentionStyles = `
  .mention {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: 0.25rem;
    color: rgb(59, 130, 246);
    padding: 0.125rem 0.25rem;
    text-decoration: none;
    font-weight: 500;
  }
  
  .mention:hover {
    background-color: rgba(59, 130, 246, 0.2);
  }
`;

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface UploadedCommentFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface AttachmentItem {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "pending" | "uploading" | "success" | "error" | "canceled";
  error?: string;
  uploaded?: UploadedCommentFile;
  controller?: AbortController;
}

export interface CommentInputProps {
  onSubmit: (content: string, attachments: UploadedCommentFile[]) => void;
  organizationMembers?: OrganizationMember[];
  placeholder?: string;
  initialContent?: string;
  isEditing?: boolean;
  maxAttachments?: number;
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (content: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Serialize editor JSON to a plain string where mention nodes are stored as user:{id}
function serializeContentWithMentions(editor: Editor): string {
  const json = editor.getJSON();

  function walk(node: any): string {
    if (!node) return "";

    // Text node
    if (node.type === "text") return node.text || "";

    // Mention node -> persist as user:{id}
    if (node.type === "mention") {
      const id = node.attrs?.id as string | undefined;
      if (!id) return "";
      return `user:{${id}}`;
    }

    // Container node with content
    if (Array.isArray(node.content)) return node.content.map(walk).join("");

    return "";
  }

  return walk(json).trim();
}

export function CommentInput({
  onSubmit,
  organizationMembers = [],
  placeholder = "Write a comment...",
  initialContent = "",
  isEditing = false,
  maxAttachments = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className,
  value, // This prop will now be used to control the editor's content
  onChange, // This prop will be used to report content changes
}: CommentInputProps) {
  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Internal state for editor content, controlled by `value` prop
  const [editorContent, setEditorContent] = React.useState(value || "");

  // Keep organizationMembers fresh for TipTap suggestion closures
  const membersRef = React.useRef<OrganizationMember[]>(organizationMembers);
  React.useEffect(() => {
    membersRef.current = organizationMembers;
  }, [organizationMembers]);

  // Inject mention styles
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = mentionStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      // Use a minimal document structure for plain text
      Document.extend({
        content: "paragraph+",
      }),
      StarterKit.configure({
        // Disable all formatting options to keep it plain text
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.extend({
        addAttributes() {
          return {
            id: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-id"),
              renderHTML: (attributes) => {
                if (!attributes.id) {
                  return {};
                }
                return {
                  "data-id": attributes.id,
                };
              },
            },
            label: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-label"),
              renderHTML: (attributes) => {
                if (!attributes.label) {
                  return {};
                }
                return {
                  "data-label": attributes.label,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: suggestion(() => membersRef.current),
        renderLabel({ node }) {
          // Attempt to find the member's name from organizationMembers using the ID
          const member = membersRef.current.find((m) => m.id === node.attrs.id);
          return `@${member?.name ?? node.attrs.label ?? node.attrs.id}`;
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
          "min-h-[80px] max-w-none p-3 text-sm",
          "placeholder:text-muted-foreground"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getText();
      setEditorContent(newContent); // Update internal state
      if (onChange) {
        onChange(newContent); // Report change via prop
      }
    },
  });

  // Sync editor content with `value` prop
  React.useEffect(() => {
    if (editor && value !== undefined && value !== editor.getText()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const handleEmojiSelect = (emoji: { native: string }) => {
    if (editor) {
      editor.commands.insertContent(emoji.native);
    }
  };

  function startSingleFileUpload(file: File) {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const controller = new AbortController();

    setAttachments((prev) => [
      ...prev,
      {
        id,
        file,
        progress: 0,
        status: "uploading",
        controller,
      },
    ]);

    uploadFiles("fileUpload", {
      files: [file],
      onUploadProgress: (opts: { file: File; progress: number; loaded: number; delta: number; totalLoaded: number; totalProgress: number; }) => {
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, progress: opts.progress } : a))
        );
      },
      signal: controller.signal as any,
    })
      .then((res) => {
        const uploaded = Array.isArray(res) ? res[0] : undefined;
        if (!uploaded || !uploaded.url || !uploaded.key) {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, status: "error", error: "Upload failed" }
                : a
            )
          );
          return;
        }
        const uploadedInfo: UploadedCommentFile = {
          key: uploaded.key,
          url: uploaded.url,
          name: uploaded.name || file.name,
          size: uploaded.size || file.size,
          type: uploaded.type || file.type,
        };
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "success", progress: 100, uploaded: uploadedInfo }
              : a
          )
        );
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          // Upload was canceled
          setAttachments((prev) => prev.filter((a) => a.id !== id));
          return;
        }
        console.error("Upload error:", err);
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "error", error: "Upload failed" }
              : a
          )
        );
      });
  }

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!editor) return;

      // Persist mentions as user:{id} while showing names in the editor
      const content = serializeContentWithMentions(editor);
      const successful = attachments.filter((a) => a.status === "success" && a.uploaded).map((a) => a.uploaded!)
      if (!content && successful.length === 0) return;

      onSubmit(content, successful);

      // Clear editor and attachments after submit
      editor.commands.clearContent();
      setAttachments([]);
    },
    [editor, attachments, onSubmit]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      // Validate file count (count all items including uploading/failed)
      if (attachments.length + files.length > maxAttachments) {
        alert(`Maximum ${maxAttachments} files allowed`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = files.filter((file) => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        alert(`Files must be smaller than ${formatFileSize(maxFileSize)}`);
        return;
      }

      // Start uploads immediately
      files.forEach((file) => startSingleFileUpload(file));

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [attachments.length, maxAttachments, maxFileSize]
  );

  const removeAttachment = React.useCallback((index: number) => {
    setAttachments((prev) => {
      const target = prev[index];
      if (!target) return prev;

      // Cancel in-progress uploads
      if (target.status === "uploading" && target.controller) {
        try {
          target.controller.abort();
        } catch {}
        // Remove immediately from UI
        return prev.filter((_, i) => i !== index);
      }

      // Delete already-uploaded file from storage
      if (target.status === "success" && target.uploaded?.key) {
        const key = target.uploaded.key;
        // Fire and forget deletion
        fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: [key] }),
        }).catch((e) => console.error("Failed to delete uploaded file", e));
      }

      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const triggerFileSelect = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  React.useEffect(() => {
    if (editor && initialContent !== editor.getText()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className={cn("border rounded-md p-3", className)}>
        <div className="animate-pulse bg-muted h-20 rounded" />
      </div>
    );
  }

  const hasSuccessfulAttachment = attachments.some((a) => a.status === "success");

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {/* Editor */}
      <div
        className={cn(
          "border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 pointer-events-none"
        )}
        onKeyDown={handleKeyDown}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Attachments:</div>
          <div className="space-y-1">
            {attachments.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Status icon */}
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="truncate">
                      {item.uploaded?.name || item.file.name}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      ({formatFileSize(item.uploaded?.size || item.file.size)})
                    </div>
                    {item.status === "uploading" && (
                      <div className="mt-1 h-1 w-40 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.status === "error" && (
                      <div className="mt-1 text-xs text-red-600">{item.error || "Upload failed"}</div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                  disabled={disabled}
                  aria-label={item.status === "uploading" ? "Cancel upload" : "Remove attachment"}
                  title={item.status === "uploading" ? "Cancel upload" : "Remove attachment"}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Keyboard shortcut hint */}
        <span className="text-xs text-gray-500">
          {/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl"} + Enter to submit
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>

          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={triggerFileSelect}
            disabled={disabled || attachments.length >= maxAttachments}
            className="h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Submit */}
          <Button
            type="submit"
            size="icon"
            disabled={
              disabled ||
              (!serializeContentWithMentions(editor).trim() && !hasSuccessfulAttachment)
            }
            className="h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
