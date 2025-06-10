"use client";

import React, { useState } from "react";
import CombatSelection from "./combat-selection";
import CombatArena from "./combat-arena";
import { StructuredMessage } from "./combat-message";

const CombatContainer: React.FC = () => {
  const [leftChatbot, setLeftChatbot] = useState<string | null>(null);
  const [rightChatbot, setRightChatbot] = useState<string | null>(null);
  const [leftModelName, setLeftModelName] = useState("gemini-2.5-flash-preview-05-20");
  const [rightModelName, setRightModelName] = useState("gemini-2.5-flash-preview-05-20");
  const [agent_ask, setAgentAsk] = useState<"left" | "right">("left");
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isConversationActive, setIsConversationActive] = useState(false);

  // Mock data for chatbots
  const chatbots = [
    { name: "AI Assistant 1", id: "assistant-1" },
    { name: "AI Assistant 2", id: "assistant-2" },
    { name: "AI Assistant 3", id: "assistant-3" },
  ];

  const handleStartConversation = () => {
    setIsConversationStarted(true);
    setIsConversationActive(true);
  };

  const handleStopConversation = () => {
    setIsConversationActive(false);
  };

  if (isConversationStarted) {
    return (
      <CombatArena
        leftBot={leftChatbot ? { name: leftChatbot } : undefined}
        rightBot={rightChatbot ? { name: rightChatbot } : undefined}
        leftModelName={leftModelName}
        setLeftModelName={setLeftModelName}
        rightModelName={rightModelName}
        setRightModelName={setRightModelName}
        agent_ask={agent_ask}
        messages={messages}
        streamingMessage={streamingMessage}
        isConversationActive={isConversationActive}
        onBackToSelection={() => setIsConversationStarted(false)}
        onStopConversation={handleStopConversation}
        onContinueConversation={handleStartConversation}
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
};

export default CombatContainer; 