import { streamText, UIMessage, convertToModelMessages } from 'ai';
import {google} from '@ai-sdk/google';
import { redis } from '@/lib/redis';
import { createIdGenerator } from "ai";
import { getSession } from '@/actions/account/user';
export const maxDuration = 30;

export async function POST(req: Request) {
    const body = await req.json();
 
    // 👇 get current message and chat id sent from client
    const { message, model, webSearch } = body as { message: UIMessage; id: string; model: string; webSearch: boolean };
    const {org, userId} = await getSession()
    const id = `${userId}-${org}`;
   
    // 👇 get existing chat history (fully type-safe)
    const history = await redis.get<UIMessage[]>(`chat:history:${id}`);
   
    const messages = [...(history ?? []), message];
   
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
    });
   
    return result.toUIMessageStreamResponse({
        originalMessages: messages,
        // generate consistent server-side IDs for persistence:
        generateMessageId: createIdGenerator({
          prefix: "msg",
          size: 16,
        }),
        onFinish: async ({ messages }) => {
          // 👇 save chat history to redis
          await redis.set(`chat:history:${id}`, messages);
        },
      });


}