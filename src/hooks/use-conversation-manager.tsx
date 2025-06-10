import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const CHAT_HISTORY_KEY = "rag_agent_chat_history";
const CONVERSATION_LIST_KEY = "rag_agent_conversation_list";

export interface ConversationMeta {
  conversation_id: string;
  name: string;
  created_at: number;
}

export interface StructuredMessage {
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
}

interface UseConversationManagerProps {
  botId: string;
  urlConversationId?: string;
  navigate: (path: string, options?: any) => void;
}

export const useConversationManager = ({
  botId,
  urlConversationId,
  navigate,
}: UseConversationManagerProps) => {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const getConversationListKey = useCallback(
    () => `${CONVERSATION_LIST_KEY}_${botId}`,
    [botId]
  );

  const getChatHistoryKey = useCallback(
    (convId: string) => `${CHAT_HISTORY_KEY}_${botId}_${convId}`,
    [botId]
  );

  const loadConversations = useCallback(() => {
    if (!botId) return [];

    const listKey = getConversationListKey();
    const saved = localStorage.getItem(listKey);
    return saved ? JSON.parse(saved) : [];
  }, [botId, getConversationListKey]);

  const saveConversations = useCallback(
    (convs: ConversationMeta[]) => {
      if (!botId) return;

      const listKey = getConversationListKey();
      if (convs.length > 0) {
        localStorage.setItem(listKey, JSON.stringify(convs));
      } else {
        localStorage.removeItem(listKey);
      }
    },
    [botId, getConversationListKey]
  );

  const loadMessages = useCallback(
    (convId: string) => {
      if (!botId || !convId) return [];

      const storageKey = getChatHistoryKey(convId);
      const saved = localStorage.getItem(storageKey);

      try {
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error("Error loading messages:", error);
        return [];
      }
    },
    [botId, getChatHistoryKey]
  );

  const saveMessages = useCallback(
    (convId: string, msgs: StructuredMessage[]) => {
      if (!botId || !convId) return;

      const storageKey = getChatHistoryKey(convId);
      if (msgs.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(msgs));
      } else {
        localStorage.removeItem(storageKey);
      }
    },
    [botId, getChatHistoryKey]
  );

  const createConversation = useCallback(() => {
    const newId = uuidv4();
    const newMeta: ConversationMeta = {
      conversation_id: newId,
      name: `Conversation ${conversations.length + 1}`,
      created_at: Date.now(),
    };

    setConversations((prev) => {
      const updatedConversations = [newMeta, ...prev];
      saveConversations(updatedConversations);
      return updatedConversations;
    });
    setConversationId(newId);
    setMessages([]);

    // Sử dụng window.history thay vì navigate để tránh reload
    const newUrl = `/rag-agent/${botId}/${newId}`;
    window.history.pushState(null, '', newUrl);
    
    // Dispatch popstate event để Next.js router biết về sự thay đổi
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    
    return newId;
  }, [botId, conversations.length, saveConversations, navigate]);

  const deleteConversation = useCallback(
    (id: string) => {
      const storageKey = getChatHistoryKey(id);
      localStorage.removeItem(storageKey);

      const updatedConversations = conversations.filter(
        (c) => c.conversation_id !== id
      );
      setConversations(updatedConversations);
      saveConversations(updatedConversations);

      if (conversationId === id) {
        if (updatedConversations.length > 0) {
          const nextConv = updatedConversations[0];
          selectConversation(nextConv.conversation_id);
        } else {
          setConversationId("");
          setMessages([]);
          // Sử dụng navigate với shallow routing để tránh reload
          const newUrl = `/rag-agent/${botId}`;
          navigate(newUrl, { shallow: true });
        }
      }
    },
    [
      conversations,
      conversationId,
      botId,
      getChatHistoryKey,
      saveConversations,
    ]
  );

  const selectConversation = useCallback(
    (id: string) => {
      if (id === conversationId) return;

      if (conversationId && messages.length > 0) {
        saveMessages(conversationId, messages);

        const currentConv = conversations.find(
          (c) => c.conversation_id === conversationId
        );
        if (currentConv) {
          const savedConversations = loadConversations();
          const isAlreadySaved = savedConversations.some(
            (c: ConversationMeta) => c.conversation_id === conversationId
          );

          if (!isAlreadySaved) {
            const updatedConversations = [currentConv, ...savedConversations];
            saveConversations(updatedConversations);
          }
        }
      }

      setConversationId(id);
      const newMessages = loadMessages(id);
      setMessages(newMessages);

      // Sử dụng window.history để tránh reload
      const newUrl = `/rag-agent/${botId}/${id}`;
      window.history.replaceState(null, '', newUrl);
    },
    [
      conversationId,
      messages,
      conversations,
      botId,
      navigate,
      saveMessages,
      loadMessages,
      loadConversations,
      saveConversations,
    ]
  );

  const addMessage = useCallback(
    (message: StructuredMessage) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];

        if (conversationId) {
          saveMessages(conversationId, newMessages);

          if (prev.length === 0) {
            const currentConv = conversations.find(
              (c) => c.conversation_id === conversationId
            );
            if (currentConv) {
              const savedConversations = loadConversations();
              const isAlreadySaved = savedConversations.some(
                (c: ConversationMeta) => c.conversation_id === conversationId
              );

              if (!isAlreadySaved) {
                const updatedConversations = [
                  currentConv,
                  ...savedConversations,
                ];
                saveConversations(updatedConversations);
              }
            }
          }
        }

        return newMessages;
      });
    },
    [
      conversationId,
      conversations,
      saveMessages,
      loadConversations,
      saveConversations,
    ]
  );

  const setMessagesAndSave = useCallback(
    (newMessages: StructuredMessage[]) => {
      setMessages(newMessages);

      if (conversationId) {
        saveMessages(conversationId, newMessages);

        if (newMessages.length > 0) {
          const currentConv = conversations.find(
            (c) => c.conversation_id === conversationId
          );
          if (currentConv) {
            const savedConversations = loadConversations();
            const isAlreadySaved = savedConversations.some(
              (c: ConversationMeta) => c.conversation_id === conversationId
            );

            if (!isAlreadySaved) {
              const updatedConversations = [currentConv, ...savedConversations];
              saveConversations(updatedConversations);
            }
          }
        }
      }
    },
    [
      conversationId,
      conversations,
      saveMessages,
      loadConversations,
      saveConversations,
    ]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (conversationId) {
      localStorage.removeItem(getChatHistoryKey(conversationId));
    }
  }, [conversationId, getChatHistoryKey]);

  useEffect(() => {
    if (!botId || isInitialized) return;
    
    const savedConversations = loadConversations();
    setConversations(savedConversations);

    if (urlConversationId) {
      const existingConv = savedConversations.find(
        (c: ConversationMeta) => c.conversation_id === urlConversationId
      );

      if (existingConv) {
        setConversationId(urlConversationId);
        const msgs = loadMessages(urlConversationId);
        setMessages(msgs);
      } else {
        const tempConv: ConversationMeta = {
          conversation_id: urlConversationId,
          name: `Conversation ${savedConversations.length + 1}`,
          created_at: Date.now(),
        };

        setConversations((prev) => [tempConv, ...prev]);
        setConversationId(urlConversationId);
        setMessages([]);
      }
    } else if (savedConversations.length > 0) {
      const firstConv = savedConversations[0];
      setConversationId(firstConv.conversation_id);
      const msgs = loadMessages(firstConv.conversation_id);
      setMessages(msgs);
      // Chỉ navigate nếu URL hiện tại không khớp
      const currentPath = window.location.pathname;
      const expectedPath = `/rag-agent/${botId}/${firstConv.conversation_id}`;
      if (currentPath !== expectedPath) {
        navigate(expectedPath, { shallow: true });
      }
    }

    setIsInitialized(true);
  }, [botId, urlConversationId]); // Loại bỏ isInitialized khỏi dependency array

  // Add this function before the return statement
  const clearAllStorage = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("rag_agent_")) {
        localStorage.removeItem(key);
      }
    });
    setConversations([]);
    setConversationId("");
    setMessages([]);
  }, []);

  return {
    conversations,
    conversationId,
    messages,
    isInitialized,
    createConversation,
    deleteConversation,
    selectConversation,
    addMessage,
    setMessages: setMessagesAndSave,
    clearMessages,
    clearAllStorage,
  };
};
