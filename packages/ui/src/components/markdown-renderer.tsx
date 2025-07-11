import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@workspace/ui/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: "default" | "compact" | "prose";
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  variant = "default",
}) => {
  const processContent = (text: string) => {
    if (!text) return "";
    let processed = text.replace(/\n/g, "\n\n");
    processed = processed.replace(/^(\d+)\.\s+/gm, "$1\\. ");
    processed = processed.replace(/(\d+\))\s+/gm, "$1 ");
    processed = processed.replace(/(\d+\))\s+/gm, "\n   - ");
    return processed;
  };

  const getVariantClass = () => {
    switch (variant) {
      case "compact":
        return "text-sm";
      case "prose":
        return "prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-ol:pl-5 prose-ul:pl-5 prose-li:my-2";
      default:
        return "text-base";
    }
  };

  return (
    <div
      className={cn(
        "w-full text-left whitespace-pre-wrap break-words",
        getVariantClass(),
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize, rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mt-6 mb-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold mt-5 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-md font-bold mt-4 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="mb-1 pl-1 marker:text-foreground/80" {...props}>
              {children}
            </li>
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/20 pl-4 italic my-2"
              {...props}
            />
          ),
          code: ({
            inline,
            ...props
          }: { inline?: boolean } & React.HTMLProps<HTMLElement>) =>
            inline ? (
              <code
                className="bg-muted px-1 py-0.5 rounded text-sm"
                {...props}
              />
            ) : (
              <code {...props} />
            ),
          pre: ({ node, ...props }) => (
            <pre
              className="bg-muted p-4 rounded-md overflow-x-auto my-4"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-muted-foreground/20 my-3" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-muted-foreground/20"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => <thead {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => (
            <tr className="border-b border-muted-foreground/10" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="py-3 px-4 text-left font-medium" {...props} />
          ),
          td: ({ node, ...props }) => <td className="py-2 px-4" {...props} />,
        }}
      >
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
};
