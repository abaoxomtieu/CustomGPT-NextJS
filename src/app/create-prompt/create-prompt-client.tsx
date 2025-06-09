"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { toast } from "sonner";
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
  Menu,
  MenuSquare,
} from "lucide-react";

import ChatInput from "@/components/chat/chat-input";
import { getCookie } from "@/helpers/Cookies";
import { useAuth } from "@/hooks/use-auth";
import { ApiDomain } from "@/constant";
import CreateChatbotForm from "@/components/create-chatbot-form";
import ChatMessageAgent from "@/components/chat/chat-message-box";
import { useParams, useRouter } from "next/navigation";

const CHAT_HISTORY_KEY = "custom_chatbot_chat_history";

interface StructuredMessage {
  role: string;
  content: string;
  type?: string;
  displayContent?: string;
}

const fadeInOut = {
  animation: 'fadeInOut 2s ease-in-out infinite',
};

const styles = `
@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
`;

const CreatePromptClient = () => {
  // State
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const params = useParams();
  const slugArray = Array.isArray(params.slug)
    ? params.slug
    : [params.slug].filter(Boolean);
  const conversationIdParams = slugArray[0] || "";
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string>(
    (conversationIdParams as string) || ""
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [modelName, setModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { isLogin, isLoading } = useAuth();
  const [allowFirstRequest, setAllowFirstRequest] = useState(
    !getCookie("gemini_api_key")
  );
  const geminiApiKey = getCookie("gemini_api_key");
  const modelOptions = [
    { label: "Gemini 2.5 (mới)", value: "gemini-2.5-flash-preview-05-20" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  ];
  const thinkingMessages = ["Đang xử lý...", "Đang suy nghĩ..."];
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);

  useEffect(() => {
    const existingId = conversationIdParams;
    if (existingId) {
      setConversationId(existingId as string);
    } else {
      const newId = `conv_${Date.now()}`;
      setConversationId(newId);
    }
  }, [conversationIdParams, router]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${conversationId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${conversationId}`;
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (thinkingText) {
      interval = setInterval(() => {
        setCurrentThinkingIndex((prev) => (prev + 1) % thinkingMessages.length);
      }, 2000); // Change message every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [thinkingText]);

  const handleStreamingChat = async (query: string, files: File[]) => {
    try {
      setStreamingMessage("");
      setThinkingText("Đang xử lý...");
      setCurrentThinkingIndex(0);
      const formData = new FormData();
      formData.append("query", query);
      formData.append("conversation_id", conversationId);
      formData.append("model_name", modelName);
      if (getCookie("gemini_api_key"))
        formData.append("api_key", getCookie("gemini_api_key") || "");
      files.forEach((file) => {
        formData.append("attachs", file);
      });

      const response = await fetch(ApiDomain + "/ai/custom_chatbot/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === "message") {
              setStreamingMessage(data.content);
              setThinkingText("");
            } else if (data.type === "final") {
              const aiMessage: StructuredMessage = {
                role: "assistant",
                content: data.content.final_response,
                type: "ai",
                displayContent: data.content.final_response,
              };
              setMessages((prev) => [...prev, aiMessage]);
              setStreamingMessage("");
              setThinkingText("");
              setLoading(false);

              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);

              if (data.content.done) {
                setIsCompleted(true);
                toast.success("Tạo chatbot thành công!");

                setTimeout(() => {
                  router.push("/assistants");
                }, 3000);
              }
            } else if (data.type === "error") {
              throw new Error(data.content);
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error in streaming chat:", error);
      setLoading(false);
      setStreamingMessage("");
      setThinkingText("");
      const errorMessage: StructuredMessage = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "ai",
        displayContent: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSend = async (files: File[]) => {
    if (!isLoading && !isLogin) {
      toast.warning(
        "Bạn chưa đăng nhập, vui lòng đăng nhập để sử dụng tính năng này"
      );
      return;
    }

    if (!geminiApiKey) {
      if (allowFirstRequest) {
        setAllowFirstRequest(false);
      } else {
        toast.warning(
          "Bạn chưa thiết lập gemini apikey, đến trang <a style={{ color: '#1677ff', textDecoration: 'underline' }} onClick={() => navigate('/profile')}>Profile</a> để thiết lập"
        );
        return;
      }
    }

    if ((!input.trim() && files.length === 0) || loading) return;

    const userMessage: StructuredMessage = {
      role: "user",
      content: input,
      type: "human",
      displayContent: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await handleStreamingChat(input, files);
    setSelectedFiles([]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(selectedFiles);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  const handleClearConfirm = () => {
    clearHistory();
    setClearModalVisible(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra thông tin đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex-none bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-blue-600"
              >
                <ChevronLeft className="mr-1 w-4 h-4" /> Quay lại
              </Button>
              <Bot className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Trợ Lý Tạo Chatbot
                </h1>
                <p className="text-sm text-gray-500">
                  Trợ lý AI giúp bạn tạo chatbot nhanh chóng.
                </p>
              </div>
              {!isLogin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge className="ml-2 cursor-pointer" variant="default">
                      <LogIn className="w-4 h-4 mr-1" /> Chưa đăng nhập
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent>
                    Bạn chưa đăng nhập.{" "}
                    <Button
                      onClick={() => router.push("/login")}
                      size="sm"
                      variant="link"
                    >
                      Đăng nhập ngay
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    className={`ml-2 ${
                      geminiApiKey
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    } cursor-pointer`}
                  >
                    <KeyRound className="w-4 h-4 mr-1" />
                    Gemini API Key:{" "}
                    {geminiApiKey ? "Đã thiết lập" : "Chưa thiết lập"}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent>
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
                      >
                        Thiết lập ngay
                      </Button>
                    </span>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn mô hình AI" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                onClick={() => setClearModalVisible(true)}
              >
                <Trash2 className="mr-2 w-4 h-4" /> Xoá hội thoại
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Create Chatbot Form */}
          {!isFormCollapsed && (
            <div className="w-1/3 border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden">
              <div className="p-4 overflow-y-auto h-full">
                <CreateChatbotForm
                  onSuccess={() => {
                    toast.success("Tạo chatbot thành công!");
                  }}
                />
              </div>
            </div>
          )}

          {/* Right Side - Chat Messages */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Collapse Button */}
            <div className="flex-none p-2 border-b border-gray-100">
              <Button
                variant="ghost"
                onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                className="text-gray-600 hover:text-blue-600"
              >
                {isFormCollapsed ? (
                  <Menu className="w-4 h-4" />
                ) : (
                  <MenuSquare className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-4 px-4">
              <div className="w-full max-w-none space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                      <Bot className="text-4xl text-blue-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        🤖 Trợ Lý Tạo Chatbot
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-6 mb-6 border-blue-500">
                        <p className="text-gray-700 text-base leading-relaxed mb-4">
                          <strong>
                            Trợ lý AI này sẽ hỗ trợ bạn tạo ra một chatbot theo
                            yêu cầu của bạn.
                          </strong>
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Hãy trao đổi thông tin với trợ lý thông qua chat để
                          thu thập đủ dữ liệu tạo chatbot mới.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <span className="text-lg">💡</span>
                            <h4 className="font-semibold text-green-800 ml-2">
                              Hướng dẫn sử dụng
                            </h4>
                          </div>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Mô tả mục đích chatbot của bạn</li>
                            <li>• Cung cấp thông tin về người dùng mục tiêu</li>
                            <li>• Chia sẻ yêu cầu tính năng cụ thể</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <span className="text-lg">🎯</span>
                            <h4 className="font-semibold text-purple-800 ml-2">
                              Ví dụ tạo chatbot
                            </h4>
                          </div>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Chatbot hỗ trợ khách hàng</li>
                            <li>• Chatbot tư vấn sản phẩm</li>
                            <li>• Chatbot giáo dục</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">💬 Bắt đầu:</span> Hãy
                          nhập câu hỏi hoặc mô tả chatbot bạn muốn tạo vào ô
                          chat bên dưới!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <ChatMessageAgent
                      key={index}
                      message={{
                        role: msg.role,
                        content: msg.displayContent || msg.content,
                      }}
                    />
                  ))
                )}
                {/* Thinking Text with Animation */}
                {thinkingText && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    <span className="animate-fade-in-out">
                      {thinkingMessages[currentThinkingIndex]}
                    </span>
                  </div>
                )}
                {/* Streaming Message */}
                {streamingMessage && (
                  <ChatMessageAgent
                    message={{ role: "assistant", content: streamingMessage }}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Input Area */}
            <div className="flex-none p-4 bg-white/90 backdrop-blur-sm">
              <div className="w-full max-w-none">
                <ChatInput
                  input={input}
                  loading={loading || isCompleted}
                  botId=""
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
          </div>
        </div>

        {/* Clear Confirmation Dialog */}
        <Dialog open={clearModalVisible} onOpenChange={setClearModalVisible}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xoá hội thoại</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xoá toàn bộ hội thoại không?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="destructive" onClick={handleClearConfirm}>
                Xoá
              </Button>
              <Button
                variant="outline"
                onClick={() => setClearModalVisible(false)}
              >
                Huỷ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CreatePromptClient;
