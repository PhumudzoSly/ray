"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isError?: boolean;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isError,
}: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-3">
        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 py-3", isUser && "flex-row-reverse")}>
      <div className="shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex-1 space-y-1 min-w-0",
          isUser && "flex flex-col items-end"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            isUser && "flex-row-reverse"
          )}
        >
          <span className="font-medium text-foreground">
            {isUser ? "You" : "Ray"}
          </span>
          <span className="text-muted-foreground">
            {format(timestamp, "HH:mm")}
          </span>
        </div>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm max-w-[85%] break-words",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted/50",
            isError &&
              "bg-destructive text-destructive-foreground border border-destructive/20"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 last:mb-0 list-disc list-inside space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 last:mb-0 list-decimal list-inside space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-background/50 text-foreground px-1.5 py-0.5 rounded text-xs font-mono border">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-background/50 border p-3 rounded-lg text-xs overflow-x-auto font-mono my-2">
                      {children}
                    </pre>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold mb-2 mt-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-muted-foreground/20 pl-3 italic my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
