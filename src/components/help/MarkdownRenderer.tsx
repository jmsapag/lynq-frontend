import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Card, CardBody } from "@heroui/react";

interface MarkdownRendererProps {
  content: string;
  onInternalLinkClick?: (filename: string) => void;
}

/**
 * MarkdownRenderer component
 * Renders markdown content with proper styling following Hero UI design system
 */
export const MarkdownRenderer = ({
  content,
  onInternalLinkClick,
}: MarkdownRendererProps) => {
  return (
    <Card className="w-full">
      <CardBody className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-5">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700 ml-2">{children}</li>
            ),
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code
                  className="bg-gray-100 text-primary-600 px-2 py-1 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
                  {...props}
                >
                  {children}
                </code>
              ),
            pre: ({ children }) => (
              <pre className="mb-4 overflow-x-auto">{children}</pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-700 my-4 bg-gray-50 py-2">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => {
              // Check if it's an internal link to another manual page
              const isInternalManualLink =
                href?.startsWith("./") && href?.endsWith(".md");

              if (isInternalManualLink && onInternalLinkClick && href) {
                const filename = href.replace("./", "");
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onInternalLinkClick(filename);
                    }}
                    className="text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                  >
                    {children}
                  </button>
                );
              }

              // External links open in new tab
              return (
                <a
                  href={href}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {children}
              </td>
            ),
            hr: () => <hr className="my-8 border-gray-300" />,
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </CardBody>
    </Card>
  );
};
