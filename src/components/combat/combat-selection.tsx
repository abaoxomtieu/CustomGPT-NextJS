"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Sword,
  Shield,
  Zap,
  Trophy,
  Flame,
  Bomb,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CombatSelect from "./combat-select";

export const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

interface CombatSelectionProps {
  chatbots: { name: string; id: string }[];
  leftChatbot: string | null;
  setLeftChatbot: (id: string | null) => void;
  rightChatbot: string | null;
  setRightChatbot: (id: string | null) => void;
  leftModelName: string;
  setLeftModelName: (model: string) => void;
  rightModelName: string;
  setRightModelName: (model: string) => void;
  agent_ask: "left" | "right";
  setAgentAsk: (side: "left" | "right") => void;
  onStartConversation: () => void;
}

const CombatSelection: React.FC<CombatSelectionProps> = ({
  chatbots,
  leftChatbot,
  setLeftChatbot,
  rightChatbot,
  setRightChatbot,
  leftModelName,
  setLeftModelName,
  rightModelName,
  setRightModelName,
  agent_ask,
  setAgentAsk,
  onStartConversation,
}) => {
  return (
    <div
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #141e30 0%, #243b55 100%)", // combatBackgrounds.main
      }}
    >
      {/* Floating combat elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <Sword className="absolute top-10 left-10 w-16 h-16 animate-spin-slow" />
        <Shield className="absolute top-20 right-20 w-12 h-12 animate-pulse" />
        <Zap className="absolute bottom-20 left-20 w-14 h-14 animate-bounce" />
        <Trophy className="absolute bottom-10 right-10 w-16 h-16 animate-spin-slow" />
        <Flame className="absolute top-1/2 left-5 w-10 h-10 animate-pulse" />
        <Bomb className="absolute top-1/3 right-5 w-10 h-10 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4 animate-glow">
            <span className="inline-block mr-4"><Sword className="inline w-12 h-12 text-yellow-400 animate-float" /></span>
            AI COMBAT ARENA
            <span className="inline-block ml-4"><Sword className="inline w-12 h-12 text-yellow-400 animate-float" /></span>
          </h1>
          <p className="text-xl text-yellow-300 font-semibold shadow-lg">
            Watch two AI agents engage in an intelligent conversation
          </p>
          <div className="mt-4 flex justify-center">
            <Scale className="w-16 h-16 animate-float text-purple-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200 relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-xl animate-pulse combat-glow"></div>
            <Card className="shadow-2xl hover:shadow-cyan-500/50 transition-shadow duration-200 bg-gradient-to-br from-blue-900/80 to-cyan-800/80 border-2 border-cyan-400/50 backdrop-blur-sm combat-glow relative z-10">
              <CardHeader className="pb-0">
                <CardTitle>
                  <div className="flex items-center">
                    <Bot className="text-cyan-300 mr-2 w-8 h-8 animate-float" />
                    <span className="text-cyan-300 font-bold text-xl">
                      Left Fighter
                    </span>
                    <Sword className="text-cyan-300 ml-2 w-8 h-8 animate-shake" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <CombatSelect
                  value={leftChatbot || ""}
                  onChange={setLeftChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                  placeholder="Select a chatbot"
                  side="left"
                />
                <CombatSelect
                  value={leftModelName}
                  onChange={setLeftModelName}
                  options={modelOptions}
                  placeholder="Select a model"
                  side="left"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-200 relative">
            <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-xl animate-pulse delay-500 combat-glow"></div>
            <Card className="shadow-2xl hover:shadow-red-500/50 transition-shadow duration-200 bg-gradient-to-br from-red-900/80 to-pink-800/80 border-2 border-red-400/50 backdrop-blur-sm combat-glow relative z-10">
              <CardHeader className="pb-0">
                <CardTitle>
                  <div className="flex items-center">
                    <Bot className="text-red-300 mr-2 w-8 h-8 animate-float delay-300" />
                    <span className="text-red-300 font-bold text-xl">
                      Right Fighter
                    </span>
                    <Sword className="text-red-300 ml-2 w-8 h-8 animate-shake delay-500" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <CombatSelect
                  value={rightChatbot || ""}
                  onChange={setRightChatbot}
                  options={chatbots.map((bot) => ({
                    label: bot.name,
                    value: bot.id,
                  }))}
                  placeholder="Select a chatbot"
                  side="right"
                />
                <CombatSelect
                  value={rightModelName}
                  onChange={setRightModelName}
                  options={modelOptions}
                  placeholder="Select a model"
                  side="right"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* First Ask Switch */}
        <Card className="mb-8 shadow-2xl hover:shadow-yellow-500/30 transition-shadow duration-200 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-2 border-yellow-400/50 backdrop-blur-sm combat-glow">
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-xl text-yellow-300 font-bold"><Sword className="inline w-8 h-8" /></span>
              <span className="text-xl text-yellow-300 font-bold">
                First Asking Agent:
              </span>
              <div className="flex items-center gap-4 bg-black/50 p-4 rounded-lg border border-yellow-400/30">
                <span
                  className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    agent_ask === "left" ? "text-cyan-400" : "text-gray-400"
                  )}
                >
                  <Bot className="w-5 h-5" /> Left AI
                </span>
                <Switch
                  checked={agent_ask === "right"}
                  onCheckedChange={(checked) =>
                    setAgentAsk(checked ? "right" : "left")
                  }
                  className="scale-125 bg-yellow-600"
                />
                <span
                  className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    agent_ask === "right" ? "text-red-400" : "text-gray-400"
                  )}
                >
                  Right AI <Bot className="w-5 h-5" />
                </span>
              </div>
              <span className="text-xl text-yellow-300 font-bold"><Sword className="inline w-8 h-8" /></span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            disabled={!leftChatbot || !rightChatbot}
            className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 hover:from-yellow-600 hover:via-red-600 hover:to-purple-700 text-white text-xl font-bold px-12 py-6 h-auto shadow-2xl hover:shadow-yellow-500/50 transition-all duration-200 border-2 border-yellow-400 animate-glow combat-glow"
            onClick={onStartConversation}
          >
            <Sword className="inline w-6 h-6 mr-2" /> Start Conversation <Scale className="inline w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CombatSelection;
