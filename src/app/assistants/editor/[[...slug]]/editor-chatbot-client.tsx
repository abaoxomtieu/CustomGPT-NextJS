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
import { Trash2, Bot, ChevronLeft, KeyRound, LogIn, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ChatInput from "@/components/chat/chat-input";
import ChatMessageAgent from "@/components/chat/chat-message-box";
import UpdateChatbotForm from "@/components/update-chatbot-form";
import ChatMessages from "@/components/chat/chat-messages";
import ToolMessage from "@/components/chat/tool-message";
import { useEditorChatbot } from "@/hooks/use-editor-chatbot";
import { fetchChatbotDetail } from "@/services/chatbotService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Styles
const styles = {
  header:
    "flex-none bg-card/90 backdrop-blur-sm shadow-sm border-b border-border py-0",
  headerContainer:
    "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-2 md:gap-0",
  headerLeft: "flex items-center gap-2 md:gap-3",
  headerRight: "flex items-center gap-2 w-full md:w-auto",
  mainContent: "flex-1 flex flex-col md:flex-row overflow-hidden",
  leftSection:
    "w-full md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden",
  rightSection:
    "flex-1 flex flex-col md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden bg-muted/50",
  tabList: "w-2/3 flex justify-center",
  tabTrigger:
    "w-fit data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm",
  chatContainer: "h-[calc(100%-40px)] overflow-y-auto flex flex-col",
  chatInput:
    "flex-none p-2 md:p-4 border-t border-border bg-background/80 backdrop-blur-sm",
  emptyState: "text-center py-6 md:py-10",
  emptyStateCard:
    "bg-card rounded-xl p-4 md:p-8 shadow-sm border border-border",
  featureCard:
    "bg-secondary/50 p-4 md:p-6 rounded-xl border border-border transform hover:scale-[1.02] transition-transform duration-200",
  featureIcon: "bg-primary/10 p-2 rounded-lg mr-3",
  featureList:
    "text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3",
  featureItem: "flex items-center",
  featureDot: "w-2 h-2 bg-primary rounded-full mr-2",
};

// Empty State Component
const EmptyState = ({ notFounded }: { notFounded: boolean }) => (
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
          🤖 {notFounded ? "Tạo Chatbot AI Mới" : "Cập Nhật Chatbot AI"}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          {notFounded
            ? "Trợ lý AI thông minh sẽ giúp bạn tạo chatbot mới từ đầu."
            : "Trợ lý AI thông minh sẽ giúp bạn cập nhật và chỉnh sửa chatbot của bạn."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <FeatureCard
          icon="💡"
          title="Hướng dẫn sử dụng"
          items={[
            notFounded
              ? "Mô tả chatbot bạn muốn tạo"
              : "Mô tả các thay đổi bạn muốn thực hiện",
            notFounded
              ? "Xác định mục đích và đối tượng sử dụng"
              : "Cập nhật thông tin về người dùng mục tiêu",
            notFounded
              ? "Thiết lập tính năng và khả năng"
              : "Thêm hoặc chỉnh sửa các tính năng",
          ]}
        />
        <FeatureCard
          icon="🎯"
          title={notFounded ? "Ví dụ tạo mới" : "Ví dụ cập nhật"}
          items={[
            notFounded
              ? "Tạo chatbot hỗ trợ khách hàng"
              : "Cập nhật prompt cho chatbot",
            notFounded ? "Thiết lập chatbot giáo dục" : "Thêm tính năng mới",
            notFounded
              ? "Cấu hình chatbot bán hàng"
              : "Chỉnh sửa cài đặt hiện có",
          ]}
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
              Bắt đầu ngay
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {notFounded
                ? "Hãy nhập mô tả chatbot bạn muốn tạo vào ô chat bên dưới!"
                : "Hãy nhập câu hỏi hoặc mô tả các thay đổi bạn muốn thực hiện vào ô chat bên dưới!"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

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
const LoadingState = () => (
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
      <p className="text-muted-foreground">
        Đang kiểm tra thông tin đăng nhập...
      </p>
    </motion.div>
  </div>
);

// Unauthorized State Component
const UnauthorizedState = ({ notFounded }: { notFounded: boolean }) => {
  const router = useRouter();
  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-6"
      >
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-yellow-500/10 p-4 rounded-full mb-4"
            >
              <LogIn className="text-4xl text-yellow-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Bạn cần đăng nhập để sử dụng tính năng{" "}
              {notFounded ? "tạo" : "cập nhật"} chatbot AI.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Đang chuyển hướng về trang chủ trong 3 giây...
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/")} className="w-full">
              <LogIn className="mr-2 w-4 h-4" />
              Về trang chủ để đăng nhập
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/assistants")}
              className="w-full"
            >
              Quay lại danh sách chatbot
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

  useEffect(() => {
    if (!notFounded) {
      fetchChatbotDetail(botId)
        .then((data) => {
          setChatbotData(data);
        })
        .catch((error) => {
          console.error("Error fetching chatbot details:", error);
        });
    }
  }, []);

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
      toast.warning("Bạn cần đăng nhập để sử dụng tính năng này", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    setInput(value);
  };

  const handleRagInputChange = (value: string) => {
    if (!isLogin) {
      toast.warning("Bạn cần đăng nhập để sử dụng tính năng này", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    setRagInput(value);
  };

  const handleSendWrapper = async (files: File[]) => {
    if (!isLogin) {
      toast.warning("Bạn cần đăng nhập để sử dụng tính năng này", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/"),
        },
      });
      return;
    }
    await handleSend(files);
  };

  const handleRagSendWrapper = async (files: File[]) => {
    if (!isLogin) {
      toast.warning("Bạn cần đăng nhập để sử dụng tính năng này", {
        action: {
          label: "Đăng nhập",
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
        {notFounded ? "Tạo Chatbot AI Mới" : "Cập Nhật Chatbot AI"} - AI FTES
      </h1>

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Button
              variant="ghost"
              onClick={() => router.push("/assistants")}
              className="text-muted-foreground hover:text-foreground p-1 md:p-2"
              aria-label="Quay lại danh sách chatbot"
            >
              <ChevronLeft className="mr-1 w-4 h-4" />
              <span className="hidden md:inline">Quay lại</span>
            </Button>
            <Bot
              className="w-5 h-5 md:w-6 md:h-6 text-primary"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                {notFounded ? "Tạo Chatbot AI Mới" : "Cập Nhật Chatbot AI"}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {notFounded
                  ? "Tạo chatbot AI thông minh với công nghệ Gemini."
                  : "Chỉnh sửa và cập nhật chatbot của bạn."}
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  className={`ml-2 text-xs md:text-sm ${
                    geminiApiKey
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  } cursor-pointer`}
                  role="button"
                  aria-label={`Trạng thái Gemini API Key: ${
                    geminiApiKey ? "Đã thiết lập" : "Chưa thiết lập"
                  }`}
                >
                  <KeyRound className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden md:inline">Gemini API Key:</span>{" "}
                  {geminiApiKey ? "Đã thiết lập" : "Chưa thiết lập"}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="bg-card border-border">
                <p className="text-card-foreground text-sm">
                  {geminiApiKey ? (
                    "Bạn đã thiết lập Gemini API Key, có thể sử dụng đầy đủ tính năng AI Gemini."
                  ) : (
                    <span>
                      Bạn chưa thiết lập Gemini API Key.
                      <br />
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => router.push("/profile")}
                        className="text-primary"
                      >
                        Thiết lập ngay
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
                className="w-full md:w-[180px] bg-background border-border text-sm"
                aria-label="Chọn mô hình AI"
              >
                <SelectValue placeholder="Chọn mô hình AI" />
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
            <Button
              variant="destructive"
              onClick={() => setClearModalVisible(true)}
              className="text-sm whitespace-nowrap"
              aria-label="Xóa toàn bộ hội thoại"
            >
              <Trash2 className="mr-2 w-4 h-4" /> Xoá hội thoại
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
                  {notFounded ? "Tạo chatbot" : "Tạo và cập nhật"}
                </TabsTrigger>
                {chatbotData && (
                  <TabsTrigger
                    value="form"
                    className={styles.tabTrigger}
                    role="tab"
                  >
                    Cấu hình
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            <TabsContent
              value="chat"
              className={styles.chatContainer}
              role="tabpanel"
            >
              <div className="flex-1 overflow-y-auto">
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
                        thinkingMessage={toolsMessage}
                        renderChatbotDetails={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={styles.chatInput}>
                <div className="w-full max-w-none">
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

        <section className={styles.rightSection}>
          <h3 className="sr-only">Chat với Chatbot</h3>
          <div className="flex-1 overflow-y-auto p-4">
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
            />
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
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground text-base md:text-lg">
              Xoá hội thoại
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Bạn có chắc chắn muốn xoá toàn bộ hội thoại không?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={handleClearConfirm}
              className="text-sm"
            >
              Xoá
            </Button>
            <Button
              variant="outline"
              onClick={() => setClearModalVisible(false)}
              className="border-border text-sm"
            >
              Huỷ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default EditorChatbotClient;
