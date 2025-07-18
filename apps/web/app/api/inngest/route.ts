import { inngest } from "@/inngest";
import { serve } from "inngest/next";
import { validateIdea } from "@/inngest";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [validateIdea],
});
