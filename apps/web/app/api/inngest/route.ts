import { inngestClient } from "@/lib/inngest";
import { serve } from "inngest/next";
import { validateIdea } from "@/inngest/idea";
import { generateFeature } from "@/inngest/project";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [validateIdea, generateFeature],
});
