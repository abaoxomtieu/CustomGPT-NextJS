import React from "react";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  selectedDocuments: any[];
  loadingChatbot: boolean;
  chatbotDetails: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRecommendationClick: (recommendation: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  selectedDocuments,
  loadingChatbot,
  chatbotDetails,
  messagesEndRef,
  onRecommendationClick,
}) => {
  const [isDocumentsOpen, setIsDocumentsOpen] = React.useState(false);

  return (
    <div className="flex-1 overflow-y-auto py-2 md:py-4 px-2 md:px-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-6 md:py-10">
            <div className="bg-card rounded-xl p-4 md:p-8 shadow-sm border border-border">
              {loadingChatbot ? (
                <div className="space-y-2 md:space-y-3">
                  <Skeleton className="h-8 md:h-12 w-8 md:w-12 rounded-full mx-auto bg-muted/50" />
                  <Skeleton className="h-3 md:h-4 w-[150px] md:w-[200px] mx-auto bg-muted/50" />
                  <Skeleton className="h-3 md:h-4 w-[200px] md:w-[300px] mx-auto bg-muted/50" />
                  <Skeleton className="h-3 md:h-4 w-[180px] md:w-[250px] mx-auto bg-muted/50" />
                </div>
              ) : (
                <>
                  <Bot className="text-3xl md:text-4xl text-primary mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-card-foreground mb-2">
                    {chatbotDetails?.name || "AI Assistant"}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
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

        {/* Streaming Message */}
        {streamingMessage && (
          <ChatMessageAgent
            message={{ role: "assistant", content: streamingMessage }}
          />
        )}

        {/* Source Documents */}
        {selectedDocuments.length > 0 && (
          <div className="mt-2 md:mt-4">
            <Collapsible
              open={isDocumentsOpen}
              onOpenChange={setIsDocumentsOpen}
            >
              <div className="bg-card/80 border border-border rounded-xl overflow-hidden">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-3 md:p-4 text-left hover:bg-muted/50 transition-colors">
                  <span className="text-sm md:text-base text-card-foreground font-medium">
                    Source Documents ({selectedDocuments.length})
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform text-muted-foreground ${
                      isDocumentsOpen ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
                    <div className="space-y-2 md:space-y-3">
                      {selectedDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="border-b border-border pb-2 md:pb-3 last:border-b-0"
                        >
                          <div className="w-full">
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="flex-1">
                                <div className="text-xs md:text-sm text-muted-foreground mb-1">
                                  {doc.metadata?.content || doc.page_content}
                                </div>
                                {doc.metadata?.source && (
                                  <div className="text-[10px] md:text-xs text-muted-foreground/70">
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
