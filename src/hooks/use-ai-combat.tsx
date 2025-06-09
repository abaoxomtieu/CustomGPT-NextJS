"use client";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  sendStreamingRagAgentMessage,
  RagAgentPayload,
} from "../services/ragAgentService";
import { toast } from "sonner";

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
  type: string;
  displayContent: string;
}

interface UseAICombatProps {
  leftChatbot: string | null;
  rightChatbot: string | null;
  leftModelName: string;
  rightModelName: string;
  agent_ask: "left" | "right";
}

export const useAICombat = ({
  leftChatbot,
  rightChatbot,
  leftModelName,
  rightModelName,
  agent_ask,
}: UseAICombatProps) => {
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const messagesRef = useRef<StructuredMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isConversationActiveRef = useRef<boolean>(true);
  const timeoutIdsRef = useRef<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [leftConversationId, setLeftConversationId] = useState<string>("");
  const [rightConversationId, setRightConversationId] = useState<string>("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);

  const updateConversationActive = (active: boolean) => {
    setIsConversationActive(active);
    isConversationActiveRef.current = active;
  };

  const addMessage = (message: StructuredMessage) => {
    const updatedMessages = [...messagesRef.current, message];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    return updatedMessages;
  };

  const handleAIResponse = async (
    botId: string,
    conversationId: string,
    isLeft: boolean
  ) => {
    if (!isConversationActiveRef.current || !leftChatbot || !rightChatbot) {
      return;
    }

    const currentMessages = messagesRef.current;
    const lastMessage = currentMessages[currentMessages.length - 1];
    if (!lastMessage) {
      return;
    }

    const payload: RagAgentPayload = {
      query:
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : lastMessage.displayContent,
      bot_id: botId,
      conversation_id: conversationId,
      model_name: isLeft ? leftModelName : rightModelName,
      attachs: [],
    };

    try {
      setStreamingMessage("");
      setSelectedDocuments([]);
      setIsProcessing(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      await sendStreamingRagAgentMessage(
        payload,
        (message: string) => {
          if (
            isConversationActiveRef.current &&
            !abortController.signal.aborted
          ) {
            setStreamingMessage(message);
          }
        },
        async (finalData: any) => {
          if (
            !isConversationActiveRef.current ||
            abortController.signal.aborted
          ) {
            setStreamingMessage("");
            setIsProcessing(false);
            return;
          }

          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc: any) =>
                doc.metadata &&
                doc.metadata.public_url &&
                doc.metadata.type === "image"
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
                imageDocuments.forEach((doc: any) => {
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
              role: isLeft ? "assistant" : "user",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: isLeft ? "ai" : "human",
              displayContent: responseContent,
            };

            addMessage(aiMessage);
            setSelectedDocuments(finalData.selected_documents || []);
            setIsProcessing(false);

            if (
              isConversationActiveRef.current &&
              !abortController.signal.aborted
            ) {
              const nextBotId = isLeft ? rightChatbot : leftChatbot;
              const nextConversationId = isLeft
                ? rightConversationId
                : leftConversationId;

              const nextPayload: RagAgentPayload = {
                query: responseContent,
                bot_id: nextBotId,
                conversation_id: nextConversationId,
                model_name: !isLeft ? leftModelName : rightModelName,
                attachs: [],
              };

              try {
                setStreamingMessage("");
                setSelectedDocuments([]);
                setIsProcessing(true);

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    if (isConversationActiveRef.current) {
                      setStreamingMessage(message);
                    }
                  },
                  async (nextFinalData: any) => {
                    if (!isConversationActiveRef.current) {
                      setStreamingMessage("");
                      setIsProcessing(false);
                      return;
                    }

                    setStreamingMessage("");
                    if (
                      typeof nextFinalData === "object" &&
                      "final_response" in nextFinalData
                    ) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (
                        nextFinalData.selected_documents || []
                      ).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({
                          type: "text",
                          text: nextResponseContent,
                        });
                      }

                      if (nextImageDocuments.length > 0) {
                        if (
                          nextResponseContent.includes("[Image]") ||
                          nextResponseContent.includes("[image]")
                        ) {
                          nextImageDocuments.forEach((doc: any) => {
                            nextResponseContent = nextResponseContent.replace(
                              /\[Image\]/i,
                              `![image]\n(${doc.metadata.public_url})`
                            );

                            nextContentItems.push({
                              type: "image",
                              source_type: "url",
                              url: doc.metadata.public_url,
                            });
                          });
                        }
                      }

                      const nextAiMessage: StructuredMessage = {
                        role: !isLeft ? "assistant" : "user",
                        content:
                          nextContentItems.length > 1
                            ? nextContentItems
                            : nextContentForApi,
                        type: !isLeft ? "ai" : "human",
                        displayContent: nextResponseContent,
                      };

                      addMessage(nextAiMessage);
                      setSelectedDocuments(
                        nextFinalData.selected_documents || []
                      );
                      setIsProcessing(false);

                      if (isConversationActiveRef.current) {
                        const timeoutId = setTimeout(async () => {
                          if (isConversationActiveRef.current) {
                            await handleAIResponse(
                              botId,
                              conversationId,
                              isLeft
                            );
                          }
                        }, 3000);
                        timeoutIdsRef.current.push(timeoutId);
                      }
                    }
                  },
                  (error: string) => {
                    toast.error(
                      `Error from ${!isLeft ? "Left" : "Right"} AI: ${error}`
                    );
                    setIsProcessing(false);
                    setStreamingMessage("");
                  },
                  abortController.signal
                );
              } catch (error) {
                setIsProcessing(false);
                setStreamingMessage("");
              }
            }
          }
        },
        (error: string) => {
          toast.error(`Error from ${isLeft ? "Left" : "Right"} AI: ${error}`);
          setIsProcessing(false);
          setStreamingMessage("");
        },
        abortController.signal
      );
    } catch (error) {
      setIsProcessing(false);
      setStreamingMessage("");
    }
  };

  const startConversation = async () => {
    if (!leftChatbot || !rightChatbot) {
      return;
    }

    const newLeftConversationId = uuidv4();
    const newRightConversationId = uuidv4();
    setLeftConversationId(newLeftConversationId);
    setRightConversationId(newRightConversationId);

    setIsProcessing(true);
    updateConversationActive(true);

    const firstBotId = agent_ask === "left" ? leftChatbot : rightChatbot;
    const firstConversationId =
      agent_ask === "left" ? newLeftConversationId : newRightConversationId;

    // Create the initial message
    const initialMessage: StructuredMessage = {
      role: agent_ask === "left" ? "assistant" : "user",
      content: "Mày là ai",
      type: agent_ask === "left" ? "ai" : "human",
      displayContent: "Mày là ai",
    };

    // Add the initial message to the conversation
    addMessage(initialMessage);

    // Create the initial payload
    const initialPayload: RagAgentPayload = {
      query: "Mày là ai",
      bot_id: firstBotId,
      conversation_id: firstConversationId,
      model_name: agent_ask === "left" ? leftModelName : rightModelName,
      attachs: [],
    };

    try {
      setStreamingMessage("");
      setSelectedDocuments([]);
      setIsProcessing(true);

      await sendStreamingRagAgentMessage(
        initialPayload,
        (message: string) => {
          if (isConversationActiveRef.current) {
            setStreamingMessage(message);
          }
        },
        async (finalData: any) => {
          if (!isConversationActiveRef.current) {
            setStreamingMessage("");
            setIsProcessing(false);
            return;
          }

          setStreamingMessage("");
          if (typeof finalData === "object" && "final_response" in finalData) {
            let responseContent = finalData.final_response;
            let contentForApi = responseContent;

            const imageDocuments = (finalData.selected_documents || []).filter(
              (doc: any) =>
                doc.metadata &&
                doc.metadata.public_url &&
                doc.metadata.type === "image"
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
                imageDocuments.forEach((doc: any) => {
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
              role: agent_ask === "left" ? "assistant" : "user",
              content: contentItems.length > 1 ? contentItems : contentForApi,
              type: agent_ask === "left" ? "ai" : "human",
              displayContent: responseContent,
            };

            addMessage(aiMessage);
            setSelectedDocuments(finalData.selected_documents || []);
            setIsProcessing(false);

            if (
              isConversationActiveRef.current &&
              !abortControllerRef.current?.signal.aborted
            ) {
              const nextBotId =
                agent_ask === "left" ? rightChatbot : leftChatbot;
              const nextConversationId =
                agent_ask === "left"
                  ? newRightConversationId
                  : newLeftConversationId;

              // Create the next message payload
              const nextPayload: RagAgentPayload = {
                query: responseContent,
                bot_id: nextBotId,
                conversation_id: nextConversationId,
                model_name:
                  agent_ask === "left" ? rightModelName : leftModelName,
                attachs: [],
              };

              try {
                setStreamingMessage("");
                setSelectedDocuments([]);
                setIsProcessing(true);

                await sendStreamingRagAgentMessage(
                  nextPayload,
                  (message: string) => {
                    if (isConversationActiveRef.current) {
                      setStreamingMessage(message);
                    }
                  },
                  async (nextFinalData: any) => {
                    if (!isConversationActiveRef.current) {
                      setStreamingMessage("");
                      setIsProcessing(false);
                      return;
                    }

                    setStreamingMessage("");
                    if (
                      typeof nextFinalData === "object" &&
                      "final_response" in nextFinalData
                    ) {
                      let nextResponseContent = nextFinalData.final_response;
                      let nextContentForApi = nextResponseContent;

                      const nextImageDocuments = (
                        nextFinalData.selected_documents || []
                      ).filter(
                        (doc: any) =>
                          doc.metadata &&
                          doc.metadata.public_url &&
                          doc.metadata.type === "image"
                      );

                      const nextContentItems = [];

                      if (nextResponseContent) {
                        nextContentItems.push({
                          type: "text",
                          text: nextResponseContent,
                        });
                      }

                      if (nextImageDocuments.length > 0) {
                        if (
                          nextResponseContent.includes("[Image]") ||
                          nextResponseContent.includes("[image]")
                        ) {
                          nextImageDocuments.forEach((doc: any) => {
                            nextResponseContent = nextResponseContent.replace(
                              /\[Image\]/i,
                              `![image]\n(${doc.metadata.public_url})`
                            );

                            nextContentItems.push({
                              type: "image",
                              source_type: "url",
                              url: doc.metadata.public_url,
                            });
                          });
                        }
                      }

                      const nextAiMessage: StructuredMessage = {
                        role: agent_ask === "left" ? "user" : "assistant",
                        content:
                          nextContentItems.length > 1
                            ? nextContentItems
                            : nextContentForApi,
                        type: agent_ask === "left" ? "human" : "ai",
                        displayContent: nextResponseContent,
                      };

                      addMessage(nextAiMessage);
                      setSelectedDocuments(
                        nextFinalData.selected_documents || []
                      );
                      setIsProcessing(false);

                      if (isConversationActiveRef.current) {
                        const timeoutId = setTimeout(async () => {
                          if (isConversationActiveRef.current) {
                            await handleAIResponse(
                              firstBotId,
                              firstConversationId,
                              agent_ask === "left"
                            );
                          }
                        }, 3000);
                        timeoutIdsRef.current.push(timeoutId);
                      }
                    }
                  },
                  (error: string) => {
                    toast.error(
                      `Error from ${
                        agent_ask === "left" ? "Right" : "Left"
                      } AI: ${error}`
                    );
                    setIsProcessing(false);
                    setStreamingMessage("");
                  },
                  abortControllerRef.current?.signal
                );
              } catch (error) {
                setIsProcessing(false);
                setStreamingMessage("");
              }
            }
          }
        },
        (error: string) => {
          toast.error(
            `Error from ${agent_ask === "left" ? "Left" : "Right"} AI: ${error}`
          );
          setIsProcessing(false);
          setStreamingMessage("");
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      toast.error("Failed to start conversation");
      setIsProcessing(false);
      setStreamingMessage("");
    }
  };

  const stopConversation = () => {
    updateConversationActive(false);
    setIsProcessing(false);
    setStreamingMessage("");

    // Clear all timeouts
    timeoutIdsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    toast.success("Conversation stopped successfully");
  };

  const resetConversation = () => {
    setMessages([]);
    messagesRef.current = [];
    setIsProcessing(false);
    updateConversationActive(true);
    setStreamingMessage("");
    setSelectedDocuments([]);
    setLeftConversationId("");
    setRightConversationId("");

    // Clear all timeouts
    timeoutIdsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    // Reset abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    // States
    messages,
    isProcessing,
    isConversationActive,
    streamingMessage,
    selectedDocuments,
    leftConversationId,
    rightConversationId,
    messagesRef,

    // Actions
    startConversation,
    stopConversation,
    resetConversation,
    handleAIResponse,
    addMessage,
  };
};
