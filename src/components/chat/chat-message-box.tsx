import React from "react";

import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

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
                <ReactMarkdown key={`text-${index}`}>
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
  const senderName = isAI ? "AI trả lời" : userInfo?.name;

  return (
    <div className="flex justify-start py-2">
      <div className="flex items-start w-full max-w-2xl mx-auto">
        <Avatar>
          <AvatarImage
            src={!isAI ? userInfo?.picture : undefined}
            alt="avatar"
          />
          <AvatarFallback>
            {isAI ? <Bot className="w-4 h-4" /> : userInfo?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-semibold text-base ${
                isAI ? "text-foreground" : "text-green-600"
              }`}
            >
              {senderName}
            </span>
            {isAI && (
              <span className="bg-foreground/10 text-foreground text-xs px-2 py-0.5 rounded-full ml-1">
                AI
              </span>
            )}
          </div>
          <div
            className={`rounded-2xl px-5 py-4 shadow-md transition-all duration-200 group
              ${
                isAI
                  ? "bg-background hover:bg-foreground/20"
                  : "bg-foreground/10 hover:foreground/20"
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
