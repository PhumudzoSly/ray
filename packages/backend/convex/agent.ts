// Import all tools from the organized agent-tools folder
import {
  searchTools,
  conversationTools,
  databaseTools,
  aiTools,
  // Re-export individual functions for backwards compatibility
  searchProjects,
  searchIdeas,
  searchIssues,
  searchFeatures,
  getDataCounts,
  getConversations,
  getMessages,
  getConversation,
  createConversation,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  searchDatabase,
  generateResponse,
} from "./agentTools";

// Re-export all functions for backwards compatibility
export {
  // Search tools
  searchProjects,
  searchIdeas,
  searchIssues,
  searchFeatures,
  getDataCounts,
  // Conversation tools
  getConversations,
  getMessages,
  getConversation,
  createConversation,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  // Database tools
  searchDatabase,
  // AI tools
  generateResponse,
  // Tool groups
  searchTools,
  conversationTools,
  databaseTools,
  aiTools,
};
