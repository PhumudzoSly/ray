import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "next-themes";
import LoadingSpinner from "../../../../packages/ui/src/components/loading-spinner";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlockDocument, createBlockDocument, updateBlockDocument } from "@/actions/block/getBlockDocument";

export function BlockEditor({ id }: { id: string }) {
  const queryClient = useQueryClient();

  // Fetch the block document
  const { data: blockDoc, isLoading } = useQuery({
    queryKey: ["blockDocument", id],
    queryFn: async () => {
      const doc = await getBlockDocument({ id });
      return doc;
    },
  });

  // Mutation to update the block document
  const updateMutation = useMutation({
    mutationFn: async (content: any) => {
      return updateBlockDocument({ id, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockDocument", id] });
    },
  });

  // Mutation to create a new block document if not found
  const createMutation = useMutation({
    mutationFn: async (content: any) => {
      return createBlockDocument({ title: "Untitled", content });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blockDocument", data.id] });
    },
  });

  const { theme } = useTheme();

  // Handler for saving/updating the document
  const handleSave = (content: any) => {
    if (blockDoc) {
      updateMutation.mutate(content);
    } else {
      createMutation.mutate(content);
    }
  };

  // Render loading spinner if loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render the editor
  return (
    <div className="py-8">
      <BlockNoteView
        theme={theme === "dark" ? "dark" : "light"}
        className="px-0"
        editor={blockDoc?.content}
        slashMenu={true}
        data-theming-css-variables-demo
        onChange={handleSave}
      />
    </div>
  );
}
