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
  Menu,
  Brain,
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
import { useChatbotDetail } from "@/hooks/use-query-chatbots";
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
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";

// ==== BẮT ĐẦU: Nhận params qua props ====
const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const styles = `
  body, html {
    overflow: hidden;
    height: 100vh;
    max-height: 100vh;
  }
  .chat-container {
    background: linear-gradient(to bottom, var(--background), var(--background)/95);
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    position: relative;
  }
  .glass-header {
    background: rgba(var(--card), 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(var(--border), 0.1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .glass-sidebar {
    background: rgba(var(--card), 0.8);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(var(--border), 0.1);
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  }
  .message-bubble {
    transition: all 0.2s ease;
  }
  .message-bubble:hover {
    transform: translateY(-1px);
  }
  .thinking-bubble {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .smooth-scroll {
    scroll-behavior: smooth;
  }
  .chat-empty-state {
    animation: welcomeSlide 0.6s ease-out forwards;
  }
  @keyframes welcomeSlide {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .input-transition {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .message-spacer {
    transition: height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .chat-messages-container {
    scroll-behavior: smooth;
  }
  @media (max-width: 768px) {
    .chat-container {
      height: 100vh;
      height: 100svh; /* Safe viewport height for mobile */
      max-height: 100vh;
      max-height: 100svh;
    }
  }
`;

export default function RagAgentClient({
  params,
  locale,
}: {
  params: { slug: string[] };
  locale: string;
}) {
  const t = useTranslations("ragAgent");
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
  const [reasoning, setReasoning] = useState(false);
  const [allowFirstRequest, setAllowFirstRequest] = useState(
    !getCookie("gemini_api_key")
  );
  const [localConversationId, setLocalConversationId] = useState<
    string | undefined
  >(urlConversationId as string);
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
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
    locale: locale,
  });

  const geminiApiKey = getCookie("gemini_api_key");
  const isMobile = useIsMobile();
  const [zoomAnim, setZoomAnim] = useState(false);
  const hasMessages = messages.length > 0;

  // Prevent body scroll and ensure viewport constraints
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalMaxHeight = document.body.style.maxHeight;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.maxHeight = "100vh";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.maxHeight = originalMaxHeight;
    };
  }, []);

  // Check if user is at the bottom of the scroll container
  const checkIfAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return true;

    const threshold = 50; // 50px threshold for "near bottom"
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    setIsAtBottom(isNearBottom);
    return isNearBottom;
  };

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // Auto-scroll only when user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, streamingMessage]);

  // Initial check on messages change
  useEffect(() => {
    setTimeout(() => {
      checkIfAtBottom();
    }, 100);
  }, [messages.length]);

  // Thinking text rotation effect
  useEffect(() => {
    if (loading && !streamingMessage) {
      let index = 0;
      setThinkingText(t.raw("thinkingTexts")[0]);
      thinkingIntervalRef.current = setInterval(() => {
        index = (index + 1) % t.raw("thinkingTexts").length;
        setThinkingText(t.raw("thinkingTexts")[index]);
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

  // Sử dụng query hook để fetch chatbot details
  const {
    data: chatbotDetailsFromQuery,
    isLoading: isLoadingChatbotFromQuery,
    error: chatbotDetailsError,
  } = useChatbotDetail(urlBotId);

  useEffect(() => {
    if (urlBotId) {
      setBotId(urlBotId as string);
    }
  }, [urlBotId]);

  useEffect(() => {
    if (chatbotDetailsFromQuery) {
      setChatbotDetails(chatbotDetailsFromQuery);
      setLoadingChatbot(false);
    }
    if (chatbotDetailsError) {
      toast.error(t("errorLoadChatbot"));
      setLoadingChatbot(false);
    }
    if (isLoadingChatbotFromQuery) {
      setLoadingChatbot(true);
    }
  }, [
    chatbotDetailsFromQuery,
    chatbotDetailsError,
    isLoadingChatbotFromQuery,
    t,
  ]);

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
      toast.warning(t("loginRequired"));
      router.push("/login");
      return;
    }
    if (!input.trim() && files.length === 0) return;
    // Kiểm tra Gemini API key
    if (!geminiApiKey) {
      if (allowFirstRequest) {
        setAllowFirstRequest(false);
      } else {
        toast.warning(t("notSetupGemini"), {
          action: {
            label: t("setupNow"),
            onClick: () => router.push("/profile"),
          },
        });
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
    // Blur input and trigger zoom animation on mobile
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
      setZoomAnim(true);
      setTimeout(() => setZoomAnim(false), 350); // match animation duration
    }
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
      reasoning: reasoning,
    };
    await handleStreamingChat(payload);
    // Auto scroll will be handled by the effect if user is at bottom
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
        {/* Model selection on mobile */}
        <div className="md:hidden">
          <DropdownMenuItem asChild>
            <div className="px-2 py-1">
              <Brain className="w-4 h-4 mr-2" />
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg">
                  {modelOptions.map((opt) => (
                    <SelectItem value={opt.value} key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </div>
        {/* API Key status on mobile */}
        <div className="md:hidden">
          <DropdownMenuItem asChild>
            <div
              className="flex items-center px-2 py-1 cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              <span
                className={geminiApiKey ? "text-green-600" : "text-yellow-600"}
              >
                {geminiApiKey ? t("geminiKeySet") : t("geminiKeyNotSet")}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </div>
        <DropdownMenuItem onClick={() => setIsDocumentDialogOpen(true)}>
          <FileText className="w-4 h-4 mr-2" /> {t("manageDocuments")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEditDialog}>
          <Edit className="w-4 h-4 mr-2" /> {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsApiDocsOpen(true)}>
          <TerminalSquare className="w-4 h-4 mr-2" /> {t("apiDocs")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={clearMessages}>
          <Trash2 className="w-4 h-4 mr-2" /> {t("clearChat")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() =>
            toast(
              <div>
                <div className="mb-2 font-semibold text-red-700">
                  {t("confirmDeleteAll")}
                </div>
                <div className="text-sm mb-4">{t("deleteAllDesc")}</div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearAllStorage();
                    toast.dismiss();
                  }}
                >
                  {t("confirm")}
                </Button>
              </div>,
              { duration: 9999 }
            )
          }
        >
          <Trash2 className="w-4 h-4 mr-2" /> {t("deleteAllConversations")}
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
    <div
      className={`flex h-screen relative w-full chat-container overflow-hidden ${
        zoomAnim ? "zoom-anim" : ""
      }`}
    >
      <style>{styles}</style>
      <style>{`.zoom-anim > .flex-col { animation: zoomInOut 0.35s cubic-bezier(0.4,0,0.2,1); }
@keyframes zoomInOut {
  0% { transform: scale(1); }
  30% { transform: scale(0.96); }
  100% { transform: scale(1); }
}`}</style>
      {loadingChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="ml-4 text-lg text-foreground">
            {t("loadingText")}
          </span>
        </div>
      )}
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-30 h-full glass-sidebar transition-all duration-300 overflow-hidden ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } ${
          isMobileConversationOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={conversationId}
          isSidebarCollapsed={isSidebarCollapsed}
          onSelectConversation={(id) => {
            selectConversation(id);
            setIsMobileConversationOpen(false);
          }}
          onDeleteConversation={deleteConversation}
          onCreateConversation={createConversation}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Conversation Toggle Button */}
      <button
        onClick={() => setIsMobileConversationOpen(!isMobileConversationOpen)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isMobileConversationOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileConversationOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex-none glass-header py-2 md:py-4">
          <div className="flex justify-between items-center px-3 md:px-6">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/assistants")}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors duration-200 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Avatar className="bg-primary/10 w-7 h-7 md:w-10 md:h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200 flex-shrink-0">
                <AvatarFallback className="text-primary">
                  <Bot className="w-3 h-3 md:w-5 md:h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="fade-in min-w-0 flex-1">
                {loadingChatbot ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <span className="text-sm md:text-base text-muted-foreground">
                      {t("loading")}
                    </span>
                  </div>
                ) : (
                  <>
                    <h1 className="text-sm md:text-xl font-semibold text-card-foreground truncate">
                      {chatbotDetails?.name || t("assistantDefaultName")}
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 hidden md:block">
                      {chatbotDetails?.description}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {/* Login status - smaller on mobile */}
              {!isLogin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs md:text-xs transition-colors duration-200 px-1 py-0.5 md:px-2 md:py-1"
                        onClick={() => router.push("/login")}
                      >
                        {t("notLoggedIn")}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground">
                      {t("loginToUse")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* API Key badge - hidden on mobile */}
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    className={`hidden md:flex ml-2 text-xs transition-colors duration-200 ${
                      geminiApiKey
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    } cursor-pointer`}
                  >
                    <KeyRound className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {geminiApiKey ? t("geminiKeySet") : t("geminiKeyNotSet")}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="bg-popover text-popover-foreground border-border shadow-lg">
                  {geminiApiKey ? (
                    t("geminiKeyTooltipSet")
                  ) : (
                    <span>
                      {t("geminiKeyTooltipNotSet")}
                      <br />
                      <Button
                        size="sm"
                        variant="link"
                        className="text-primary hover:text-primary/80 transition-colors duration-200"
                        onClick={() => router.push("/profile")}
                      >
                        {t("setupNow")}
                      </Button>
                    </span>
                  )}
                </PopoverContent>
              </Popover>

              {/* Dropdown menu */}
              {headerDropdown}

              {/* Model Select - hidden on mobile */}
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="hidden md:flex w-32 md:w-44 bg-background border-border hover:border-primary/50 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg">
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

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {hasMessages ? (
            /* Chat Messages - Normal Layout */
            <>
              <div
                className="flex-1 overflow-y-auto smooth-scroll"
                ref={chatContainerRef}
                onScroll={handleScroll}
              >
                <div className="pb-6">
                  <ChatMessages
                    messages={messages}
                    streamingMessage={streamingMessage}
                    selectedDocuments={selectedDocuments}
                    loadingChatbot={loadingChatbot}
                    chatbotDetails={chatbotDetails}
                    messagesEndRef={
                      messagesEndRef as React.RefObject<HTMLDivElement>
                    }
                    onRecommendationClick={(recommendation: string) =>
                      setInput(recommendation)
                    }
                    thinkingMessage={reasoning ? thinkingText : ""}
                    renderChatbotDetails={true}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Chat Input - Fixed at bottom */}
              <div className="flex-none border-t border-border bg-background/95 backdrop-blur-sm">
                <div className="px-3 md:px-6">
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
                    reasoning={reasoning}
                    onReasoningChange={setReasoning}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty State - Centered Input */
            <div className="h-full flex flex-col items-center justify-center px-3 md:px-6 chat-empty-state overflow-hidden">
              <div className="w-full max-w-4xl">
                {/* Welcome Message */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <Avatar className="bg-primary/10 w-16 h-16 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarFallback className="text-primary">
                        <Bot className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">
                    {chatbotDetails?.name || t("assistantDefaultName")}
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {chatbotDetails?.description || t("startConversation")}
                  </p>
                </div>

                {/* Centered Chat Input */}
                <div className="w-full input-transition">
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
                    reasoning={reasoning}
                    onReasoningChange={setReasoning}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
