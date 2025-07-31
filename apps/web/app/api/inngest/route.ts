import { deepResearchAgent } from "@/inngest/deepResearch";
import { inngestClient } from "@/lib/inngest";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [deepResearchAgent],
});
