"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { ConversationSidebar } from "@/components/agent/conversation-sidebar";
import { ChatInterface } from "@/components/agent/chat-interface";
import { useSession } from "@/context/session-context";
import { Bot } from "lucide-react";
import Header from "@/components/shared/header";

export default function AgentPage() {
  const session = useSession();
  const [activeConversationId, setActiveConversationId] =
    useState<Id<"agentConversations"> | null>(null);

  // Queries
  const conversations = useQuery(
    api.agent.getConversations,
    session ? { userId: session.userId } : "skip"
  );

  // Mutations
  const createConversation = useMutation(api.agent.createConversation);
  const deleteConversation = useMutation(api.agent.deleteConversation);
  const updateConversationTitle = useMutation(
    api.agent.updateConversationTitle
  );

  const handleCreateConversation = async () => {
    if (!session?.org) return;

    try {
      const conversationId = await createConversation({
        title: "New Conversation",
        userId: session.userId,
        organizationId: session.org as Id<"organization">,
        model: "gemini-2.0-flash",
      });
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId as Id<"agentConversations">);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation({
        conversationId: conversationId as Id<"agentConversations">,
      });
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleUpdateTitle = async (conversationId: string, title: string) => {
    try {
      await updateConversationTitle({
        conversationId: conversationId as Id<"agentConversations">,
        title,
      });
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleConversationCreated = (
    conversationId: Id<"agentConversations">
  ) => {
    setActiveConversationId(conversationId);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
        <p className="text-muted-foreground">
          Please sign in to access the AI assistant.
        </p>
      </div>
    );
  }

  const sidebar = (
    <ConversationSidebar
      conversations={conversations || []}
      activeConversationId={activeConversationId || undefined}
      onSelectConversation={handleSelectConversation}
      onCreateConversation={handleCreateConversation}
      onDeleteConversation={handleDeleteConversation}
      onUpdateTitle={handleUpdateTitle}
      isLoading={!conversations}
    />
  );

  const mainContent = (
    <ChatInterface
      conversationId={activeConversationId}
      onConversationCreated={handleConversationCreated}
    />
  );

  return (
    <>
      <Header crumb={[{ title: "Agent", url: "/agent" }]}>{null}</Header>
      <ExpandedLayoutContainer sidebar={sidebar}>
        {mainContent}
      </ExpandedLayoutContainer>
    </>
  );
}
