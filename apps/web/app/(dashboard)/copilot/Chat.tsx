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
import { IdeaSelector } from "@/components/ui/selectors/idea-selector";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";
import { ProjectSelector } from "@/components/ui/selectors";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

const Chat = ({
  initialMessages,
  org,
  userId,
}: {
  initialMessages: UIMessage[];
  org: string;
  userId: string;
}) => {
  const [input, setInput] = useState("");
  const [idea, setIdea] = useState("");
  const [project, setProject] = useState("");
  const [issue, setIssue] = useState("");

  const handleClearChat = async () => {
    // Clear local messages
    setMessages([]);

    // Clear server-side chat history
    try {
      await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "self" }),
      });
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const { messages, sendMessage, status, regenerate, setMessages } = useChat({
    id: `user:${userId}:org:${org}`,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            messages,
            id,
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
            idea,
            project,
            issue,
          },
        }
      );
      setInput("");
    }
  };

  return (
    <ExpandedLayoutContainer
      sidebar={
        <div>
          <div className="p-4">
            <h1 className="font-bold text-lg">CoPilot Toolbox</h1>
            <p className="text-xs text-muted-foreground">
              Configure tools and services that Co-Pilot must have access to and
              focus on.
            </p>
          </div>
          <Separator />
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Internal</h2>
            <div className="grid grid-cols-[120px_1fr] gap-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Ideas
              </h3>
              <IdeaSelector
                idea={idea || undefined}
                onChange={(e) => {
                  console.log("Idea selected:", e);
                  setIdea(e || "");
                }}
              />

              <h3 className="text-sm font-medium text-muted-foreground">
                Project
              </h3>
              <ProjectSelector
                currentProject={project || undefined}
                onChange={(projectId: string | null) => {
                  console.log("Project selected:", projectId);
                  setProject(projectId || "");
                  setIssue("");
                }}
              />
              {project && (
                <h3 className="text-sm font-medium text-muted-foreground">
                  Issue
                </h3>
              )}
              {project && (
                <IssueSelector
                  projectId={project}
                  value={issue}
                  onChange={(issueId: string | null) => {
                    console.log("Issue selected:", issueId);
                    setIssue(issueId || "");
                  }}
                  onValueChange={(issueId: string | null) => {
                    console.log("Issue value changed:", issueId);
                    setIssue(issueId || "");
                  }}
                />
              )}
            </div>

            <h2 className="text-lg font-bold my-4">External</h2>
            <div className="bg-muted p-4">
              <h1 className="font-medium">⭐ Coming soon</h1>
              <p className="text-sm text-muted-foreground mt-1">
                We are currently setting up external tools such as Stripe,
                Polar, Resend, Vercel and more.
              </p>
            </div>
          </div>
        </div>
      }
    >
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
                                          navigator.clipboard.writeText(
                                            part.text
                                          )
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
            <PromptInput onSubmit={handleSubmit} className="mt-4">
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask and collaborate with Ray..."
                value={input}
              />
              <PromptInputToolbar>
                <div>
                  <Button size="xs" onClick={handleClearChat} variant="outline">
                    Clear Chat
                  </Button>
                </div>
                <PromptInputSubmit disabled={!input} status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>
    </ExpandedLayoutContainer>
  );
};

export default Chat;
