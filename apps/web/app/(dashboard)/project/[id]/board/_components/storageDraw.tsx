"use client";

import "tldraw/tldraw.css";
import { Tldraw, DefaultStylePanel } from "tldraw";
import { useStorageStore } from "./useStorageStore";
import { useSession } from "@/context/session-context";
import { useTheme } from "next-themes";

export function StorageTldraw({ id }: { id: string }) {
  const { userId, name } = useSession();
  const store = useStorageStore({
    user: { id: userId || "", name, color: "#f7f7" },
  });

  const { theme } = useTheme();

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
