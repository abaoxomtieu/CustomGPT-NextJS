"use client";
import React, { useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Sword, Flame, Zap, StopCircle } from "lucide-react";
import CombatSelect from "./combat-select";
import { modelOptions } from "./combat-selection";
import { cn } from "@/lib/utils";
import CombatChatMessages from "./combat-chat-message";
import { StructuredMessage } from "./combat-message";

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
}

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{
        background:
          "linear-gradient(120deg, #18112b 0%, #2a183b 100%)", // combatBackgrounds.arena
      }}
    >
      {/* Arena Background Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        {/* Lightning effects */}
        <Zap className="absolute top-10 left-10 w-8 h-8 animate-pulse" />
        <Zap className="absolute top-20 right-20 w-8 h-8 animate-pulse delay-300" />
        <Zap className="absolute bottom-20 left-1/4 w-8 h-8 animate-pulse delay-700" />
        <Zap className="absolute bottom-10 right-1/3 w-8 h-8 animate-pulse delay-1000" />

        {/* Swords */}
        <Sword className="absolute top-1/4 left-5 w-10 h-10 animate-bounce delay-500" />
        <Sword className="absolute top-1/3 right-5 w-10 h-10 animate-bounce delay-1500 rotate-45" />

        {/* Fire effects */}
        <Flame className="absolute bottom-1/4 left-10 w-8 h-8 animate-pulse delay-200" />
        <Flame className="absolute bottom-1/3 right-10 w-8 h-8 animate-pulse delay-800" />
      </div>

      {/* Animated arena border */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          border: "4px solid",
          borderImage:
            "linear-gradient(90deg,#fde047 0%,#f43f5e 50%,#a21caf 100%) 1",
          opacity: 0.3,
        }}
      />

      {/* Header */}
      <div className="bg-black/80 backdrop-blur-lg shadow-2xl border-b-4"
        style={{
          borderImage:
            "linear-gradient(90deg,#f43f5e 0%,#fde047 100%) 1",
        }}>
        {/* Header glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-yellow-500/20 animate-pulse pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Back button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToSelection}
              className="text-yellow-400 hover:text-red-400 border border-yellow-400/30 hover:border-red-400/50 bg-black/50 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>

            {/* Fighters */}
            <div className="flex items-center gap-12 flex-wrap">
              {/* Left Fighter */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg animate-pulse pointer-events-none"></div>
                <div className="flex items-center justify-center mb-2 z-10 relative">
                  <Bot className="text-cyan-300 w-7 h-7 mr-2 animate-bounce" />
                  <span className="text-cyan-300 font-bold shadow-lg">{leftBot?.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 z-10 relative">
                  <Badge className="px-4 py-1 text-sm font-bold border-2 border-cyan-400 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
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
              <div className="text-6xl font-bold text-yellow-400 animate-pulse shadow-2xl relative">
                <span className="absolute inset-0 text-red-500 animate-ping opacity-50 pointer-events-none select-none">
                  <Sword className="w-14 h-14" />
                </span>
                VS
              </div>
              {/* Right Fighter */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-lg blur-lg animate-pulse delay-500 pointer-events-none"></div>
                <div className="flex items-center justify-center mb-2 z-10 relative">
                  <Bot className="text-red-300 w-7 h-7 mr-2 animate-bounce delay-300" />
                  <span className="text-red-300 font-bold shadow-lg">{rightBot?.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 z-10 relative">
                  <Badge className="px-4 py-1 text-sm font-bold border-2 border-red-400 bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg">
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

            {/* Stop Button */}
            <Button
              variant="destructive"
              disabled={!isConversationActive}
              onClick={onStopConversation}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-2 border-red-400 shadow-xl font-bold text-lg px-6 py-2 h-auto animate-pulse"
            >
              <StopCircle className="w-5 h-5 mr-2" />
              Stop Conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden relative">
        {/* Chat area background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none"></div>
        <CombatChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          agent_ask={agent_ask}
        />
      </div>
    </div>
  );
};

export default CombatArena;
