"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentActions from "@/actions/agent";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { ConversationSidebar } from "@/components/agent/conversation-sidebar";
import { ChatInterface } from "@/components/agent/chat-interface";
import { useSession } from "@/context/session-context";
import { Bot } from "lucide-react";
import Header from "@/components/shared/header";

export default function AgentPage() {
  const session = useSession();
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["agentConversations", session?.userId],
    queryFn: async () => {
      if (!session) return [];
      return await agentActions.getConversations({ userId: session.userId });
    },
    enabled: !!session,
  });

  // Mutations
  const createConversationMutation = useMutation({
    mutationFn: async (data: any) => agentActions.createConversation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agentConversations", session?.userId] }),
  });
  const deleteConversationMutation = useMutation({
    mutationFn: async (data: any) => agentActions.deleteConversation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agentConversations", session?.userId] }),
  });
  const updateConversationTitleMutation = useMutation({
    mutationFn: async (data: any) => agentActions.updateConversationTitle(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agentConversations", session?.userId] }),
  });

  const handleCreateConversation = async () => {
    if (!session?.org) return;
    try {
      const conversation = await createConversationMutation.mutateAsync({
        title: "New Conversation",
        userId: session.userId,
        organizationId: session.org,
        model: "gemini-2.0-flash",
      });
      setActiveConversationId(conversation.id || conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversationMutation.mutateAsync({ conversationId });
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleUpdateTitle = async (conversationId: string, title: string) => {
    try {
      await updateConversationTitleMutation.mutateAsync({ conversationId, title });
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleConversationCreated = (conversationId: string) => {
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
      isLoading={isLoading}
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
