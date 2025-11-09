import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  isUser = false,
}) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Links - distinguish between internal and external
          a: ({ node, href, children, ...props }) => {
            const isInternal = href?.startsWith("/") || href?.startsWith("#");
            const isRelative = href && !href.startsWith("http");

            if (isInternal || isRelative) {
              // Internal link - use React Router Link
              return (
                <Link
                  to={href || "#"}
                  className={`${
                    isUser ? "text-white underline" : "text-primary underline"
                  } hover:opacity-80 font-medium`}
                  {...props}
                >
                  {children}
                </Link>
              );
            }

            // External link
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isUser ? "text-white underline" : "text-primary underline"
                } hover:opacity-80 font-medium`}
                {...props}
              >
                {children}
              </a>
            );
          },

          // Paragraphs
          p: ({ node, children, ...props }) => (
            <p className="mb-2 last:mb-0" {...props}>
              {children}
            </p>
          ),

          // Headings
          h1: ({ node, children, ...props }) => (
            <h1 className="text-xl font-bold mb-2 mt-3 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-base font-bold mb-2 mt-2 first:mt-0" {...props}>
              {children}
            </h3>
          ),

          // Lists
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="ml-2" {...props}>
              {children}
            </li>
          ),

          // Code blocks
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const inline = !className;

            if (inline) {
              // Inline code
              return (
                <code
                  className={`${
                    isUser
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-800"
                  } px-1.5 py-0.5 rounded text-sm font-mono`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code block
            return (
              <div className="my-2">
                {language && (
                  <div
                    className={`${
                      isUser ? "bg-white/20" : "bg-gray-200"
                    } px-3 py-1 text-xs font-semibold rounded-t`}
                  >
                    {language}
                  </div>
                )}
                <pre
                  className={`${
                    isUser
                      ? "bg-white/10 text-white"
                      : "bg-gray-100 text-gray-800"
                  } p-3 rounded ${language ? "rounded-t-none" : ""} overflow-x-auto`}
                >
                  <code className="text-sm font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          // Blockquotes
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className={`${
                isUser
                  ? "border-l-4 border-white/50 bg-white/10"
                  : "border-l-4 border-primary/50 bg-gray-50"
              } pl-4 py-2 my-2 italic`}
              {...props}
            >
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr
              className={`my-3 ${
                isUser ? "border-white/30" : "border-gray-300"
              }`}
              {...props}
            />
          ),

          // Tables
          table: ({ node, children, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table
                className={`min-w-full border ${
                  isUser ? "border-white/30" : "border-gray-300"
                }`}
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ node, children, ...props }) => (
            <thead
              className={isUser ? "bg-white/10" : "bg-gray-100"}
              {...props}
            >
              {children}
            </thead>
          ),
          tbody: ({ node, children, ...props }) => (
            <tbody {...props}>{children}</tbody>
          ),
          tr: ({ node, children, ...props }) => (
            <tr
              className={`border-b ${
                isUser ? "border-white/20" : "border-gray-200"
              }`}
              {...props}
            >
              {children}
            </tr>
          ),
          th: ({ node, children, ...props }) => (
            <th className="px-3 py-2 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td className="px-3 py-2" {...props}>
              {children}
            </td>
          ),

          // Strong (bold)
          strong: ({ node, children, ...props }) => (
            <strong className="font-bold" {...props}>
              {children}
            </strong>
          ),

          // Emphasis (italic)
          em: ({ node, children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
