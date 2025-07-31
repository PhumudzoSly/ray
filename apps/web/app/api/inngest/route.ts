import { saasValidator } from "@/inngest/agent";
import {
  deepResearchAgent,
  cleanupExpiredSessions,
} from "@/inngest/deepResearch";
import { inngestClient } from "@/lib/inngest";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [saasValidator, deepResearchAgent, cleanupExpiredSessions],
});
