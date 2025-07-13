/**
 * Custom hook for managing chatbot editor functionality
 *
 * Features:
 * - Streaming chat messages with character-by-character display
 * - Tool message display during processing (shows when langgraph_node === "tools")
 * - RAG agent integration for document-based chat
 * - File upload support
 * - Thinking text animations
 * - Chat history persistence
 * - Tab-based interface management
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { getCookie } from "@/helpers/Cookies";
import { useAuth } from "@/hooks/use-auth";
import { fetchChatbotDetail } from "@/services/chatbotService";
import {
  sendStreamingCustomChatbotMessage,
  CustomChatbotStreamPayload,
} from "@/services/customChatbotService";
import {
  sendStreamingRagAgentMessage,
  RagAgentPayload,
} from "@/services/ragAgentService";

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

export const useEditorChatbot = (botId: string, notFounded: boolean) => {
  const router = useRouter();
  const { isLogin, isLoading } = useAuth();

  // Chat states
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Tool message states
  const [toolsMessage, setToolsMessage] = useState("");
  const [toolsMetadata, setToolsMetadata] = useState<any>(null);

  // UI states
  const [modelName, setModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [allowFirstRequest, setAllowFirstRequest] = useState(
    !getCookie("gemini_api_key")
  );

  // RAG states
  const [ragInput, setRagInput] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragStreamingMessage, setRagStreamingMessage] = useState("");
  const [ragMessages, setRagMessages] = useState<StructuredMessage[]>([]);
  const [ragSelectedDocuments, setRagSelectedDocuments] = useState<any[]>([]);
  const [ragReasoning, setRagReasoning] = useState(false);

  // Chatbot data
  const [chatbotData, setChatbotData] = useState<any>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ragMessagesEndRef = useRef<HTMLDivElement>(null);
  const ragInputRef = useRef<HTMLTextAreaElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const geminiApiKey = getCookie("gemini_api_key");
  const modelOptions = [
    { label: "Gemini 2.5 (mới)", value: "gemini-2.5-flash-preview-05-20" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  ];

  // Load chat history
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

  // Save chat history
  useEffect(() => {
    const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, botId]);



  // Thinking text rotation
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

  // Handle streaming chat
  const handleStreamingChat = async (query: string, files: File[]) => {
    const userMessage: StructuredMessage = {
      role: "user",
      content: query,
      type: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingMessage("");
    setToolsMessage("");
    setToolsMetadata(null);

    const payload: CustomChatbotStreamPayload = {
      query,
      bot_id: botId,
      model_name: modelName,
      attachs: files,
    };

    await sendStreamingCustomChatbotMessage(
      payload,
      (message: string) => {
        setStreamingMessage(message);
        setToolsMessage(""); // Clear tools message when regular message starts
      },
      async (finalData: { final_response: string; done: boolean }) => {
        const aiMessage: StructuredMessage = {
          role: "assistant",
          content: finalData.final_response,
          type: "ai",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingMessage("");
        setThinkingText("");
        setToolsMessage("");
        setToolsMetadata(null);
        setLoading(false);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        if (finalData.done) {
          try {
            const data = await fetchChatbotDetail(botId);
            setChatbotData(data);
            setLoading(false);
            toast.success("Cập nhật chatbot thành công!");
          } catch (error) {
            console.error("Error fetching chatbot details:", error);
            toast.error(
              "Cập nhật chatbot thành công nhưng không thể tải thông tin mới"
            );
          } finally {
            setLoading(false);
          }
        }
      },
      (error: string) => {
        setLoading(false);
        setStreamingMessage("");
        setThinkingText("");
        setToolsMessage("");
        setToolsMetadata(null);
        const errorMessage: StructuredMessage = {
          role: "assistant",
          content: `Error: ${error}`,
          type: "ai",
        };
        setMessages((prev) => [...prev, errorMessage]);
      },
      (thinking: string) => {
        setThinkingText(thinking);
      },
      (toolContent: string, metadata: any) => {
        setToolsMessage(toolContent); // Replace, don't accumulate (tools message comes complete)
        setToolsMetadata(metadata);
        setThinkingText(""); // Clear thinking text when tools message appears
      }
    );

    setSelectedFiles([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle RAG streaming chat
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

  // Handle send message
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

    await handleStreamingChat(input, files);
  };

  // Handle RAG send
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
      reasoning: ragReasoning,
    };
    await handleRagStreamingChat(payload);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(selectedFiles);
    }
  };

  // Clear history
  const clearHistory = () => {
    setMessages([]);
  };

  const handleClearConfirm = () => {
    clearHistory();
    setClearModalVisible(false);
  };

  // Handle tab change
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

  return {
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
    allowFirstRequest,
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
    ragReasoning,
    setRagReasoning,

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
  };
};
