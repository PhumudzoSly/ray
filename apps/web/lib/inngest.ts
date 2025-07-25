import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";
// In development, we can run without an event key for local testing
// In production, the event key is required for Inngest Cloud
const eventKey =
  process.env.NODE_ENV === "production"
    ? process.env.INNGEST_EVENT_KEY
    : undefined;

export const inngestClient = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
  ...(eventKey && { eventKey }),
});
