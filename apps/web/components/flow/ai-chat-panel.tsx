"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { Project } from "@/lib/types";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { useChat } from "ai/react";
import { MarkdownRenderer } from "@workspace/ui/components/markdown-renderer";
import { useSession } from "@/context/session-context";

interface AIChatPanelProps {
  project: Project;
}

export function AIChatPanel({ project }: AIChatPanelProps) {
  const { token } = useSession();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats for the project
  const chats = useQuery(api.chats.list, {
    projectId: project._id as Id<"projects">,
    token,
  });
  const messages = useQuery(
    api.chats.getMessages,
    selectedChatId
      ? {
          chatId: selectedChatId as Id<"chats">,
          token,
        }
      : "skip"
  );

  const createChat = useMutation(api.chats.create);
  const addMessage = useMutation(api.chats.addMessage);

  // Use Vercel AI SDK for streaming chat
  const {
    messages: streamMessages,
    input,
    handleInputChange,
    handleSubmit: handleStreamSubmit,
    isLoading: isStreamLoading,
    setMessages: setStreamMessages,
  } = useChat({
    api: "/api/chat",
    onFinish: async (message) => {
      if (selectedChatId) {
        // Save AI response to database
        await addMessage({
          chatId: selectedChatId,
          content: message.content,
          role: "assistant",
          token,
        });
      }
    },
  });

  // On mount or when chats load, ensure a chat exists and is selected
  useEffect(() => {
    if (chats && chats.length > 0) {
      setSelectedChatId(chats[0]._id);
    } else if (chats && chats.length === 0 && project._id) {
      // No chat exists, create one
      (async () => {
        try {
          const chatId = await createChat({
            projectId: project._id as Id<"projects">,
            title: "General Chat",
            type: "general",
            token,
          });
          setSelectedChatId(chatId);
          setStreamMessages([]);
        } catch (error) {
          toast.error("Failed to create chat");
        }
      })();
    }
  }, [chats, project._id, createChat, setStreamMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamMessages]);

  // Load messages from database when chat is selected
  useEffect(() => {
    if (messages && selectedChatId) {
      const formattedMessages = messages.map((msg) => ({
        id: msg._id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setStreamMessages(formattedMessages);
    }
  }, [messages, selectedChatId, setStreamMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatId || isStreamLoading) return;
    try {
      // Save user message to database
      await addMessage({
        chatId: selectedChatId,
        content: input,
        role: "user",
        token,
      });
      // Handle streaming response
      handleStreamSubmit(e);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Talk to Ray
          </h2>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedChatId ? (
          <>
            {/* Scrollable Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              <div className="space-y-4">
                {streamMessages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </span>
                      </div>
                      {/* Render message content as markdown */}
                      <MarkdownRenderer
                        content={message.content}
                        variant="prose"
                      />
                    </div>
                  </div>
                ))}
                {isStreamLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {/* Fixed Message Input */}
            <div className="border-t p-4 bg-background sticky bottom-0 z-10">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Ask about your project flows..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isStreamLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isStreamLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading Chat...</h3>
              <p className="text-muted-foreground mb-4">
                Please wait while we set up your chat.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
