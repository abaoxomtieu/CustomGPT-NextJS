"use client";
import React, { useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bot,
  Sword,
  Flame,
  Zap,
  StopCircle,
  Home,
  PlayCircle,
} from "lucide-react";
import CombatSelect from "./combat-select";
import { modelOptions } from "./combat-selection";
import { cn } from "@/lib/utils";
import CombatChatMessages from "./combat-chat-message";
import { StructuredMessage } from "./combat-message";
import { useRouter } from "next/navigation";

interface CombatArenaProps {
  leftBot: { name: string } | undefined;
  rightBot: { name: string } | undefined;
  leftModelName: string;
  setLeftModelName: (model: string) => void;
  rightModelName: string;
  setRightModelName: (model: string) => void;
  messages: StructuredMessage[];
  streamingMessage: string;
  isConversationActive: boolean;
  agent_ask: "left" | "right";
  onBackToSelection: () => void;
  onStopConversation: () => void;
  onContinueConversation: () => void;
}

const MAX_CONVERSATIONS = 25;

const CombatArena: React.FC<CombatArenaProps> = ({
  leftBot,
  rightBot,
  leftModelName,
  setLeftModelName,
  rightModelName,
  setRightModelName,
  messages,
  streamingMessage,
  isConversationActive,
  agent_ask,
  onBackToSelection,
  onStopConversation,
  onContinueConversation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Memoize background styles to prevent unnecessary re-renders
  const backgroundStyles = useMemo(
    () => ({
      background: "linear-gradient(120deg, #18112b 0%, #2a183b 100%)",
    }),
    []
  );

  const borderStyles = useMemo(
    () => ({
      border: "4px solid",
      borderImage:
        "linear-gradient(90deg,#fde047 0%,#f43f5e 50%,#a21caf 100%) 1",
      opacity: 0.3,
    }),
    []
  );

  const headerBorderStyles = useMemo(
    () => ({
      borderImage: "linear-gradient(90deg,#f43f5e 0%,#fde047 100%) 1",
    }),
    []
  );

  // Calculate current conversation count
  const currentConversationCount = messages.length / 2; // Each conversation has 2 messages (one from each bot)
  const canContinue = currentConversationCount >= MAX_CONVERSATIONS;

  const handleBackToHome = () => {
    if (isConversationActive) {
      onStopConversation();
    }
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col relative" style={backgroundStyles}>
      {/* Arena Background Effects - Reduced number of effects */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        {/* Reduced number of effects and simplified animations */}
        <Zap className="absolute top-10 left-10 w-6 h-6 animate-pulse" />
        <Sword className="absolute top-1/4 right-5 w-8 h-8 animate-bounce delay-500" />
        <Flame className="absolute bottom-1/4 left-10 w-6 h-6 animate-pulse delay-200" />
      </div>

      {/* Animated arena border */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={borderStyles}
      />

      {/* Header */}
      <div
        className="bg-black/80 backdrop-blur-lg shadow-xl border-b-4"
        style={headerBorderStyles}
      >
        {/* Header glow effect - Simplified */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-yellow-500/10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 p-3 md:p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            {/* Back and Home buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToSelection}
                className="text-yellow-400 hover:text-red-400 border border-yellow-400/30 hover:border-red-400/50 bg-black/50 font-bold text-xs md:text-sm"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToHome}
                className="text-yellow-400 hover:text-red-400 border border-yellow-400/30 hover:border-red-400/50 bg-black/50 font-bold text-xs md:text-sm"
              >
                <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Home
              </Button>
            </div>

            {/* Fighters */}
            <div className="flex items-center gap-4 md:gap-12 flex-wrap justify-center">
              {/* Left Fighter */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-md pointer-events-none"></div>
                <div className="flex items-center justify-center mb-1 md:mb-2 z-10 relative">
                  <Bot className="text-cyan-300 w-5 h-5 md:w-7 md:h-7 mr-1 md:mr-2" />
                  <span className="text-cyan-300 font-bold text-sm md:text-base">
                    {leftBot?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 z-10 relative">
                  <Badge className="px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-bold border border-cyan-400 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                    Left AI
                  </Badge>
                  <CombatSelect
                    value={leftModelName}
                    onChange={setLeftModelName}
                    options={modelOptions}
                    placeholder="Select a model"
                    side="left"
                  />
                </div>
              </div>

              {/* VS */}
              <div className="text-3xl md:text-6xl font-bold text-yellow-400 relative">
                <span className="absolute inset-0 text-red-500 opacity-50 pointer-events-none select-none">
                  <Sword className="w-8 h-8 md:w-14 md:h-14" />
                </span>
                VS
              </div>

              {/* Right Fighter */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-md pointer-events-none"></div>
                <div className="flex items-center justify-center mb-1 md:mb-2 z-10 relative">
                  <Bot className="text-red-300 w-5 h-5 md:w-7 md:h-7 mr-1 md:mr-2" />
                  <span className="text-red-300 font-bold text-sm md:text-base">
                    {rightBot?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 z-10 relative">
                  <Badge className="px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-bold border border-red-400 bg-gradient-to-r from-red-600 to-pink-500 text-white">
                    Right AI
                  </Badge>
                  <CombatSelect
                    value={rightModelName}
                    onChange={setRightModelName}
                    options={modelOptions}
                    placeholder="Select a model"
                    side="right"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {canContinue && !isConversationActive && (
                <Button
                  variant="default"
                  onClick={onContinueConversation}
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 border border-green-400 shadow-lg font-bold text-sm md:text-lg px-3 md:px-6 py-1 md:py-2 h-auto"
                >
                  <PlayCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Continue
                </Button>
              )}
              <Button
                variant="destructive"
                disabled={!isConversationActive}
                onClick={onStopConversation}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border border-red-400 shadow-lg font-bold text-sm md:text-lg px-3 md:px-6 py-1 md:py-2 h-auto"
              >
                <StopCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Stop
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden relative">
        {/* Simplified chat area background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 pointer-events-none"></div>
        <CombatChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          agent_ask={agent_ask}
        />
        {/* Conversation Limit Warning */}
        {canContinue && !isConversationActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/30 text-yellow-400 text-sm md:text-base">
            Reached maximum {MAX_CONVERSATIONS} conversations. Click Continue to
            start a new round.
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatArena;
