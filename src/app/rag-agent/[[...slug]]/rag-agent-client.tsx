"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  Edit,
  ArrowLeft,
  TerminalSquare,
  FileText,
  MoreHorizontal,
  Trash2,
  Loader2,
  KeyRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  RagAgentPayload,
  sendStreamingRagAgentMessage,
} from "@/services/ragAgentService";
import { fetchChatbotDetail, Chatbot } from "@/services/chatbotService";
import ApiDocs from "@/components/chat/api-docs";
import { getCookie } from "@/helpers/Cookies";
import {
  StructuredMessage,
  useConversationManager,
} from "@/hooks/use-conversation-manager";
import { useAuth } from "@/hooks/use-auth";
import DocumentManagementDialog from "@/components/chat/document-management-modal";
import ChatInput from "@/components/chat/chat-input";
import ConversationList from "@/components/chat/conversation-list";
import ChatMessages from "@/components/chat/chat-messages";
import ChatbotEditDialog from "@/components/chat/chat-edit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ==== BẮT ĐẦU: Nhận params qua props ====
const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const thinkingTexts = [
  "Đang phân tích câu hỏi của bạn...",
  "Đang tìm kiếm thông tin phù hợp...",
  "Đang xử lý dữ liệu...",
  "Đang suy nghĩ về câu trả lời...",
  "Đang tổng hợp thông tin...",
  "Đang chuẩn bị phản hồi...",
];

export default function RagAgentClient({
  params,
}: {
  params: { slug: string[] };
}) {
  // Xử lý params từ dynamic route [...slug]
  const slugArray = Array.isArray(params.slug)
    ? params.slug
    : [params.slug].filter(Boolean);
  const urlBotId = slugArray[0] || "";
  const urlConversationId = slugArray[1] || "";

  const router = useRouter();
  const { isLogin, isLoading: isAuthLoading } = useAuth();

  const [botId, setBotId] = useState<string>(urlBotId || "");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [chatbotDetails, setChatbotDetails] = useState<Chatbot | null>(null);
  const [loadingChatbot, setLoadingChatbot] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [modelName, setModelName] = useState<string>(modelOptions[0].value);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [allowFirstRequest, setAllowFirstRequest] = useState(
    !getCookie("gemini_api_key")
  );
  const [localConversationId, setLocalConversationId] = useState<
    string | undefined
  >(urlConversationId as string);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // hooks
  const {
    conversations,
    conversationId,
    messages,
    isInitialized,
    createConversation,
    deleteConversation,
    selectConversation,
    addMessage,
    clearMessages,
    clearAllStorage,
  } = useConversationManager({
    botId,
    urlConversationId: urlConversationId as string,
    navigate: (path: string, options?: any) => {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
  });

  const geminiApiKey = getCookie("gemini_api_key");

  // Thinking text rotation effect
  useEffect(() => {
    if (loading && !streamingMessage) {
      let index = 0;
      setThinkingText(thinkingTexts[0]);
      thinkingIntervalRef.current = setInterval(() => {
        index = (index + 1) % thinkingTexts.length;
        setThinkingText(thinkingTexts[index]);
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

  useEffect(() => {
    if (urlBotId && (!chatbotDetails || chatbotDetails.id !== urlBotId)) {
      setBotId(urlBotId as string);

      const fetchDetails = async () => {
        try {
          setLoadingChatbot(true);
          const chatbot = await fetchChatbotDetail(urlBotId as string);
          setChatbotDetails(chatbot);
        } catch (error) {
          toast.error("Lỗi khi tải thông tin chatbot");
        } finally {
          setLoadingChatbot(false);
        }
      };

      fetchDetails();
    }
  }, [urlBotId, chatbotDetails?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage, thinkingText]);

  // Auth loading (replace Spin with a simple loader)
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // handle streaming chat
  const handleStreamingChat = async (payload: RagAgentPayload) => {
    try {
      setStreamingMessage("");
      setSelectedDocuments([]);
      await sendStreamingRagAgentMessage(
        { ...payload, model_name: modelName },
        (message: string) => {
          setStreamingMessage(message);
        },
        (finalData: {
          final_response: string;
          selected_ids: number[];
          selected_documents: any[];
        }) => {
          setStreamingMessage("");
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
            addMessage(aiMessage);
            setSelectedDocuments(finalData.selected_documents || []);
            setLoading(false);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        },
        (error: string) => {
          setLoading(false);
          setStreamingMessage("");
          const errorMessage: StructuredMessage = {
            role: "assistant",
            content: `Lỗi: ${error}`,
            type: "ai",
          };
          addMessage(errorMessage);
        }
      );
    } catch (error) {
      setLoading(false);
    }
  };

  // send message
  const handleSend = async (files: File[]) => {
    if (!isAuthLoading && !isLogin) {
      toast.warning("Bạn cần đăng nhập để sử dụng tính năng này.");
      router.push("/login");
      return;
    }
    if (!input.trim() && files.length === 0) return;
    // Kiểm tra Gemini API key
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
    // Xử lý conversation ID
    let usedConversationId = localConversationId || urlConversationId;
    let shouldCreateNewConversation = false;
    if (!usedConversationId) {
      usedConversationId = `conv_${Date.now()}`;
      setLocalConversationId(usedConversationId);
      shouldCreateNewConversation = true;
    }
    // Lưu nội dung tin nhắn trước khi xử lý
    const messageContent = input;
    const messageFiles = [...files];
    setLoading(true);
    // Tạo user message
    const userMessage: StructuredMessage = {
      role: "user",
      content:
        messageFiles.length > 0
          ? [
              { type: "text", text: messageContent },
              ...messageFiles.map((file) => ({
                type: file.type.startsWith("image/") ? "image" : "file",
                url: URL.createObjectURL(file),
                name: file.name,
              })),
            ]
          : messageContent,
      type: "user",
    };
    // Clear input ngay lập tức để UX tốt hơn
    setInput("");
    setSelectedFiles([]);
    // Nếu cần tạo conversation mới, update URL trước khi gửi tin nhắn
    if (shouldCreateNewConversation) {
      const newUrl = `/rag-agent/${botId}/${usedConversationId}`;
      window.history.replaceState(null, "", newUrl);
      if (typeof createConversation === "function") {
        const newConversation = {
          conversation_id: usedConversationId,
          name: `Conversation ${Date.now()}`,
          created_at: Date.now(),
        };
      }
    }
    // Thêm message vào state
    addMessage(userMessage);
    // Tạo payload và gửi
    const payload: RagAgentPayload = {
      query: messageContent,
      bot_id: botId,
      conversation_id: usedConversationId,
      model_name: modelName,
      attachs: messageFiles,
    };
    await handleStreamingChat(payload);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(selectedFiles);
    }
  };

  // Modal handlers
  const openEditDialog = () => setIsEditDialogOpen(true);
  const closeEditDialog = () => setIsEditDialogOpen(false);
  const handleChatbotUpdate = (updatedChatbot: Chatbot) => {
    setChatbotDetails(updatedChatbot);
  };

  // Dropdown menu
  const headerDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsDocumentDialogOpen(true)}>
          <FileText className="w-4 h-4 mr-2" /> Quản lý tài liệu
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEditDialog}>
          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsApiDocsOpen(true)}>
          <TerminalSquare className="w-4 h-4 mr-2" /> Tài liệu API
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={clearMessages}>
          <Trash2 className="w-4 h-4 mr-2" /> Xóa lịch sử chat
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() =>
            toast(
              <div>
                <div className="mb-2 font-semibold text-red-700">
                  Xác nhận xóa tất cả dữ liệu
                </div>
                <div className="text-sm mb-4">
                  Hành động này sẽ xóa tất cả cuộc trò chuyện và không thể hoàn
                  tác.
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearAllStorage();
                    toast.dismiss();
                  }}
                >
                  Xác nhận
                </Button>
              </div>,
              { duration: 9999 }
            )
          }
        >
          <Trash2 className="w-4 h-4 mr-2" /> Xóa tất cả đoạn hội thoại
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!isInitialized || !botId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full">
      {loadingChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="ml-4 text-lg text-foreground">Đang tải...</span>
        </div>
      )}
      {/* Sidebar */}
      <div
        className={`flex-none bg-card/90 backdrop-blur-sm border-r border-border transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={conversationId}
          isSidebarCollapsed={isSidebarCollapsed}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onCreateConversation={createConversation}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      {/* Main Content */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex-none bg-card/90 backdrop-blur-sm shadow-sm border-b border-border py-4">
          <div className="flex justify-between items-center px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/assistants")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft />
              </Button>
              <Avatar className="bg-primary/10">
                <AvatarFallback className="text-primary">
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div>
                {loadingChatbot ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Đang tải</span>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-semibold text-card-foreground">
                      {chatbotDetails?.name || "Trợ lý AI"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {chatbotDetails?.description}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isLogin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        onClick={() => router.push("/login")}
                      >
                        Chưa đăng nhập
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground">
                      Đăng nhập để sử dụng đầy đủ tính năng
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    className={`ml-2 ${
                      geminiApiKey
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    } cursor-pointer`}
                  >
                    <KeyRound className="w-4 h-4 mr-1" />
                    Gemini API Key:{" "}
                    {geminiApiKey ? "Đã thiết lập" : "Chưa thiết lập"}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="bg-popover text-popover-foreground border-border">
                  {geminiApiKey ? (
                    "Bạn đã thiết lập Gemini API Key, có thể sử dụng đầy đủ tính năng AI Gemini."
                  ) : (
                    <span>
                      Bạn chưa thiết lập Gemini API Key.
                      <br />
                      <Button
                        size="sm"
                        variant="link"
                        className="text-primary hover:text-primary/80"
                        onClick={() => router.push("/profile")}
                      >
                        Thiết lập ngay
                      </Button>
                    </span>
                  )}
                </PopoverContent>
              </Popover>
              {headerDropdown}
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="w-44 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  {modelOptions.map((opt) => (
                    <SelectItem value={opt.value} key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Chat Messages */}
        <ChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          selectedDocuments={selectedDocuments}
          loadingChatbot={loadingChatbot}
          chatbotDetails={chatbotDetails}
          messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          onRecommendationClick={(recommendation: string) =>
            setInput(recommendation)
          }
        />
        {/* Thinking Text with Animation */}
        {thinkingText && (
          <div className="fixed bottom-24 right-4 z-50">
            <div className="flex items-center space-x-2 text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="animate-fade-in-out text-sm">
                {thinkingText}
              </span>
            </div>
          </div>
        )}
        {/* Chat Input */}
        <ChatInput
          input={input}
          loading={loading}
          botId={botId}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
          inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
          selectedFiles={selectedFiles}
          onSelectedFilesChange={setSelectedFiles}
        />
      </div>

      {/* Document Management Dialog */}
      {isDocumentDialogOpen && (
        <DocumentManagementDialog
          botId={botId}
          isOpen={isDocumentDialogOpen}
          onClose={() => setIsDocumentDialogOpen(false)}
        />
      )}

      {/* Chatbot Edit Dialog */}
      {isEditDialogOpen && (
        <ChatbotEditDialog
          isVisible={isEditDialogOpen}
          onClose={closeEditDialog}
          chatbot={chatbotDetails}
          onSuccess={handleChatbotUpdate}
        />
      )}

      {/* API Docs Dialog */}
      {isApiDocsOpen && (
        <ApiDocs
          botId={botId}
          open={isApiDocsOpen}
          onOpenChange={setIsApiDocsOpen}
        />
      )}
    </div>
  );
}
