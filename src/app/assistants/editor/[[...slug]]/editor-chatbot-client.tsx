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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ChatInput from "@/components/chat/chat-input";
import { getCookie } from "@/helpers/Cookies";
import { useAuth } from "@/hooks/use-auth";
import { ApiDomain } from "@/constant";
import ChatMessageAgent from "@/components/chat/chat-message-box";
import { useParams, useRouter } from "next/navigation";
import { fetchChatbotDetail } from "@/services/chatbotService";
import UpdateChatbotForm from "@/components/update-chatbot-form";
import { sendStreamingRagAgentMessage } from "@/services/ragAgentService";
import { RagAgentPayload } from "@/services/ragAgentService";
import ChatMessages from "@/components/chat/chat-messages";

const CHAT_HISTORY_KEY = "update_chatbot_chat_history";

interface StructuredMessage {
  role: "user" | "assistant";
  content:
    | string
    | Array<{
        type: string;
        text?: string;
        url?: string;
        name?: string;
        source_type?: string;
      }>;
  type: "user" | "ai";
}

const thinkingMessages = [
  "Đang phân tích câu hỏi của bạn...",
  "Đang tìm kiếm thông tin phù hợp...",
  "Đang xử lý dữ liệu...",
  "Đang suy nghĩ về câu trả lời...",
  "Đang tổng hợp thông tin...",
  "Đang chuẩn bị phản hồi...",
];

interface UpdateChatbotClientProps {
  botId: string;
  notFounded: boolean;
}

const EditorChatbotClient: React.FC<UpdateChatbotClientProps> = ({
  botId,
  notFounded,
}) => {
  // State
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const router = useRouter();
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
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [chatbotData, setChatbotData] = useState<any>(null);
  const [ragInput, setRagInput] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragStreamingMessage, setRagStreamingMessage] = useState("");
  const [ragMessages, setRagMessages] = useState<StructuredMessage[]>([]);
  const [ragSelectedDocuments, setRagSelectedDocuments] = useState<any[]>([]);
  const ragMessagesEndRef = useRef<HTMLDivElement>(null!);
  const ragInputRef = useRef<HTMLTextAreaElement>(null!);
  const [isLoadingChatbot, setIsLoadingChatbot] = useState(true);

  useEffect(() => {
    const loadChatbotData = async () => {
      try {
        setIsLoadingChatbot(true);
        const data = await fetchChatbotDetail(botId);
        setChatbotData(data);
      } catch (error) {
        console.error("Error loading chatbot data:", error);
        toast.error("Không thể tải thông tin chatbot");
      } finally {
        setIsLoadingChatbot(false);
      }
    };
    if (!notFounded) {
      loadChatbotData();
    } else {
      setIsLoadingChatbot(false);
    }
  }, [botId]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, botId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, thinkingText]);

  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
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
  }, [botId]);

  // Thinking text rotation effect
  useEffect(() => {
    if (loading && !streamingMessage) {
      let index = 0;
      setThinkingText(thinkingMessages[0]);
      thinkingIntervalRef.current = setInterval(() => {
        index = (index + 1) % thinkingMessages.length;
        setThinkingText(thinkingMessages[index]);
      }, 2000);
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      setThinkingText("");
    }

    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [loading, streamingMessage]);

  const handleStreamingChat = async (query: string, files: File[]) => {
    try {
      setStreamingMessage("");
      setThinkingText("Đang xử lý...");
      setCurrentThinkingIndex(0);
      const formData = new FormData();
      formData.append("query", query);
      formData.append("bot_id", botId);
      formData.append("model_name", modelName);
      if (getCookie("gemini_api_key"))
        formData.append("api_key", getCookie("gemini_api_key") || "");
      files.forEach((file) => {
        formData.append("attachs", file);
      });

      const response = await fetch(
        ApiDomain + "/ai/custom_chatbot/update/stream",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
          body: formData,
        }
      );

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
                toast.success("Cập nhật chatbot thành công!");

                // setTimeout(() => {
                //   router.push("/assistants");
                // }, 3000);
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
          "Bạn chưa thiết lập gemini apikey, đến trang Profile để thiết lập gemini apikey",
          {
            action: {
              label: "Thiết lập ngay",
              onClick: () => router.push("/profile"),
            },
          }
        );
        return;
      }
    }

    if ((!input.trim() && files.length === 0) || loading) return;

    const userMessage: StructuredMessage = {
      role: "user",
      content: input,
      type: "user",
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

  const handleTabChange = async (value: string) => {
    if (value === "form") {
      try {
        const data = await fetchChatbotDetail(botId);
        setChatbotData(data);
      } catch (error) {
        console.error("Error loading chatbot data:", error);
        toast.error("Không thể tải thông tin chatbot");
      }
    }
  };

  const handleRagStreamingChat = async (payload: RagAgentPayload) => {
    try {
      setRagStreamingMessage("");
      setRagSelectedDocuments([]);
      await sendStreamingRagAgentMessage(
        { ...payload, model_name: "gemini-2.5-flash-preview-05-20" },
        (message: string) => {
          setRagStreamingMessage(message);
        },
        (finalData: {
          final_response: string;
          selected_ids: number[];
          selected_documents: any[];
        }) => {
          setRagStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;
            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc) =>
                doc.metadata?.public_url && doc.metadata?.type === "image"
            );
            const contentItems = [];
            if (responseContent) {
              contentItems.push({ type: "text", text: responseContent });
            }
            if (imageDocuments.length > 0) {
              if (
                responseContent.includes("[Image]") ||
                responseContent.includes("[image]")
              ) {
                imageDocuments.forEach((doc) => {
                  responseContent = responseContent.replace(
                    /\[Image\]/i,
                    `![image]\n(${doc.metadata.public_url})`
                  );
                  contentItems.push({
                    type: "image",
                    source_type: "url",
                    url: doc.metadata.public_url,
                  });
                });
              }
            }
            const aiMessage: StructuredMessage = {
              role: "assistant",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: "ai",
            };
            setRagMessages((prev) => [...prev, aiMessage]);
            setRagSelectedDocuments(finalData.selected_documents || []);
            setRagLoading(false);
          }
        },
        (error: string) => {
          setRagLoading(false);
          setRagStreamingMessage("");
          const errorMessage: StructuredMessage = {
            role: "assistant",
            content: `Lỗi: ${error}`,
            type: "ai",
          };
          setRagMessages((prev) => [...prev, errorMessage]);
        }
      );
    } catch (error) {
      setRagLoading(false);
    }
  };

  const handleRagSend = async (files: File[]) => {
    if (!ragInput.trim() && files.length === 0) return;

    const messageContent = ragInput;
    const messageFiles = [...files];
    setRagLoading(true);

    const userMessage: StructuredMessage = {
      role: "user",
      content: messageContent,
      type: "user",
    };

    setRagInput("");
    setRagMessages((prev) => [...prev, userMessage]);

    const payload: RagAgentPayload = {
      query: messageContent,
      bot_id: botId,
      conversation_id: `conv_${Date.now()}`,
      attachs: messageFiles,
    };
    await handleRagStreamingChat(payload);
  };

  if (isLoading || isLoadingChatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading
              ? "Đang kiểm tra thông tin đăng nhập..."
              : "Đang tải thông tin chatbot..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Header */}
        <div className="flex-none bg-card/90 backdrop-blur-sm shadow-sm border-b border-border py-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-2 md:gap-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/assistants")}
                className="text-muted-foreground hover:text-foreground p-1 md:p-2"
              >
                <ChevronLeft className="mr-1 w-4 h-4" />
                <span className="hidden md:inline">Quay lại</span>
              </Button>
              <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-card-foreground">
                  Cập Nhật Chatbot AI
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Chỉnh sửa và cập nhật chatbot của bạn.
                </p>
              </div>
              {!isLogin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      className="ml-2 cursor-pointer text-xs md:text-sm"
                      variant="default"
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
                  >
                    <KeyRound className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden md:inline">
                      Gemini API Key:
                    </span>{" "}
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
                <SelectTrigger className="w-full md:w-[180px] bg-background border-border text-sm">
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
              >
                <Trash2 className="mr-2 w-4 h-4" /> Xoá hội thoại
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Side - Tabs */}
          {!isFormCollapsed && (
            <div
              className={`w-full md:w-1/2 transition-all duration-300 ease-in-out overflow-hidden`}
            >
              <Tabs
                defaultValue="chat"
                className="h-full"
                onValueChange={handleTabChange}
              >
                <div className="w-full flex justify-center">
                  <TabsList className="w-2/3 flex justify-center">
                    <TabsTrigger
                      value="chat"
                      className="w-fit data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                    >
                      Tạo và cập nhật
                    </TabsTrigger>
                    <TabsTrigger
                      value="form"
                      className="w-fit data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                    >
                      Cấu hình
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent
                  value="chat"
                  className="h-[calc(100%-40px)] overflow-y-auto flex flex-col"
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
                              <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-2 md:mb-3">
                                🤖 Cập Nhật Chatbot AI
                              </h2>
                              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                                Trợ lý AI thông minh sẽ giúp bạn cập nhật và
                                chỉnh sửa chatbot của bạn.
                              </p>
                            </div>

                            <div className="bg-primary/5 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-primary/10">
                              <p className="text-card-foreground text-base md:text-lg leading-relaxed mb-3 md:mb-4">
                                <strong className="text-primary">
                                  Tương tác với trợ lý AI
                                </strong>
                              </p>
                              <p className="text-sm md:text-base text-muted-foreground">
                                Hãy trao đổi thông tin với trợ lý thông qua chat
                                để cập nhật và chỉnh sửa chatbot của bạn. Trợ lý
                                sẽ hướng dẫn bạn từng bước để có được một
                                chatbot hoàn chỉnh.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                              <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border transform hover:scale-[1.02] transition-transform duration-200">
                                <div className="flex items-center mb-3 md:mb-4">
                                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                    <span className="text-lg md:text-xl">
                                      💡
                                    </span>
                                  </div>
                                  <h3 className="font-semibold text-card-foreground text-base md:text-lg">
                                    Hướng dẫn sử dụng
                                  </h3>
                                </div>
                                <ul className="text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3">
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Mô tả các thay đổi bạn muốn thực hiện
                                  </li>
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Cập nhật thông tin về người dùng mục tiêu
                                  </li>
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Thêm hoặc chỉnh sửa các tính năng
                                  </li>
                                </ul>
                              </div>

                              <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border transform hover:scale-[1.02] transition-transform duration-200">
                                <div className="flex items-center mb-3 md:mb-4">
                                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                    <span className="text-lg md:text-xl">
                                      🎯
                                    </span>
                                  </div>
                                  <h3 className="font-semibold text-card-foreground text-base md:text-lg">
                                    Ví dụ cập nhật
                                  </h3>
                                </div>
                                <ul className="text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3">
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Cập nhật prompt cho chatbot
                                  </li>
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Thêm tính năng mới
                                  </li>
                                  <li className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    Chỉnh sửa cài đặt hiện có
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
                                    Hãy nhập câu hỏi hoặc mô tả các thay đổi bạn
                                    muốn thực hiện vào ô chat bên dưới!
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
                  {/* Chat Input moved to chat tab */}
                  <div className="flex-none p-2 md:p-4 border-t border-border bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-none">
                      <ChatInput
                        input={input}
                        loading={loading || isCompleted}
                        botId={botId}
                        onInputChange={setInput}
                        onSend={handleSend}
                        onKeyPress={handleKeyPress}
                        inputRef={
                          inputRef as React.RefObject<HTMLTextAreaElement>
                        }
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
                >
                  <UpdateChatbotForm
                    botId={botId}
                    initialData={chatbotData}
                    onSuccess={() => {
                      toast.success("Cập nhật chatbot thành công!");
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Right Side - RAG Chat */}
          <div
            className={`flex-1 flex flex-col ${
              isFormCollapsed ? "w-full" : "md:w-1/2"
            } transition-all duration-300 ease-in-out overflow-hidden bg-muted/50`}
          >
            <div className="flex-1 overflow-y-auto p-4">
              <ChatMessages
                messages={ragMessages}
                streamingMessage={ragStreamingMessage}
                selectedDocuments={ragSelectedDocuments}
                loadingChatbot={false}
                chatbotDetails={chatbotData}
                messagesEndRef={ragMessagesEndRef}
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
                inputRef={ragInputRef}
                selectedFiles={[]}
                onSelectedFilesChange={() => {}}
                color="bg-muted/50"
              />
            </div>
          </div>
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
      </div>
    </>
  );
};

export default EditorChatbotClient;
