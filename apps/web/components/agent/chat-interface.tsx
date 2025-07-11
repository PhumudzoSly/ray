"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Bot, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { useSession } from "@/context/session-context";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  conversationId: Id<"agentConversations"> | null;
  onConversationCreated?: (conversationId: Id<"agentConversations">) => void;
}

export function ChatInterface({
  conversationId,
  onConversationCreated,
}: ChatInterfaceProps) {
  const session = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const messages = useQuery(
    api.agent.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const conversation = useQuery(
    api.agent.getConversation,
    conversationId ? { conversationId } : "skip"
  );

  // Mutations
  const createConversation = useMutation(api.agent.createConversation);
  const generateResponse = useAction(api.agent.generateResponse);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!session?.org) return;

    try {
      setIsGenerating(true);

      let currentConversationId = conversationId;

      // Create conversation if it doesn't exist
      if (!currentConversationId) {
        const title =
          message.length > 50 ? message.substring(0, 50) + "..." : message;
        currentConversationId = await createConversation({
          title,
          userId: session.userId,
          organizationId: session.org as Id<"organization">,
          model: "gemini-2.0-flash",
        });

        onConversationCreated?.(currentConversationId);
      }

      // Generate AI response
      await generateResponse({
        conversationId: currentConversationId,
        userMessage: message,
        userId: session.userId,
        organizationId: session.org as Id<"organization">,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const EmptyState = ({ showAuth = false }: { showAuth?: boolean }) => (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {showAuth ? "Welcome to AI Assistant" : "AI Assistant"}
        </h2>

        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {showAuth
            ? "Please sign in to start a conversation with your AI assistant."
            : "I can help you search through your projects, analyze ideas, and find insights from your data."}
        </p>

        {!showAuth && (
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 justify-center">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>Ask questions about your projects</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Get insights from your data</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading conversation...</span>
      </div>
    </div>
  );

  const TypingIndicator = () => (
    <div className="flex gap-3 px-6 py-4">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            AI Assistant
          </span>
        </div>
        <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
            </div>
            <span>Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Auth check
  if (!conversationId && !session) {
    return (
      <div className="h-full grid grid-rows-[1fr_auto]">
        <div className="overflow-hidden">
          <EmptyState showAuth />
        </div>
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isGenerating}
            placeholder="Start a conversation..."
          />
        </div>
      </div>
    );
  }

  // No conversation selected
  if (!conversationId) {
    return (
      <div className="h-[calc(100vh-50px)] flex flex-col ">
        <div className="overflow-hidden h-full grow">
          <EmptyState />
        </div>
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isGenerating}
            placeholder="Start a conversation..."
          />
        </div>
      </div>
    );
  }

  // Loading messages
  if (!messages) {
    return (
      <div className="h-[calc(100vh-50px)] flex flex-col">
        <div className="overflow-hidden grow h-full">
          <LoadingState />
        </div>
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isGenerating}
            placeholder="Type your message..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      {/* Messages Area - Takes all available space */}
      <div className="overflow-hidden grow h-full">
        <ScrollArea className="h-full">
          <div className="min-h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">
                    {conversation?.title || "New Conversation"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send a message to start the conversation
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 px-6 py-4 space-y-1">
                {messages.map((message) => (
                  <ChatMessage
                    key={message._id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.createdAt}
                    isError={message.isError}
                  />
                ))}
              </div>
            )}

            {isGenerating && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom using CSS Grid */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isGenerating}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}
