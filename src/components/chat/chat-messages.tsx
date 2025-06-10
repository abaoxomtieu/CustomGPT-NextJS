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
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
              {loadingChatbot ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto bg-muted/50" />
                  <Skeleton className="h-4 w-[200px] mx-auto bg-muted/50" />
                  <Skeleton className="h-4 w-[300px] mx-auto bg-muted/50" />
                  <Skeleton className="h-4 w-[250px] mx-auto bg-muted/50" />
                </div>
              ) : (
                <>
                  <Bot className="text-4xl text-primary mb-4" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    {chatbotDetails?.name || "AI Assistant"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
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
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex items-center space-x-2 text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="animate-fade-in-out">
                {thinkingText}
              </span>
            </div>
          </div>
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
              <div className="bg-card/80 border border-border rounded-xl overflow-hidden">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
                  <span className="text-card-foreground font-medium">
                    Source Documents ({selectedDocuments.length})
                  </span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform text-muted-foreground ${
                      isDocumentsOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      {selectedDocuments.map((doc, index) => (
                        <div 
                          key={index} 
                          className="border-b border-border pb-3 last:border-b-0"
                        >
                          <div className="w-full">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="text-sm text-muted-foreground mb-1">
                                  {doc.metadata?.content || doc.page_content}
                                </div>
                                {doc.metadata?.source && (
                                  <div className="text-xs text-muted-foreground/70">
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
