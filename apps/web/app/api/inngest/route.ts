import { inngestClient } from "@/lib/inngest";
import { serve } from "inngest/next";
import { validateIdea } from "@/inngest/idea";

export const { GET, POST, PUT } = serve({
	client: inngestClient,
	functions: [validateIdea],
	
});
