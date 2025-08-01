"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Trash2,
  Bot,
  ChevronLeft,
  KeyRound,
  LogIn,
  Brain,
  Code2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ChatInput from "@/components/chat/chat-input";
import ChatMessageAgent from "@/components/chat/chat-message-box";
import UpdateChatbotForm from "@/components/update-chatbot-form";
import ChatMessages from "@/components/chat/chat-messages";
import ToolMessage from "@/components/chat/tool-message";
import ApiDocs from "@/components/chat/api-docs";
import { useEditorChatbot } from "@/hooks/use-editor-chatbot";
import { useChatbotDetail } from "@/hooks/use-query-chatbots";
import { fetchChatbotDetail } from "@/services/chatbotService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

// Styles
const styles = {
  header:
    "flex-none bg-card/90 backdrop-blur-sm shadow-sm border-b border-border py-2 md:py-0",
  headerContainer:
    "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-3 md:px-4 gap-2 md:gap-0",
  headerLeft: "flex items-center gap-2 md:gap-3 flex-1 min-w-0",
  headerRight:
    "flex items-center gap-1 md:gap-2 flex-shrink-0 w-full md:w-auto justify-end",
  mainContent: "flex-1 flex flex-col md:flex-row overflow-hidden",
  leftSection:
    "w-full md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden",

  tabList: "w-2/3 flex justify-center",
  tabTrigger:
    "w-fit data-[state=active]:bg-blue-primary data-[state=active]:text-white data-[state=active]:shadow-sm",
  emptyState: "text-center py-6 md:py-10",
  emptyStateCard:
    "bg-card rounded-xl p-4 md:p-8 shadow-sm border border-blue-60/20",
  featureCard:
    "bg-secondary/50 p-4 md:p-6 rounded-xl border border-blue-60/20 hover:border-blue-primary/50 transform hover:scale-[1.02] transition-transform duration-200",
  featureIcon: "bg-blue-primary/10 p-2 rounded-lg mr-3",
  featureList:
    "text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3",
  featureItem: "flex items-center",
  featureDot: "w-2 h-2 bg-blue-primary rounded-full mr-2",
};

// Empty State Component
const EmptyState = ({ notFounded }: { notFounded: boolean }) => {
  const t = useTranslations("editorChatbot.emptyState");
  const mode = notFounded ? "create" : "update";

  // Get guide items
  const guideItems = [
    t(`${mode}.guide.item1`),
    t(`${mode}.guide.item2`),
    t(`${mode}.guide.item3`),
  ];

  // Get example items
  const exampleItems = [
    t(`${mode}.examples.item1`),
    t(`${mode}.examples.item2`),
    t(`${mode}.examples.item3`),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.emptyState}
    >
      <div className={styles.emptyStateCard}>
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-primary/10 p-3 md:p-4 rounded-full mb-3 md:mb-4"
          >
            <Bot className="text-3xl md:text-4xl text-primary" />
          </motion.div>
          <h3 className="text-xl md:text-2xl font-bold text-card-foreground mb-2 md:mb-3">
            {t(`${mode}.title`)}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {t(`${mode}.description`)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <FeatureCard
            icon="💡"
            title={t(`${mode}.guide.title`)}
            items={guideItems}
          />
          <FeatureCard
            icon="🎯"
            title={t(`${mode}.examples.title`)}
            items={exampleItems}
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-secondary/50 rounded-xl p-4 md:p-6 border border-border"
        >
          <div className="flex items-center">
            <div className={styles.featureIcon}>
              <span className="text-lg md:text-xl">💬</span>
            </div>
            <div>
              <p className="text-card-foreground font-medium text-base md:text-lg">
                {t(`${mode}.start.title`)}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {t(`${mode}.start.description`)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) => (
  <motion.div whileHover={{ scale: 1.02 }} className={styles.featureCard}>
    <div className="flex items-center mb-3 md:mb-4">
      <div className={styles.featureIcon}>
        <span className="text-lg md:text-xl">{icon}</span>
      </div>
      <h4 className="font-semibold text-card-foreground text-base md:text-lg">
        {title}
      </h4>
    </div>
    <ul className={styles.featureList}>
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={styles.featureItem}
        >
          <span className={styles.featureDot}></span>
          {item}
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

// Loading State Component
const LoadingState = () => {
  const t = useTranslations("editorChatbot.loading");
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"
        />
        <p className="text-muted-foreground">{t("checking")}</p>
      </motion.div>
    </div>
  );
};

// Unauthorized State Component
const UnauthorizedState = ({ notFounded }: { notFounded: boolean }) => {
  const router = useRouter();
  const t = useTranslations("editorChatbot.unauthorized");
  const action = notFounded ? "create" : "update";

  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-6"
      >
        <div className="bg-card rounded-xl p-6 shadow-sm border border-blue-60/20">
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-yellow-500/10 p-4 rounded-full mb-4"
            >
              <LogIn className="text-4xl text-yellow-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("description", { action })}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t("redirecting")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/")} className="w-full">
              <LogIn className="mr-2 w-4 h-4" />
              {t("buttons.home")}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/assistants")}
              className="w-full"
            >
              {t("buttons.back")}
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

interface UpdateChatbotClientProps {
  botId: string;
  notFounded: boolean;
}

const EditorChatbotClient: React.FC<UpdateChatbotClientProps> = ({
  botId,
  notFounded,
}) => {
  const router = useRouter();
  const t = useTranslations("editorChatbot");
  const [isApiDocsOpen, setIsApiDocsOpen] = React.useState(false);

  // Scroll detection states
  const [isAtBottomLeft, setIsAtBottomLeft] = React.useState(true);
  const [isAtBottomRight, setIsAtBottomRight] = React.useState(true);

  // Chat container refs
  const leftChatContainerRef = React.useRef<HTMLDivElement>(null);
  const rightChatContainerRef = React.useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    setInput,
    loading,
    streamingMessage,
    thinkingText,
    selectedFiles,
    setSelectedFiles,
    modelName,
    setModelName,
    clearModalVisible,
    setClearModalVisible,
    ragInput,
    setRagInput,
    ragLoading,
    ragStreamingMessage,
    ragMessages,
    ragSelectedDocuments,
    chatbotData,
    setChatbotData,
    toolsMessage,
    toolsMetadata,
    geminiApiKey,
    modelOptions,
    isLogin,
    isLoading,
    messagesEndRef,
    inputRef,
    ragMessagesEndRef,
    ragInputRef,
    handleSend,
    handleRagSend,
    handleKeyPress,
    handleClearConfirm,
    handleTabChange,
    ragReasoning,
    setRagReasoning,
  } = useEditorChatbot(botId, notFounded);

  // Check if user is at the bottom of the scroll container
  const checkIfAtBottomLeft = () => {
    const container = leftChatContainerRef.current;
    if (!container) return true;

    const threshold = 50; // 50px threshold for "near bottom"
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    setIsAtBottomLeft(isNearBottom);
    return isNearBottom;
  };

  const checkIfAtBottomRight = () => {
    const container = rightChatContainerRef.current;
    if (!container) return true;

    const threshold = 50; // 50px threshold for "near bottom"
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    setIsAtBottomRight(isNearBottom);
    return isNearBottom;
  };

  // Smooth scroll to bottom
  const scrollToBottomLeft = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottomLeft(true);
    }
  };

  const scrollToBottomRight = () => {
    if (ragMessagesEndRef.current) {
      ragMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottomRight(true);
    }
  };

  // Handle scroll events
  const handleScrollLeft = () => {
    checkIfAtBottomLeft();
  };

  const handleScrollRight = () => {
    checkIfAtBottomRight();
  };

  // Auto-scroll only when user is at bottom
  React.useEffect(() => {
    if (isAtBottomLeft) {
      setTimeout(() => {
        scrollToBottomLeft();
      }, 100);
    }
  }, [messages, streamingMessage]);

  React.useEffect(() => {
    if (isAtBottomRight) {
      setTimeout(() => {
        scrollToBottomRight();
      }, 100);
    }
  }, [ragMessages, ragStreamingMessage]);

  // Initial check on messages change
  React.useEffect(() => {
    setTimeout(() => {
      checkIfAtBottomLeft();
      checkIfAtBottomRight();
    }, 100);
  }, [messages.length, ragMessages.length]);

  // Sử dụng query hook để fetch chatbot details
  const { data: chatbotDetailsFromQuery, error: chatbotDetailsError } =
    useChatbotDetail(notFounded ? undefined : botId);

  useEffect(() => {
    if (chatbotDetailsFromQuery && !notFounded) {
      setChatbotData(chatbotDetailsFromQuery);
    }
    if (chatbotDetailsError) {
      console.error("Error fetching chatbot details:", chatbotDetailsError);
    }
  }, [
    chatbotDetailsFromQuery,
    chatbotDetailsError,
    notFounded,
    setChatbotData,
  ]);

  useEffect(() => {
    if (!isLoading && !isLogin) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLogin, router]);

  const handleInputChange = (value: string) => {
    if (!isLogin) {
      toast.warning(t("errors.loginRequired"), {
        action: {
          label: t("errors.login"),
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    setInput(value);
  };

  const handleRagInputChange = (value: string) => {
    if (!isLogin) {
      toast.warning(t("errors.loginRequired"), {
        action: {
          label: t("errors.login"),
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    setRagInput(value);
  };

  const handleSendWrapper = async (files: File[]) => {
    if (!isLogin) {
      toast.warning(t("errors.loginRequired"), {
        action: {
          label: t("errors.login"),
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    await handleSend(files);
  };

  const handleRagSendWrapper = async (files: File[]) => {
    if (!isLogin) {
      toast.warning(t("errors.loginRequired"), {
        action: {
          label: t("errors.login"),
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    await handleRagSend(files);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isLogin) {
    return <UnauthorizedState notFounded={notFounded} />;
  }

  return (
    <main className="flex flex-col h-[100dvh] bg-background">
      <h1 className="sr-only">
        {notFounded ? t("title.create") : t("title.update")} - AI FTES
      </h1>

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Button
              variant="ghost"
              onClick={() => router.push("/assistants")}
              className="text-muted-foreground hover:text-foreground p-1 md:p-2"
              aria-label={t("backToList")}
            >
              <ChevronLeft className="mr-1 w-4 h-4" />
              <span className="hidden md:inline">{t("back")}</span>
            </Button>
            <Bot
              className="w-4 h-4 md:w-6 md:h-6 text-primary flex-shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm md:text-xl font-semibold text-card-foreground truncate">
                {notFounded ? t("title.create") : t("title.update")}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                {notFounded ? t("subtitle.create") : t("subtitle.update")}
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  className={`hidden md:flex ml-2 text-xs md:text-sm mr-2 ${
                    geminiApiKey
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  } cursor-pointer`}
                  role="button"
                  aria-label={`${t("geminiKey.status")} ${
                    geminiApiKey ? t("geminiKey.set") : t("geminiKey.notSet")
                  }`}
                >
                  <KeyRound className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden md:inline">
                    {t("geminiKey.status")}
                  </span>{" "}
                  {geminiApiKey ? t("geminiKey.set") : t("geminiKey.notSet")}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="bg-card border-border">
                <p className="text-card-foreground text-sm">
                  {geminiApiKey ? (
                    t("geminiKey.tooltip.set")
                  ) : (
                    <span>
                      {t("geminiKey.tooltip.notSet")}
                      <br />
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => router.push("/profile")}
                        className="text-primary"
                      >
                        {t("geminiKey.tooltip.setupNow")}
                      </Button>
                    </span>
                  )}
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <div className={styles.headerRight}>
            <Select value={modelName} onValueChange={setModelName}>
              <SelectTrigger
                className="hidden md:flex w-full md:w-[180px] bg-background border-border text-sm"
                aria-label={t("model.select")}
              >
                <SelectValue placeholder={t("model.placeholder")} />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {modelOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-foreground text-sm"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("settings")}
                >
                  <Brain className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-card border-border w-64"
                align="end"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("model.select")}
                    </label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {modelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-secondary/50"
                    onClick={() => router.push("/profile")}
                  >
                    <KeyRound
                      className={`w-4 h-4 ${
                        geminiApiKey ? "text-green-600" : "text-yellow-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {t("geminiKey.status")}
                      </p>
                      <p
                        className={`text-xs ${
                          geminiApiKey ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {geminiApiKey
                          ? t("geminiKey.set")
                          : t("geminiKey.notSet")}
                      </p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="destructive"
              onClick={() => setClearModalVisible(true)}
              className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
              aria-label={t("clearChat")}
            >
              <Trash2 className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{t("clearChat")}</span>
              <span className="sm:hidden">{t("clear")}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <section className={styles.leftSection}>
          <Tabs
            defaultValue="chat"
            className="h-full"
            onValueChange={handleTabChange}
          >
            <div className="w-full flex justify-center">
              <TabsList className={styles.tabList} role="tablist">
                <TabsTrigger
                  value="chat"
                  className={styles.tabTrigger}
                  role="tab"
                >
                  {notFounded ? t("tabs.create") : t("tabs.update")}
                </TabsTrigger>
                {chatbotData && (
                  <TabsTrigger
                    value="form"
                    className={styles.tabTrigger}
                    role="tab"
                  >
                    {t("tabs.config")}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            <TabsContent
              value="chat"
              className="h-[calc(100%-40px)] flex flex-col overflow-hidden"
              role="tabpanel"
            >
              <div
                className="flex-1 overflow-y-auto"
                ref={leftChatContainerRef}
                onScroll={handleScrollLeft}
              >
                <div className="pb-6">
                  <AnimatePresence mode="wait">
                    {messages.length === 0 ? (
                      <EmptyState notFounded={notFounded} />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ChatMessages
                          messages={messages}
                          streamingMessage={streamingMessage}
                          selectedDocuments={[]}
                          loadingChatbot={false}
                          chatbotDetails={chatbotData}
                          messagesEndRef={
                            messagesEndRef as React.RefObject<HTMLDivElement>
                          }
                          onRecommendationClick={(recommendation: string) =>
                            setInput(recommendation)
                          }
                          thinkingMessage={thinkingText}
                          toolsMessage={toolsMessage}
                          toolsMetadata={toolsMetadata}
                          renderChatbotDetails={false}
                          loading={loading}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-none border-t border-border bg-background/80 backdrop-blur-sm p-0 md:p-4">
                <div className="w-full max-w-none px-3 md:px-0">
                  <ChatInput
                    input={input}
                    loading={loading}
                    botId={botId}
                    onInputChange={handleInputChange}
                    onSend={handleSendWrapper}
                    onKeyPress={handleKeyPress}
                    inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                    selectedFiles={selectedFiles}
                    onSelectedFilesChange={setSelectedFiles}
                    disabled={loading}
                    reasoning={false}
                    onReasoningChange={() => {}}
                  />
                </div>
              </div>
            </TabsContent>

            {chatbotData && (
              <TabsContent
                value="form"
                className="h-[calc(100%-40px)] overflow-y-auto"
                role="tabpanel"
              >
                <UpdateChatbotForm
                  botId={botId}
                  initialData={chatbotData}
                  onSuccess={() => {}}
                />
              </TabsContent>
            )}
          </Tabs>
        </section>

        <section className="flex-1 flex flex-col md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden bg-muted/50">
          <h3 className="sr-only">Chat với Chatbot</h3>
          {chatbotData && (
            <div className="flex-none flex items-center justify-between p-3 border-b border-border bg-background/50">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {chatbotData.name || "Chatbot"}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsApiDocsOpen(true)}
                      className="h-8 px-2 bg-blue-primary text-white"
                    >
                      <Code2 className="w-4 h-4" />
                      <span className="ml-1 hidden sm:inline">API</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem hướng dẫn tích hợp API</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <div
            className="flex-1 overflow-y-auto p-4"
            ref={rightChatContainerRef}
            onScroll={handleScrollRight}
          >
            <div className="pb-6">
              <ChatMessages
                messages={ragMessages}
                streamingMessage={ragStreamingMessage}
                selectedDocuments={ragSelectedDocuments}
                loadingChatbot={false}
                chatbotDetails={chatbotData}
                messagesEndRef={
                  ragMessagesEndRef as React.RefObject<HTMLDivElement>
                }
                onRecommendationClick={(recommendation: string) =>
                  setRagInput(recommendation)
                }
                renderChatbotDetails={true}
                thinkingMessage=""
                toolsMessage=""
                toolsMetadata={null}
                loading={ragLoading}
              />
            </div>
          </div>
          <div className="flex-none border-t border-border p-4 bg-muted/50">
            <ChatInput
              input={ragInput}
              loading={ragLoading}
              botId={botId}
              onInputChange={handleRagInputChange}
              onSend={handleRagSendWrapper}
              disabled={chatbotData === null}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRagSendWrapper([]);
                }
              }}
              inputRef={ragInputRef as React.RefObject<HTMLTextAreaElement>}
              selectedFiles={[]}
              onSelectedFilesChange={() => {}}
              color="bg-muted/50"
              reasoning={ragReasoning}
              onReasoningChange={setRagReasoning}
            />
          </div>
        </section>
      </div>

      <Dialog open={clearModalVisible} onOpenChange={setClearModalVisible}>
        <DialogContent className="bg-card border-blue-60/30">
          <DialogHeader>
            <DialogTitle className="text-card-foreground text-base md:text-lg">
              {t("clearModal.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {t("clearModal.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={handleClearConfirm}
              className="text-sm"
            >
              {t("clearModal.buttons.clear")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setClearModalVisible(false)}
              className="border-blue-60/30 text-sm"
            >
              {t("clearModal.buttons.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {chatbotData && (
        <ApiDocs
          botId={botId}
          open={isApiDocsOpen}
          onOpenChange={setIsApiDocsOpen}
        />
      )}
    </main>
  );
};

export default EditorChatbotClient;
