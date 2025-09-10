"use client";
import { useCallback } from "react";
import { PartialBlock } from "@blocknote/core";
import {
  debounce,
  DocumentEntityType,
  SaveEntityDocumentContentParams,
} from "./index";
import { saveEntityDocumentContent } from "@/actions/documents/document";

export function useAutoSave(
  entityType: DocumentEntityType | undefined,
  entityId: string | undefined
) {
  // Auto-save functionality with debouncing
  const debouncedSave = useCallback(
    debounce(async (content: PartialBlock[]) => {
      // Determine save strategy: entity-based preferred, fallback to legacy documentId
      const params: SaveEntityDocumentContentParams = {
        entityType: entityType as DocumentEntityType,
        entityId: entityId as string,
        content,
      };

      try {
        if (entityType && entityId) {
          const result = await saveEntityDocumentContent(params);

          if (result.success) {
            console.log("Document saved successfully:", result.document.id);
          } else {
            console.error("Failed to save document:", result.error);
          }
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000),
    [entityType, entityId]
  );

  return debouncedSave;
}
