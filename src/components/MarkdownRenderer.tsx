"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <div className="relative">
              {match && (
                <div className="absolute top-0 right-0 px-2 py-0.5 text-[0.55rem] text-text-dim bg-bg-elevated border-b border-l border-[#1a2030] rounded-bl">
                  {match[1]}
                </div>
              )}
              <code className={className} {...props}>
                {children}
              </code>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
