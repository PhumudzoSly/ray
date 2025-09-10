import { PartialBlock } from "@blocknote/core";
import { DocumentEntityType } from "./index";

export type { DocumentEntityType };

export interface DocumentSaveResult {
  success: boolean;
  document?: any;
  error?: string;
}

export interface EntityDocumentContentParams {
  entityType: DocumentEntityType;
  entityId: string;
}

export interface SaveEntityDocumentContentParams
  extends EntityDocumentContentParams {
  content: PartialBlock[];
}
