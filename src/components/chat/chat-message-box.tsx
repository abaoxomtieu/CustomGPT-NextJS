import React, { useState } from "react";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Copy, Check } from "lucide-react";

interface MessageContent {
  type: string;
  text?: string;
  source_type?: string;
  url?: string;
}

interface AgentMessage {
  role: string;
  content: string | MessageContent[];
}

const ChatMessageAgent: React.FC<{ message: AgentMessage }> = ({ message }) => {
  const { userInfo } = useAuth();
  const isAI = message.role === "assistant";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Copy code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Code block component with copy button
  const CodeBlock = ({ language, children, ...props }: any) => {
    const codeString = String(children).replace(/\n$/, "");
    const isCopied = copiedCode === codeString;

    return (
      <div className="relative group">
        <button
          onClick={() => copyToClipboard(codeString)}
          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language}
          PreTag="div"
          className="rounded-lg"
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Convert newlines to <br/> for ReactMarkdown
  const formatContent = (content: string) => {
    return content.replace(/\n/g, "  \n");
  };

  // Process the message content based on its type
  const renderContent = () => {
    if (typeof message.content === "string") {
      // For user messages, don't use markdown
      if (!isAI) {
        return <div className="whitespace-pre-wrap">{message.content}</div>;
      }
      // For AI messages, use markdown
      return (
        <ReactMarkdown
          components={{
            img: ({ node, src, alt, ...props }) => (
              <img
                src={src}
                alt={alt || "Image"}
                className="my-2 max-w-full rounded-md"
                {...props}
              />
            ),
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const inline = (props as any).inline;
              
              return !inline && language ? (
                <CodeBlock language={language} {...props}>
                  {children}
                </CodeBlock>
              ) : (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {formatContent(message.content)}
        </ReactMarkdown>
      );
    } else {
      // Complex content with text and images
      return (
        <div>
          {message.content.map((item, index) => {
            if (item.type === "text" && item.text) {
              if (!isAI) {
                return (
                  <div key={`text-${index}`} className="whitespace-pre-wrap">
                    {item.text}
                  </div>
                );
              }
              return (
                <ReactMarkdown 
                  key={`text-${index}`}
                  components={{
                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const inline = (props as any).inline;
                      
                      return !inline && language ? (
                        <CodeBlock language={language} {...props}>
                          {children}
                        </CodeBlock>
                      ) : (
                        <code
                          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {formatContent(item.text)}
                </ReactMarkdown>
              );
            } else if (item.type === "image" && item.url) {
              return (
                <div key={`image-${index}`} className="my-2">
                  <img
                    src={item.url}
                    alt="Chat image"
                    className="max-w-full rounded-md"
                  />
                </div>
              );
            } else if (item.type === "file" && item.url) {
              // Handle file attachments
              const fileExtension = item.url.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                fileExtension || ""
              );

              if (isImage) {
                return (
                  <div key={`file-${index}`} className="my-2">
                    <img
                      src={item.url}
                      alt="Uploaded image"
                      className="max-w-full rounded-md"
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={`file-${index}`}
                    className="my-2 p-2 bg-gray-100 rounded-md"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {item.url.split("/").pop()}
                    </a>
                  </div>
                );
              }
            }
            return null;
          })}
        </div>
      );
    }
  };

  // Sender name
  const senderName = isAI ? "" : userInfo?.name;

  return (
    <div className={`flex py-2 ${!isAI ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start w-full max-w-2xl mx-auto ${!isAI ? 'flex-row-reverse' : ''}`}>
        <Avatar className={`ring-2 ${isAI ? 'bg-blue-primary/10 ring-blue-primary/20' : 'bg-blue-active/10 ring-blue-active/20'}`}>
          <AvatarImage
            src={!isAI ? userInfo?.picture : undefined}
            alt="avatar"
          />
          <AvatarFallback className={isAI ? 'text-blue-primary' : 'text-blue-active'}>
            {isAI ? <Bot className="w-4 h-4" /> : userInfo?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className={`flex-1 ${!isAI ? 'mr-4' : 'ml-4'}`}>
          <div className={`flex items-center gap-2 mb-1 ${!isAI ? 'justify-end' : ''}`}>
            <span
              className={`font-semibold text-base ${
                isAI ? "text-blue-primary" : "text-blue-active"
              }`}
            >
              {senderName}
            </span>
            {isAI && (
              <span className="bg-blue-primary/10 text-blue-primary text-xs px-2 py-0.5 rounded-full ml-1">
                AI
              </span>
            )}
          </div>
          <div
            className={`rounded-2xl px-5 py-4 shadow-md transition-all duration-200 group
              ${
                isAI
                  ? "bg-blue-primary/5 border border-blue-60/20 hover:bg-blue-primary/10 hover:border-blue-primary/30"
                  : "bg-blue-active/5 border border-blue-active/20 hover:bg-blue-active/10 hover:border-blue-active/30 ml-8"
              }
              text-foreground text-[15px] leading-relaxed
            `}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageAgent;
