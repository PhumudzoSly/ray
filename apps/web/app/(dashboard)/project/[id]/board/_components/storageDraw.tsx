"use client";

import "tldraw/tldraw.css";
import { Tldraw, DefaultStylePanel } from "tldraw";
import { useYjsStore } from "./useYjsStore";
import { useSession } from "@/context/session-context";

export function StorageTldraw({ id }: { id: string }) {
  const { userId, name } = useSession();
  const store = useYjsStore({
    projectId: id,
    user: { id: userId || "", name, color: "#f7f7" },
  });

  // Show loading state while store is loading
  if (store.status === "loading") {
    return (
      <div
        style={{ height: "calc(100vh - 54px)" }}
        className="flex items-center justify-center bg-background"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 54px)" }} className="tldraw__editor">
      <Tldraw
        store={store}
        maxAssetSize={2 * 1024 * 1024}
        inferDarkMode
        options={{
          branding: "Ray AI",
          maxPages: 5,
          maxFilesAtOnce: 2,
          maxShapesPerPage: 200,
        }}
        components={{
          StylePanel: () => (
            <div
              style={{
                display: "flex-column",
                marginTop: 4,
              }}
            >
              <DefaultStylePanel />
            </div>
          ),
        }}
        autoFocus
      />
    </div>
  );
}
