"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
} from "@workspace/ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@workspace/ui/components/ai-elements/prompt-input";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@workspace/ui/components/ai-elements/response";
import { GlobeIcon } from "lucide-react";
import { DefaultChatTransport } from "ai";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@workspace/ui/components/ai-elements/source";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@workspace/ui/components/ai-elements/reasoning";
import { Loader } from "@workspace/ui/components/ai-elements/loader";
import { Actions, Action } from "@workspace/ui/components/ai-elements/actions";
import { RefreshCcwIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";
import { UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { getCompetitor } from "@/actions/idea/competitor";

const CompetitorSidebar = ({
  initialMessages,
  org,
  userId,
  competitorId,
}: {
  initialMessages: UIMessage[];
  org: string;
  competitorId: string;
  userId: string;
}) => {
  const [input, setInput] = useState("");

  const { data: competitor } = useQuery({
    queryKey: ["competitor", competitorId],
    queryFn: () => getCompetitor({ id: competitorId }),
  });

  const { messages, sendMessage, status, regenerate } = useChat({
    id: `chat:history:competitor:${userId}:org:${org}:${competitorId}`,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat/competitor",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            id,
            competitorId,
            competitor: JSON.stringify(competitor),
          },
        };
      },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            competitorId,
            competitor: JSON.stringify(competitor),
          },
        }
      );
      setInput("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-2 relative size-full h-[calc(100vh-54px)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" && (
                  <Sources>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "source-url":
                          return (
                            <>
                              <SourcesTrigger
                                count={
                                  message.parts.filter(
                                    (part) => part.type === "source-url"
                                  ).length
                                }
                              />
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            </>
                          );
                      }
                    })}
                  </Sources>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          const isLastMessage = i === messages.length - 1;
                          return (
                            <div key={`${message.id}-${i}`}>
                              <Response>{part.text}</Response>
                              {message.role === "assistant" &&
                                isLastMessage && (
                                  <Actions className="mt-2">
                                    <Action
                                      onClick={() => regenerate()}
                                      label="Retry"
                                    >
                                      <RefreshCcwIcon className="size-3" />
                                    </Action>
                                    <Action
                                      onClick={() =>
                                        navigator.clipboard.writeText(part.text)
                                      }
                                      label="Copy"
                                    >
                                      <CopyIcon className="size-3" />
                                    </Action>
                                  </Actions>
                                )}
                            </div>
                          );
                        case "reasoning":
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === "streaming"}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="px-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              placeholder="Dive deeper and analyze your competitor..."
              value={input}
            />
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default CompetitorSidebar;
