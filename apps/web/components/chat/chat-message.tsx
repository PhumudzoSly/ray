"use client";

import { Message, TextMessage } from "@inngest/agent-kit";
import { Avatar } from "@workspace/ui/components/avatar";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

export function ChatMessage({ message }: { message: Message }) {
  if (message.type !== "text") return null;
  const textMessage = message as TextMessage;
  const isUser = textMessage.role === "user";

  const components: Components = {
    // Headings
    h1: ({ children, ...props }) => (
      <h1
        {...props}
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2"
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        {...props}
        className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-5 mb-3"
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        {...props}
        className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-4 mb-2"
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        {...props}
        className="text-base font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2"
      >
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5
        {...props}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2"
      >
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6
        {...props}
        className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2"
      >
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children, ...props }) => (
      <p
        {...props}
        className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 last:mb-0"
      >
        {children}
      </p>
    ),

    // Code blocks
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;

      return isInline ? (
        <code
          {...props}
          className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded px-1.5 py-0.5 text-sm font-mono border border-zinc-200 dark:border-zinc-700"
        >
          {children}
        </code>
      ) : (
        <div className="my-4">
          <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-zinc-800">
            <code
              {...props}
              className={cn("text-sm font-mono text-zinc-100", className)}
            >
              {String(children).replace(/\n$/, "")}
            </code>
          </pre>
        </div>
      );
    },

    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote
        {...props}
        className="border-l-4 border-violet-500 pl-4 py-2 my-4 bg-violet-50 dark:bg-violet-950/20 rounded-r-lg"
      >
        <div className="text-zinc-700 dark:text-zinc-300 italic">
          {children}
        </div>
      </blockquote>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <ul
        {...props}
        className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-1"
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        {...props}
        className="list-decimal list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-1"
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li {...props} className="text-zinc-700 dark:text-zinc-300">
        {children}
      </li>
    ),

    // Links
    a: ({ href, children, ...props }) => (
      <a
        {...props}
        href={href}
        className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Strong/bold
    strong: ({ children, ...props }) => (
      <strong
        {...props}
        className="font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {children}
      </strong>
    ),

    // Emphasis/italic
    em: ({ children, ...props }) => (
      <em {...props} className="italic text-zinc-700 dark:text-zinc-300">
        {children}
      </em>
    ),

    // Strikethrough
    del: ({ children, ...props }) => (
      <del {...props} className="line-through text-zinc-500 dark:text-zinc-500">
        {children}
      </del>
    ),

    // Horizontal rule
    hr: ({ ...props }) => (
      <hr {...props} className="my-6 border-zinc-200 dark:border-zinc-700" />
    ),

    // Tables
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto">
        <table
          {...props}
          className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-700 rounded-lg"
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead {...props} className="bg-zinc-50 dark:bg-zinc-800">
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody
        {...props}
        className="divide-y divide-zinc-200 dark:divide-zinc-700"
      >
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr {...props} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th
        {...props}
        className="px-4 py-2 text-left font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700"
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td {...props} className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
        {children}
      </td>
    ),

    // Images
    img: ({ src, alt, ...props }) => (
      <img
        {...props}
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-zinc-200 dark:border-zinc-700 my-4"
      />
    ),
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 px-4",
        isUser && "flex-row-reverse"
      )}
    >
      <Avatar
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border",
          isUser
            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            : "bg-violet-500/10 border-violet-500/20"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        ) : (
          <Bot className="h-5 w-5 text-violet-500" />
        )}
      </Avatar>

      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-4 py-3 max-w-prose",
            isUser
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          )}
        >
          {typeof textMessage.content === "string" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {textMessage.content}
            </ReactMarkdown>
          ) : (
            <div>{JSON.stringify(textMessage.content)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
