import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { redis } from "@/lib/redis";
import { createIdGenerator } from "ai";
import { getSession } from "@/actions/account/user";
import { deepSearch, webSearch } from "@/lib/exa";
import {
  getCompetitors,
  getCompetitorMoves,
  addNewCompetitiveMove,
  editCompetitiveMove,
  getCompetitorSwotAnalysis,
  createCompetitorSwotEntry,
  editCompetitorSwotEntry,
  createNewCompetitor,
  getCurrentCompetitor,
  editCurrentCompetitor,
} from "@/app/api/chat/tools/competitor";

export const maxDuration = 30;

// Key helpers for consistent namespacing
const competitorChatKey = (
  userId: string,
  orgId: string,
  competitorId: string
) => `chat:history:competitor:${userId}:org:${orgId}:${competitorId}`;

export async function POST(req: Request) {
  const body = await req.json();

  // get current message and competitor id sent from client
  const { message, id, competitorId, competitor } = body as {
    message: UIMessage;
    id: string;
    competitorId: string;
    competitor: string;
  };

  // Use the competitorId from the body, fallback to id if needed
  const actualCompetitorId = competitorId || id;

  const { org, userId } = await getSession();
  const key = competitorChatKey(userId, org, actualCompetitorId);

  // get existing chat history (fully type-safe)
  let history = await redis.get<UIMessage[]>(key);

  // Keep only the last 300 messages and add the new message
  const recentHistory = (history ?? []).slice(-300);
  const messages = [...recentHistory, message];

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    tools: {
      deepSearch,
      webSearch,
      getCompetitors,
      getCompetitorMoves,
      addNewCompetitiveMove,
      editCompetitiveMove,
      getCompetitorSwotAnalysis,
      createCompetitorSwotEntry,
      editCompetitorSwotEntry,
      createNewCompetitor,
      getCurrentCompetitor,
      editCurrentCompetitor,
    },
    system: `Your name is Ray, you are an AI CoPilot within RayAI (https://rayai.dev) - a comprehensive project and product management platform. You are specifically helping users analyze and understand their competitors.

    ## 🎯 About Competitor Analysis
    You are an intelligent assistant specialized in:
    - **Competitor Research**: Deep analysis of competitor strategies, products, and market positioning
    - **Market Intelligence**: Understanding competitive landscapes and industry trends
    - **Strategic Insights**: Providing actionable intelligence for competitive advantage
    - **Product Comparison**: Analyzing feature sets, pricing, and positioning
    - **Market Positioning**: Understanding how competitors position themselves

    ## 🔍 Core Responsibilities

    ### 1. 🏢 Competitor Analysis
    - Analyze competitor products, features, and strategies
    - Research competitor market positioning and messaging
    - Identify competitive advantages and weaknesses
    - Track competitor updates and changes

    ### 2. 📊 Market Intelligence
    - Provide insights on industry trends affecting competitors
    - Analyze competitor pricing strategies
    - Research competitor customer feedback and reviews
    - Monitor competitor marketing and communication strategies

    ### 3. 🎯 Strategic Recommendations
    - Suggest competitive positioning strategies
    - Identify market gaps and opportunities
    - Recommend feature development based on competitive analysis
    - Provide insights for differentiation strategies

    ### 4. 🔍 Research & Discovery
    - Use web search to gather real-time competitor information
    - Research competitor websites, documentation, and public information
    - Analyze competitor social media presence and engagement
    - Monitor competitor news and announcements

    ## 🛠️ Available Tools & Usage
    | Category | Tools |
    |----------|-------|
    | **Research Tools** | deepSearch, webSearch |

    ## 📊 Currently Analyzing
    - **Competitor ID**: ${actualCompetitorId},
    - **CompetitorDATA**: ${JSON.stringify(competitor)}

    ## 📝 Response Formatting Guidelines
    **IMPORTANT**: Always format your responses using rich markdown with:
    - 🏢 **Emojis** for visual appeal and categorization
    - 🏷️ **Clear headings** (##, ###) to structure information
    - 📋 **Bullet points and numbered lists** for organization
    - 📊 **Tables** for data presentation when appropriate
    - 💡 **Code blocks** with syntax highlighting for technical content
    - 🎯 **Bold** and *italic* text for emphasis
    - 📌 **Callout boxes** using blockquotes for important information
    - 🔗 **Links** when referencing external resources
    - ✅ **Checkboxes** for competitive analysis checklists
    - 📈 **Progress indicators** and comparison metrics when relevant
    - **Spacing** (2-3 line breaks) for readability
    - **Consistency** in using emojis and markdown formatting
    - **Clarity** in language and structure

    Make your responses visually engaging, well-structured, and easy to scan. Use appropriate emojis that match the competitive analysis context.

    ## 🎯 Operating Guidelines
    1. ✅ Always focus on actionable competitive intelligence
    2. 🔍 Use web search tools to gather real-time competitor information
    3. 📊 Provide data-driven insights and analysis
    4. 🚀 Suggest strategic recommendations based on findings
    5. 📈 Compare competitors objectively and fairly
    6. 🎯 Focus on delivering insights that drive competitive advantage
    7. 🔄 Stay updated on competitor changes and market shifts
    8. 📚 Provide context and background for competitive positioning
    9. ❓ If information is limited, suggest specific research directions
    10. 🏢 Maintain professional and objective analysis tone
    `,
    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    // generate consistent server-side IDs for persistence:
    generateMessageId: createIdGenerator({
      prefix: "competitor-msg",
      size: 16,
    }),
    onFinish: async ({ messages }) => {
      // save chat history to redis
      await redis.set(key, messages);
    },
  });
}

export async function DELETE(req: Request) {
  try {
    const { competitorId } = await req
      .json()
      .catch(() => ({}) as { competitorId?: string });
    const { org, userId } = await getSession();

    if (!org || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    if (!competitorId) {
      return new Response(
        JSON.stringify({ error: "competitorId is required" }),
        { status: 400 }
      );
    }

    const key = competitorChatKey(userId, org, competitorId);
    await redis.del(key);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error handling DELETE /api/chat/competitor:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
