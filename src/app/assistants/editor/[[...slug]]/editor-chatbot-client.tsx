"use client";

import React from "react";
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
import { Trash2, Bot, ChevronLeft, KeyRound, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import ChatInput from "@/components/chat/chat-input";
import ChatMessageAgent from "@/components/chat/chat-message-box";
import UpdateChatbotForm from "@/components/update-chatbot-form";
import ChatMessages from "@/components/chat/chat-messages";
import { useEditorChatbot } from "@/hooks/use-editor-chatbot";

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
    // States
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
    isCompleted,
    ragInput,
    setRagInput,
    ragLoading,
    ragStreamingMessage,
    ragMessages,
    ragSelectedDocuments,
    chatbotData,

    // Constants
    geminiApiKey,
    modelOptions,
    isLogin,
    isLoading,

    // Refs
    messagesEndRef,
    inputRef,
    ragMessagesEndRef,
    ragInputRef,

    // Handlers
    handleSend,
    handleRagSend,
    handleKeyPress,
    handleClearConfirm,
    handleTabChange,
  } = useEditorChatbot(botId, notFounded);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang kiểm tra thông tin đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-[100dvh] bg-background">
      {/* SEO Hidden Headings */}
      <h1 className="sr-only">
        {notFounded ? "Tạo Chatbot AI Mới" : "Cập Nhật Chatbot AI"} - AI FTES
      </h1>

      {/* Header */}
      <header className="flex-none bg-card/90 backdrop-blur-sm shadow-sm border-b border-border py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-2 md:gap-0">
          <div className="flex items-center gap-2 md:gap-3">
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
            {!isLogin && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    className="ml-2 cursor-pointer text-xs md:text-sm"
                    variant="default"
                    role="button"
                    aria-label="Trạng thái đăng nhập"
                  >
                    <LogIn className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Chưa đăng
                    nhập
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="bg-card border-border">
                  <p className="text-card-foreground text-sm">
                    Bạn chưa đăng nhập.{" "}
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    size="sm"
                    variant="link"
                    className="text-primary"
                  >
                    Đăng nhập ngay
                  </Button>
                </PopoverContent>
              </Popover>
            )}
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
          <div className="flex items-center gap-2 w-full md:w-auto">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Editor */}
        <section className="w-full md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden">
          <Tabs
            defaultValue="chat"
            className="h-full"
            onValueChange={handleTabChange}
          >
            <div className="w-full flex justify-center">
              <TabsList className="w-2/3 flex justify-center" role="tablist">
                <TabsTrigger
                  value="chat"
                  className="w-fit data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                  role="tab"
                >
                  {notFounded ? "Tạo chatbot" : "Tạo và cập nhật"}
                </TabsTrigger>
                <TabsTrigger
                  value="form"
                  className="w-fit data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                  role="tab"
                >
                  Cấu hình
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="chat"
              className="h-[calc(100%-40px)] overflow-y-auto flex flex-col"
              role="tabpanel"
            >
              <div className="flex-1 overflow-y-auto p-4">
                <div className="w-full max-w-none space-y-4 md:space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-6 md:py-10">
                      <div className="bg-card rounded-xl p-4 md:p-8 shadow-sm border border-border">
                        <div className="flex flex-col items-center mb-6 md:mb-8">
                          <div className="bg-primary/10 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                            <Bot className="text-3xl md:text-4xl text-primary" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-card-foreground mb-2 md:mb-3">
                            🤖{" "}
                            {notFounded
                              ? "Tạo Chatbot AI Mới"
                              : "Cập Nhật Chatbot AI"}
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                            {notFounded
                              ? "Trợ lý AI thông minh sẽ giúp bạn tạo chatbot mới từ đầu."
                              : "Trợ lý AI thông minh sẽ giúp bạn cập nhật và chỉnh sửa chatbot của bạn."}
                          </p>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-primary/10">
                          <p className="text-card-foreground text-base md:text-lg leading-relaxed mb-3 md:mb-4">
                            <strong className="text-primary">
                              Tương tác với trợ lý AI
                            </strong>
                          </p>
                          <p className="text-sm md:text-base text-muted-foreground">
                            {notFounded
                              ? "Hãy trao đổi thông tin với trợ lý để tạo chatbot mới. Trợ lý sẽ hướng dẫn bạn từng bước để có được một chatbot hoàn chỉnh."
                              : "Hãy trao đổi thông tin với trợ lý thông qua chat để cập nhật và chỉnh sửa chatbot của bạn. Trợ lý sẽ hướng dẫn bạn từng bước để có được một chatbot hoàn chỉnh."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                          <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border transform hover:scale-[1.02] transition-transform duration-200">
                            <div className="flex items-center mb-3 md:mb-4">
                              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                <span className="text-lg md:text-xl">💡</span>
                              </div>
                              <h4 className="font-semibold text-card-foreground text-base md:text-lg">
                                Hướng dẫn sử dụng
                              </h4>
                            </div>
                            <ul className="text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3">
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Mô tả chatbot bạn muốn tạo"
                                  : "Mô tả các thay đổi bạn muốn thực hiện"}
                              </li>
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Xác định mục đích và đối tượng sử dụng"
                                  : "Cập nhật thông tin về người dùng mục tiêu"}
                              </li>
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Thiết lập tính năng và khả năng"
                                  : "Thêm hoặc chỉnh sửa các tính năng"}
                              </li>
                            </ul>
                          </div>

                          <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border transform hover:scale-[1.02] transition-transform duration-200">
                            <div className="flex items-center mb-3 md:mb-4">
                              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                <span className="text-lg md:text-xl">🎯</span>
                              </div>
                              <h4 className="font-semibold text-card-foreground text-base md:text-lg">
                                {notFounded
                                  ? "Ví dụ tạo mới"
                                  : "Ví dụ cập nhật"}
                              </h4>
                            </div>
                            <ul className="text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3">
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Tạo chatbot hỗ trợ khách hàng"
                                  : "Cập nhật prompt cho chatbot"}
                              </li>
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Thiết lập chatbot giáo dục"
                                  : "Thêm tính năng mới"}
                              </li>
                              <li className="flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                {notFounded
                                  ? "Cấu hình chatbot bán hàng"
                                  : "Chỉnh sửa cài đặt hiện có"}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-secondary/50 rounded-xl p-4 md:p-6 border border-border">
                          <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded-lg mr-3">
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
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <ChatMessageAgent
                        key={index}
                        message={{
                          role: msg.role,
                          content: msg.content,
                        }}
                      />
                    ))
                  )}

                  {/* Thinking Text with Animation */}
                  {thinkingText && (
                    <div className="fixed bottom-24 right-4 z-50">
                      <div className="flex items-center space-x-2 text-muted-foreground bg-background/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-lg border border-border">
                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-primary"></div>
                        <span className="animate-fade-in-out text-xs md:text-sm">
                          {thinkingText}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Streaming Message */}
                  {streamingMessage && (
                    <ChatMessageAgent
                      message={{
                        role: "assistant",
                        content: streamingMessage,
                      }}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex-none p-2 md:p-4 border-t border-border bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-none">
                  <ChatInput
                    input={input}
                    loading={loading || isCompleted}
                    botId={botId}
                    onInputChange={setInput}
                    onSend={handleSend}
                    onKeyPress={handleKeyPress}
                    inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                    selectedFiles={selectedFiles}
                    onSelectedFilesChange={setSelectedFiles}
                    disabled={isCompleted}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="form"
              className="h-[calc(100%-40px)] overflow-y-auto"
              role="tabpanel"
            >
              <UpdateChatbotForm
                botId={botId}
                initialData={chatbotData}
                onSuccess={() => {
                  // toast.success("Cập nhật chatbot thành công!");
                }}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Right Side - RAG Chat */}
        <section className="flex-1 flex flex-col md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden bg-muted/50">
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
            />
          </div>
          <div className="flex-none border-t border-border p-4 bg-muted/50">
            <ChatInput
              input={ragInput}
              loading={ragLoading}
              botId={botId}
              onInputChange={setRagInput}
              onSend={handleRagSend}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRagSend([]);
                }
              }}
              inputRef={ragInputRef as React.RefObject<HTMLTextAreaElement>}
              selectedFiles={[]}
              onSelectedFilesChange={() => {}}
              color="bg-muted/50"
            />
          </div>
        </section>
      </div>

      {/* Clear Confirmation Dialog */}
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
