// Export all agent tools for easy importing
export * as searchTools from "./searchTools";
export * as conversationTools from "./conversationTools";
export * as databaseTools from "./databaseTools";
export * as aiTools from "./aiTools";

// Re-export commonly used functions for convenience
export {
  searchProjects,
  searchIdeas,
  searchIssues,
  searchFeatures,
  getDataCounts,
} from "./searchTools";

export {
  getConversations,
  getMessages,
  getConversation,
  createConversation,
  addMessage,
  updateConversationTitle,
  deleteConversation,
} from "./conversationTools";

export { searchDatabase } from "./databaseTools";
export { generateResponse } from "./aiTools";
