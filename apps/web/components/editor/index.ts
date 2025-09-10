"use client";
export type DocumentEntityType =
  | "project"
  | "issue"
  | "feature"
  | "milestone"
  | "competitor"
  | "competitorSwot"
  | "competitiveMove"
  | "roadmapItem"
  | "actionItem";

// Custom debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

export interface CollaborativeEditorProps {
  // New API: save by entity type and id
  entityType?: DocumentEntityType;
  entityId?: string;
}

export const USER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#FF9F43",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF9FF3",
  "#54A0FF",
  "#1DD1A1",
  "#FD79A8",
  "#FDCB6E",
  "#6C5CE7",
  "#A29BFE",
  "#FD79A8",
  "#E17055",
  "#00B894",
  "#00CEC9",
  "#E84393",
  "#FDCB6E",
  "#6C5CE7",
  "#74B9FF",
  "#55A3FF",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length] || "#000000";
}

// Export the new hooks
export { useWebsocketProvider } from "./use-websocket-provider";
export { useAutoSave } from "./use-auto-save";
export { useInitialContent } from "./use-initial-content";

// Export types
export type {
  DocumentSaveResult,
  EntityDocumentContentParams,
  SaveEntityDocumentContentParams,
} from "./types";

// Export components
export { Editor } from "../editor";
