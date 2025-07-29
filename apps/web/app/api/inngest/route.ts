import { inngestClient } from "@/lib/inngest";
import { serve } from "inngest/next";
import { simpleAgentFunction } from "@/inngest/agent";
import { deepResearchAgent } from "@/inngest/deep-research";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [simpleAgentFunction, deepResearchAgent],
});
