import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import { api } from "@workspace/backend";
import { useTheme } from "next-themes";
import LoadingSpinner from "../../../../packages/ui/src/components/loading-spinner";

export function BlockEditor({ id }: { id: string }) {
  const sync = useBlockNoteSync<BlockNoteEditor>(api.doc, id, {
    debug: true,
  });

  if (!sync.isLoading && sync.editor === null) {
    sync.create({ type: "doc", content: [] });
  }

  const { theme } = useTheme();

  return sync.editor ? (
    <div className="py-8">
      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        editor={sync.editor}
        className="px-0"
        slashMenu={true}
        data-theming-css-variables-demo
      />
    </div>
  ) : (
    <LoadingSpinner />
  );
}
