"use client";

import React, { useEffect, useState } from "react";
import { Chatbot, fetchChatbots } from "@/services/chatbotService";
import CombatSelection from "@/components/combat/combat-selection";
import { useAICombat } from "@/hooks/use-ai-combat";
import { arenaStyles } from "@/constant/combat-style";
import CombatArena from "@/components/combat/combat-arena";
import { useTranslations } from "next-intl";

export default function AICombatClient() {
  const t = useTranslations("aiCombat");

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = arenaStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [leftChatbot, setLeftChatbot] = useState<string | null>(null);
  const [rightChatbot, setRightChatbot] = useState<string | null>(null);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [agent_ask, setAgentAsk] = useState<"left" | "right">("left");
  const [leftModelName, setLeftModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [rightModelName, setRightModelName] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Use the AI Combat hook
  const {
    messages,
    isConversationActive,
    streamingMessage,
    startConversation,
    stopConversation,
    resetConversation,
  } = useAICombat({
    leftChatbot,
    rightChatbot,
    leftModelName,
    rightModelName,
    agent_ask,
  });

  useEffect(() => {
    const loadChatbots = async () => {
      try {
        setIsLoading(true);
        const data = await fetchChatbots();
        setChatbots(data);
      } catch (error) {
        console.error("Failed to load chatbots:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChatbots();
  }, []);

  const handleStartConversation = async () => {
    setIsConversationStarted(true);
    await startConversation();
  };

  const handleStopConversation = () => {
    stopConversation();
  };

  const handleBackToSelection = () => {
    setIsConversationStarted(false);
    resetConversation();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isConversationStarted) {
    const leftBot = chatbots.find((bot) => bot.id === leftChatbot);
    const rightBot = chatbots.find((bot) => bot.id === rightChatbot);

    return (
      <CombatArena
        leftBot={leftBot}
        rightBot={rightBot}
        leftModelName={leftModelName}
        setLeftModelName={setLeftModelName}
        rightModelName={rightModelName}
        setRightModelName={setRightModelName}
        messages={messages}
        streamingMessage={streamingMessage}
        isConversationActive={isConversationActive}
        agent_ask={agent_ask}
        onBackToSelection={handleBackToSelection}
        onStopConversation={handleStopConversation}
        onContinueConversation={startConversation}
      />
    );
  }

  return (
    <CombatSelection
      chatbots={chatbots}
      leftChatbot={leftChatbot}
      setLeftChatbot={setLeftChatbot}
      rightChatbot={rightChatbot}
      setRightChatbot={setRightChatbot}
      leftModelName={leftModelName}
      setLeftModelName={setLeftModelName}
      rightModelName={rightModelName}
      setRightModelName={setRightModelName}
      agent_ask={agent_ask}
      setAgentAsk={setAgentAsk}
      onStartConversation={handleStartConversation}
    />
  );
} 