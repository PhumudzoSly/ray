"use client";
import { useEffect, useState } from "react";
import { PartialBlock } from "@blocknote/core";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { DocumentEntityType, EntityDocumentContentParams } from "./index";
import { getEntityDocumentContent } from "@/actions/documents/document";

export function useInitialContent(
  entityType: DocumentEntityType | undefined,
  entityId: string | undefined
) {
  const { data: initialContent, isLoading: isFetchingInitialContent } =
    useQuery({
      queryKey: queryKeys.documents.entity(entityType, entityId),
      queryFn: async () => {
        if (!entityType || !entityId) return null;

        const params: EntityDocumentContentParams = {
          entityType,
          entityId,
        };

        const result = await getEntityDocumentContent(params);
        if (result.success) {
          return result.document.content as PartialBlock[];
        }
        return null;
      },
      enabled: !!entityType && !!entityId,
    });

  const [initialContentLoaded, setInitialContentLoaded] = useState(false);

  // Reset loaded state when entity changes
  useEffect(() => {
    setInitialContentLoaded(false);
  }, [entityType, entityId]);

  return {
    initialContent,
    isFetchingInitialContent,
    initialContentLoaded,
    setInitialContentLoaded,
  };
}
