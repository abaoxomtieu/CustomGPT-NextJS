import React from "react";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import RecommendationContainer, {
//   travelGuideRecommendations,
// } from "./RecommendationContainer";
import ChatMessageAgent from "./chat-message-box";
import ThinkingMessage from "./thinking-message";
import ToolMessage from "./tool-message";
import { useTranslations } from "next-intl";

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
  thinkingMessage: string;
  toolsMessage?: string;
  toolsMetadata?: any;
  selectedDocuments: any[];
  loadingChatbot: boolean;
  chatbotDetails: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRecommendationClick: (recommendation: string) => void;
  renderChatbotDetails: boolean;
  loading?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  thinkingMessage,
  toolsMessage,
  toolsMetadata,
  selectedDocuments,
  loadingChatbot,
  chatbotDetails,
  messagesEndRef,
  onRecommendationClick,
  renderChatbotDetails,
  loading,
}) => {
  const [isDocumentsOpen, setIsDocumentsOpen] = React.useState(false);
  const t = useTranslations("chatMessages");

  return (
    <div className="flex-1 overflow-y-auto py-2 md:py-4 px-2 md:px-4 chat-messages-container">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <AnimatePresence>
          {messages.length === 0 && renderChatbotDetails ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-6 md:py-10"
            >
              <div className="bg-card rounded-xl p-4 md:p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                {loadingChatbot ? (
                  <div className="space-y-2 md:space-y-3">
                    <Skeleton className="h-8 md:h-12 w-8 md:w-12 rounded-full mx-auto bg-muted/50" />
                    <Skeleton className="h-3 md:h-4 w-[150px] md:w-[200px] mx-auto bg-muted/50" />
                    <Skeleton className="h-3 md:h-4 w-[200px] md:w-[300px] mx-auto bg-muted/50" />
                    <Skeleton className="h-3 md:h-4 w-[180px] md:w-[250px] mx-auto bg-muted/50" />
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Bot className="text-3xl md:text-4xl text-blue-primary mb-3 md:mb-4 mx-auto" />
                    </motion.div>
                    <h3 className="text-base md:text-lg font-medium text-card-foreground mb-2">
                      {chatbotDetails?.name || t("emptyState.title")}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                      {chatbotDetails === null
                        ? t("emptyState.description")
                        : chatbotDetails?.prompt?.substring(0, 150) + "..."}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            messages.map((msg: StructuredMessage, index: number) => {
              const displayMessage = {
                role: msg.role,
                content:
                  typeof msg.content === "string" ? msg.content : msg.content,
              };
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-message-index={index}
                >
                  <ChatMessageAgent message={displayMessage} />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Loading Skeleton - Show when loading but no streaming message yet */}
        {loading &&
          !streamingMessage &&
          (!thinkingMessage || thinkingMessage.trim().length === 0) &&
          (!toolsMessage || toolsMessage.trim().length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start py-2"
            >
              <div className="flex items-start w-full max-w-2xl mx-auto">
                <Avatar className="bg-blue-primary/10 ring-2 ring-blue-primary/20">
                  <AvatarFallback className="text-blue-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base text-foreground"></span>
                    <span className="bg-foreground/10 text-foreground text-xs px-2 py-0.5 rounded-full">
                      AI
                    </span>
                  </div>
                  <div className="rounded-2xl px-5 py-4 shadow-md bg-background space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <Skeleton className="h-4 w-2/3 bg-muted" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        {/* Streaming Message */}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            data-message-index={messages.length}
          >
            <ChatMessageAgent
              message={{ role: "assistant", content: streamingMessage }}
            />
          </motion.div>
        )}

        {/* Tool Message */}
        {toolsMessage && !streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ToolMessage content={toolsMessage} metadata={toolsMetadata} />
          </motion.div>
        )}

        {/* Thinking Message */}
        {thinkingMessage && !streamingMessage && !toolsMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-message-index={messages.length}
          >
            <ThinkingMessage thinking={thinkingMessage} />
          </motion.div>
        )}

        {/* Source Documents */}
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Collapsible
              open={isDocumentsOpen}
              onOpenChange={setIsDocumentsOpen}
            >
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <CollapsibleTrigger className="w-full bg-secondary hover:bg-secondary/80 transition-colors duration-200">
                  <div className="flex items-center justify-between p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-primary rounded-full"></div>
                      <span className="text-sm md:text-base font-medium text-card-foreground">
                        {t("sourceDocuments.title", {
                          count: selectedDocuments.length,
                        })}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isDocumentsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
                    <div className="space-y-2 md:space-y-3">
                      {selectedDocuments.map((doc, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-border pb-2 md:pb-3 last:border-b-0 hover:bg-muted/30 transition-colors rounded-lg p-2"
                        >
                          <div className="w-full">
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="flex-1">
                                <div className="text-xs md:text-sm text-muted-foreground mb-1 leading-relaxed">
                                  {doc.metadata?.content || doc.page_content}
                                </div>
                                {doc.metadata?.source && (
                                  <div className="text-[10px] md:text-xs text-muted-foreground/70">
                                    {t("sourceDocuments.source", {
                                      source: doc.metadata.source,
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
