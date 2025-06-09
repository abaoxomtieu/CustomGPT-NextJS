import React from "react";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
// import RecommendationContainer, {
//   travelGuideRecommendations,
// } from "./RecommendationContainer";
import ChatMessageAgent from "./chat-message-box";

interface StructuredMessage {
  role: string;
  content:
    | string
    | Array<{
        type: string;
        text?: string;
        source_type?: string;
        url?: string;
      }>;
  type?: string;
  displayContent?: string;
}

interface ChatMessagesProps {
  messages: StructuredMessage[];
  streamingMessage: string;
  thinkingText: string;
  selectedDocuments: any[];
  loadingChatbot: boolean;
  chatbotDetails: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRecommendationClick: (recommendation: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  thinkingText,
  selectedDocuments,
  loadingChatbot,
  chatbotDetails,
  messagesEndRef,
  onRecommendationClick,
}) => {
  const [isDocumentsOpen, setIsDocumentsOpen] = React.useState(false);

  return (
    <div className="flex-1 overflow-y-auto py-4 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              {loadingChatbot ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-[200px] mx-auto" />
                  <Skeleton className="h-4 w-[300px] mx-auto" />
                  <Skeleton className="h-4 w-[250px] mx-auto" />
                </div>
              ) : (
                <>
                  <Bot className="text-4xl text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {chatbotDetails?.name || "AI Assistant"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {chatbotDetails?.prompt?.substring(0, 150) + "..." ||
                      "Ask me anything about travel destinations, plan your trips, or inquire about images of places."}
                  </p>
                </>
              )}
              {/* <RecommendationContainer
                title="Example Questions"
                recommendations={travelGuideRecommendations}
                onRecommendationClick={onRecommendationClick}
              /> */}
            </div>
          </div>
        ) : (
          messages.map((msg: StructuredMessage, index: number) => {
            const displayMessage = {
              role: msg.role,
              content:
                typeof msg.content === "string" ? msg.content : msg.content,
            };
            return <ChatMessageAgent key={index} message={displayMessage} />;
          })
        )}

        {/* Thinking Text */}
        {thinkingText && (
          <ChatMessageAgent
            message={{ role: "assistant", content: thinkingText }}
          />
        )}

        {/* Streaming Message */}
        {streamingMessage && (
          <ChatMessageAgent
            message={{ role: "assistant", content: streamingMessage }}
          />
        )}

        {/* Source Documents */}
        {selectedDocuments.length > 0 && (
          <div className="mt-4">
            <Collapsible open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
              <div className="bg-white/80 border border-gray-100 rounded-xl overflow-hidden">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700 font-medium">
                    Source Documents ({selectedDocuments.length})
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDocumentsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      {selectedDocuments.map((doc, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="w-full">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="text-sm text-gray-600 mb-1">
                                  {doc.metadata?.content || doc.page_content}
                                </div>
                                {doc.metadata?.source && (
                                  <div className="text-xs text-gray-400">
                                    Source: {doc.metadata.source}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
