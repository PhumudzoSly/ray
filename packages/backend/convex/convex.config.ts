import { defineApp } from "convex/server";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";
import rag from "@convex-dev/rag/convex.config";

const app = defineApp();

app.use(prosemirrorSync);
app.use(rag)

export default app;
