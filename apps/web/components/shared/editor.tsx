"use client";
import {
  useCreateBlockNoteWithLiveblocks,
  FloatingComposer,
  FloatingThreads,
} from "@liveblocks/react-blocknote";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useThreads } from "@liveblocks/react/suspense";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

function Editor() {
  const { theme } = useTheme();
  const { threads } = useThreads();

  const { startUpload } = useUploadThing("fileUpload", {
    onClientUploadComplete: (files) => {
      console.log("Upload complete:", files);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    },
  });

  // File upload handler for BlockNote
  const handleFileUpload = async (file: File, blockId?: string) => {
    try {
      const uploadedFiles = await startUpload([file]);

      if (uploadedFiles && uploadedFiles.length > 0) {
        return uploadedFiles[0]?.ufsUrl || "";
      }
      return "";
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload file");
      return "";
    }
  };

  const editor = useCreateBlockNoteWithLiveblocks({
    uploadFile: handleFileUpload,
  });

  return (
    <div>
      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        className="px-0"
        editor={editor}
        data-theming-css-variables-demo
      />
      {/* @ts-ignore */}
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
      {/* @ts-ignore */}
      <FloatingThreads editor={editor} threads={threads} />
    </div>
  );
}

export default Editor;
