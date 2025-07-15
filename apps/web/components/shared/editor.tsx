import {
  useCreateBlockNoteWithLiveblocks,
  FloatingComposer,
  FloatingThreads,
  AnchoredThreads,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useThreads } from "@liveblocks/react/suspense";

function Editor() {
  //
  const editor = useCreateBlockNoteWithLiveblocks({});
  const { theme } = useTheme();
  const { threads } = useThreads();
  return (
    <div>
      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        className="px-0"
        editor={editor}
        data-theming-css-variables-demo
      />
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
      <FloatingThreads editor={editor} threads={threads} />
    </div>
  );
}

export default Editor;
