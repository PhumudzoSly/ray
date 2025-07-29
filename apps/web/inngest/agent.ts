import { inngestClient } from "@/lib/inngest";
import {
  createNetwork,
  createAgent,
  gemini,
  createState,
  TextMessage,
  Message,
  AgentResult,
} from "@inngest/agent-kit";
import { getAllProjects } from "./tools/projects";

// Define the network state interface
interface NetworkState {
  query: string | undefined;
  networkComplete: boolean;
  response?: string;
  threadId?: string;
}

// Helper function to extract messages from AgentResult objects for conversation history
function extractMessagesFromAgentResults(agentResults: any[]): Message[] {
  const messages: Message[] = [];

  for (const result of agentResults) {
    if (result.output && Array.isArray(result.output)) {
      // Add all output messages from each result
      messages.push(...result.output);
    }
  }

  return messages;
}

// Create the Inngest function
export const simpleAgentFunction = inngestClient.createFunction(
  { id: "simple-agent-workflow" },
  { event: "simple-agent/run" },
  async ({ step, event, publish }) => {
    const { query, threadId, agentResults = [] } = event.data;

    // Extract conversation history as messages
    const conversationHistory = extractMessagesFromAgentResults(agentResults);

    // Create a simple agent that can respond to queries
    const simpleAgent = createAgent<NetworkState>({
      name: "simple_agent",
      description:
        "A specialized SaaS development assistant within the RayAI platform",
      system: `You are RayAI's SaaS Development Assistant - an expert guide for building and shipping SaaS products that users love and want.

## Your Core Mission
Help users navigate the complete SaaS development journey from idea validation to successful launch using RayAI's comprehensive platform.

## RayAI Platform Capabilities You Can Help With:

### 🚀 **Idea Validation & Market Research**
- AI-powered market analysis and validation scoring
- Competitive landscape analysis and intelligence
- Target audience identification and segmentation
- Market trend analysis and opportunity assessment
- Financial projections and funding planning

### 📋 **Project & Product Management**
- Project planning across multiple platforms (web, mobile, API, etc.)
- Feature prioritization and roadmap development
- Milestone tracking and dependency management
- Issue tracking and bug management
- Asset management and documentation

### 👥 **User Validation & Growth**
- Waitlist creation and management strategies
- Public roadmap development and feedback collection
- Feature request handling and prioritization
- User feedback analysis and sentiment tracking
- Referral program optimization

### 🎯 **Business Strategy**
- Pricing strategy and competitive positioning
- Go-to-market planning and execution
- Customer acquisition and retention strategies
- Unit economics and financial modeling
- Regulatory compliance and risk assessment

## How to Help Users:

### 1. **Strategic Guidance**
- Provide actionable advice based on SaaS best practices
- Help users make data-driven decisions about their product
- Suggest validation strategies and market research approaches
- Guide users through the platform's features effectively

### 2. **Platform Navigation**
- Explain how to use RayAI's tools for maximum impact
- Help users understand which features to use when
- Provide step-by-step guidance for complex workflows
- Suggest integrations and automation opportunities

### 3. **Problem Solving**
- Help troubleshoot common SaaS development challenges
- Provide solutions for user acquisition, retention, and growth
- Assist with technical and business strategy questions
- Offer frameworks for decision-making

### 4. **Best Practices**
- Share proven SaaS development methodologies
- Recommend industry best practices and trends
- Help users avoid common pitfalls
- Suggest optimization strategies

## Response Guidelines:
- Be specific and actionable in your advice
- Reference RayAI platform features when relevant
- Use markdown formatting for clarity
- Provide step-by-step instructions when helpful
- Ask clarifying questions to better understand user needs
- Share relevant examples and case studies
- Be encouraging while remaining realistic about challenges

## Remember:
You have access to the user's project data and can help them leverage RayAI's full capabilities. Always aim to help users build products that solve real problems and create genuine value for their customers.

You have access to the full conversation history. Use this context to provide relevant and contextual responses.`,
      model: gemini({
        model: "gemini-2.0-flash-lite",
      }),
      tools: [getAllProjects],
    });

    // Create properly typed state for this run using messages for conversation history
    const state = createState<NetworkState>(
      {
        query,
        networkComplete: false,
        threadId,
      },
      {
        messages: conversationHistory, // Use messages instead of results for conversation history
      }
    );

    // Track if we've published the response yet
    let hasPublishedResponse = false;

    // Create the network
    const simpleNetwork = createNetwork<NetworkState>({
      name: "simple_network",
      agents: [simpleAgent],
      defaultModel: gemini({
        model: "gemini-2.0-flash-lite",
      }),
      defaultState: state,
      router: async ({ network }) => {
        const state = network.state.data;

        // If network is complete, stop
        if (state.networkComplete) {
          return undefined;
        }

        // Check if we have a new result to publish
        if (network.state.results.length > 0 && !hasPublishedResponse) {
          const lastResult =
            network.state.results[network.state.results.length - 1];

          const lastMessage = lastResult?.output.find(
            (msg) => msg.type === "text"
          ) as TextMessage;

          if (lastMessage?.type === "text") {
            // Store the response in state
            state.response =
              typeof lastMessage.content === "string"
                ? lastMessage.content
                : lastMessage.content[0]?.text;
            state.networkComplete = true;
            hasPublishedResponse = true;

            // Publish the assistant message as a separate event for UI display
            await publish({
              channel: `chat.${state.threadId}`,
              topic: "messages",
              data: {
                message: lastMessage,
              },
            });
          }
        }

        // Default to the simple agent if we haven't completed yet
        return state.networkComplete ? undefined : simpleAgent;
      },
      maxIter: 2, // Reduce maxIter to prevent infinite loops
    });

    // Run the network with the query
    const response = await simpleNetwork.run(query, { state });

    // Get only the new results from this network run
    const newResults = response.state.results.map((result) => result.export());

    // Send completion event with only new agentResults
    await publish({
      channel: `chat.${threadId}`,
      topic: "messages",
      data: {
        status: "complete",
        agentResults: newResults, // Include only new results
      },
    });

    // Return only the new results
    return {
      response: response.state.data.response,
      agentResults: newResults, // Return only new results
    };
  }
);
