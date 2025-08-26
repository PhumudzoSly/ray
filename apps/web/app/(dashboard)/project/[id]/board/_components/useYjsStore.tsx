import { useEffect, useState, useCallback } from "react";
import {
  DocumentRecordType,
  IndexKey,
  PageRecordType,
  TLAnyShapeUtilConstructor,
  TLDocument,
  TLPageId,
  TLRecord,
  TLStoreEventInfo,
  TLStoreWithStatus,
  createTLStore,
  defaultShapeUtils,
} from "tldraw";
import { getOrCreateBoard, saveBoard } from "../_actions/board-actions";

export function useYjsStore({
  projectId,
  shapeUtils = [],
}: Partial<{
  projectId: string;
  shapeUtils: TLAnyShapeUtilConstructor[];
  user: {
    id: string;
    color: string;
    name: string;
  };
}>) {
  const [store] = useState(() => {
    return createTLStore({
      shapeUtils: [...defaultShapeUtils, ...shapeUtils],
    });
  });

  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (projectId: string, store: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            const snapshot = store.getSnapshot();
            const content = JSON.stringify(snapshot);
            await saveBoard(
              projectId,
              Array.from(new TextEncoder().encode(content))
            );
          } catch (error) {
            console.error("Failed to save board content:", error);
          }
        }, 1000); // Save after 1 second of inactivity
      };
    })(),
    []
  );

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;

    async function setup() {
      try {
        // Load existing board data
        const data = await getOrCreateBoard(projectId);

        if (!mounted) return;

        if (data && data.content && data.content.length > 0) {
          try {
            // Try to parse existing content
            const contentString = new TextDecoder().decode(
              new Uint8Array(data.content)
            );
            const snapshot = JSON.parse(contentString);
            store.loadSnapshot(snapshot);
          } catch (error) {
            console.error("Failed to parse existing board content:", error);
            // Initialize with default content if parsing fails
            initializeDefaultContent();
          }
        } else {
          // Initialize with default content for new boards
          initializeDefaultContent();
        }

        // Set store as ready
        setStoreWithStatus({
          store,
          status: "synced-local",
          connectionStatus: "online",
        });
      } catch (error) {
        console.error("Failed to load board:", error);
        if (mounted) {
          // Initialize with default content on error
          initializeDefaultContent();
          setStoreWithStatus({
            store,
            status: "synced-local",
            connectionStatus: "online",
          });
        }
      }
    }

    function initializeDefaultContent() {
      const newPageId = "page:page" as TLPageId;
      store.put([
        DocumentRecordType.create({
          id: "document:document" as TLDocument["id"],
          gridSize: 10,
          name: "",
          meta: {},
        }),
        PageRecordType.create({
          id: newPageId,
          name: "Page 1",
          index: "a1" as IndexKey,
          meta: {},
        }),
      ]);
    }

    setup();

    // Listen for changes and save them
    const unsubscribe = store.listen(
      ({ changes }: TLStoreEventInfo) => {
        // Only save if there are actual changes
        if (
          Object.keys(changes.added).length > 0 ||
          Object.keys(changes.updated).length > 0 ||
          Object.keys(changes.removed).length > 0
        ) {
          debouncedSave(projectId, store);
        }
      },
      { source: "user", scope: "document" }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [store, projectId, debouncedSave]);

  return storeWithStatus;
}
