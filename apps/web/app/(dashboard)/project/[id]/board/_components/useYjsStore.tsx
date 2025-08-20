import { useEffect, useState } from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
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

  useEffect(() => {
    if (!projectId) return;

    const yDoc = new Y.Doc();
    const yStore = yDoc.getMap<TLRecord>("tldraw");

    const unsubs: (() => void)[] = [];

    setStoreWithStatus({ status: "loading" });

    let provider: WebrtcProvider | null = null;

    async function setup() {
      try {
        if (!projectId) return;
        const data = await getOrCreateBoard(projectId);
        if (data && data.content) {
          Y.applyUpdate(yDoc, new Uint8Array(data.content));
        }
      } catch (error) {
        console.error("Failed to load board content:", error);
      }

      const onSync = () => {
        if (yStore.size === 0) {
          const newPageId = 'page:page' as TLPageId;
          store.put([
            DocumentRecordType.create({ id: 'document:document' as TLDocument['id'] }),
            PageRecordType.create({
              id: newPageId,
              name: 'Page 1',
              index: 'a1' as IndexKey,
            }),
          ]);
        } else {
          store.loadSnapshot({
            store: yStore.toJSON() as Record<TLRecord['id'], TLRecord>,
            schema: store.schema.serialize(),
          });
        }

        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'online',
        });
      };

      // Create the provider after loading the initial data
      provider = new WebrtcProvider(`tldraw-${projectId}`, yDoc, {
        signaling: ["wss://signaling.y-webrtc.dev"],
      });

      if (provider.connected) {
        onSync();
      } else {
        provider.once('synced', onSync);
      }

      unsubs.push(
        store.listen(
          ({ changes }: TLStoreEventInfo) => {
            yDoc.transact(() => {
              Object.values(changes.added).forEach((record) => {
                yStore.set(record.id, record);
              });
              Object.values(changes.updated).forEach(([_, record]) => {
                yStore.set(record.id, record);
              });
              Object.values(changes.removed).forEach((record) => {
                yStore.delete(record.id);
              });
            }, "user");
          },
          { source: "user", scope: "document" }
        )
      );

      const handleYjsChanges = (
        events: Y.YEvent<any>[],
        transaction: Y.Transaction
      ) => {
        if (transaction.local) return;

        const toPut: TLRecord[] = [];
        const toRemove: TLRecord["id"][] = [];

        for (const event of events) {
          event.changes.keys.forEach((change, key) => {
            if (change.action === "add" || change.action === "update") {
              const record = yStore.get(key);
              if (record) {
                toPut.push(record);
              }
            } else if (change.action === "delete") {
              toRemove.push(key as TLRecord["id"]);
            }
          });
        }

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      yStore.observeDeep(handleYjsChanges);
      unsubs.push(() => yStore.unobserveDeep(handleYjsChanges));

      const saveInterval = setInterval(async () => {
        const content = Y.encodeStateAsUpdate(yDoc);
        if (!projectId) return;
        try {
          await saveBoard(projectId, Array.from(content));
        } catch (error) {
          console.error("Failed to save board content:", error);
        }
      }, 2000);
      unsubs.push(() => clearInterval(saveInterval));

    }

    setup();

    return () => {
      provider?.destroy();
      unsubs.forEach((fn) => fn());
      unsubs.length = 0;
    };
  }, [store, projectId]);

  return storeWithStatus;
}
