"use client";
import React, { useMemo } from "react";
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
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CombatSelect from "./combat-select";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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
  const router = useRouter();
  const t = useTranslations("aiCombat");

  // Memoize background style
  const backgroundStyle = useMemo(
    () => ({
      background: "linear-gradient(120deg, #0f172a 0%, #7c3aed 50%, #0f172a 100%)",
    }),
    []
  );

  return (
    <div
      className="min-h-screen p-4 md:p-8 relative overflow-hidden"
      style={backgroundStyle}
    >
      {/* Reduced floating elements */}
      <div className="absolute inset-0 pointer-events-none opacity-3 z-0">
        <Sword className="absolute top-10 left-10 w-12 h-12" />
        <Shield className="absolute bottom-20 right-20 w-10 h-10" />
        <Trophy className="absolute top-1/2 right-10 w-12 h-12" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title with Home button */}
        <div className="text-center mb-8 md:mb-12 relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-red-400 border border-yellow-400/30 hover:border-red-400/50 bg-black/50 font-bold text-xs md:text-sm"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            {t("home")}
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4">
            <span className="inline-block mr-2 md:mr-4">
              <Sword className="inline w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
            </span>
            {t("title")}
            <span className="inline-block ml-2 md:ml-4">
              <Sword className="inline w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-yellow-300 font-semibold">
            {t("subtitle")}
          </p>
          <div className="mt-4 flex justify-center">
            <Scale className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
          {/* Left Side */}
          <div className="space-y-4 transform hover:scale-102 transition-transform duration-200 relative">
            <div className="absolute inset-0 bg-blue-500/5 rounded-lg blur-md"></div>
            <Card className="shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-200 bg-gradient-to-br from-blue-900/80 to-cyan-800/80 border border-cyan-400/30 backdrop-blur-sm relative z-10">
              <CardHeader className="pb-0">
                <CardTitle>
                  <div className="flex items-center">
                    <Bot className="text-cyan-300 mr-2 w-6 h-6 md:w-8 md:h-8" />
                    <span className="text-cyan-300 font-bold text-lg md:text-xl">
                      {t("leftFighter")}
                    </span>
                    <Sword className="text-cyan-300 ml-2 w-6 h-6 md:w-8 md:h-8" />
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
                  placeholder={t("selectChatbot")}
                  side="left"
                />
                <CombatSelect
                  value={leftModelName}
                  onChange={setLeftModelName}
                  options={modelOptions.map((option) => ({
                    ...option,
                    label: t(
                      `modelOptions.${
                        option.value === "gemini-2.5-flash-preview-05-20"
                          ? "gemini25"
                          : "gemini20"
                      }`
                    ),
                  }))}
                  placeholder={t("selectModel")}
                  side="left"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side */}
          <div className="space-y-4 transform hover:scale-102 transition-transform duration-200 relative">
            <div className="absolute inset-0 bg-red-500/5 rounded-lg blur-md"></div>
            <Card className="shadow-lg hover:shadow-red-500/30 transition-shadow duration-200 bg-gradient-to-br from-red-900/80 to-pink-800/80 border border-red-400/30 backdrop-blur-sm relative z-10">
              <CardHeader className="pb-0">
                <CardTitle>
                  <div className="flex items-center">
                    <Bot className="text-red-300 mr-2 w-6 h-6 md:w-8 md:h-8" />
                    <span className="text-red-300 font-bold text-lg md:text-xl">
                      {t("rightFighter")}
                    </span>
                    <Sword className="text-red-300 ml-2 w-6 h-6 md:w-8 md:h-8" />
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
                  placeholder={t("selectChatbot")}
                  side="right"
                />
                <CombatSelect
                  value={rightModelName}
                  onChange={setRightModelName}
                  options={modelOptions.map((option) => ({
                    ...option,
                    label: t(
                      `modelOptions.${
                        option.value === "gemini-2.5-flash-preview-05-20"
                          ? "gemini25"
                          : "gemini20"
                      }`
                    ),
                  }))}
                  placeholder={t("selectModel")}
                  side="right"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* First Ask Switch */}
        <Card className="mb-6 md:mb-8 shadow-lg hover:shadow-yellow-500/20 transition-shadow duration-200 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-yellow-400/30 backdrop-blur-sm">
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <span className="text-lg md:text-xl text-yellow-300 font-bold">
                <Sword className="inline w-6 h-6 md:w-8 md:h-8" />
              </span>
              <span className="text-lg md:text-xl text-yellow-300 font-bold">
                {t("firstAskingAgent")}:
              </span>
              <div className="flex items-center gap-3 md:gap-4 bg-black/50 p-3 md:p-4 rounded-lg border border-yellow-400/30">
                <span
                  className={cn(
                    "text-base md:text-lg font-bold flex items-center gap-2",
                    agent_ask === "left" ? "text-cyan-400" : "text-gray-400"
                  )}
                >
                  <Bot className="w-4 h-4 md:w-5 md:h-5" /> {t("leftAI")}
                </span>
                <Switch
                  checked={agent_ask === "right"}
                  onCheckedChange={(checked) =>
                    setAgentAsk(checked ? "right" : "left")
                  }
                  className="scale-110 md:scale-125 bg-yellow-600"
                />
                <span
                  className={cn(
                    "text-base md:text-lg font-bold flex items-center gap-2",
                    agent_ask === "right" ? "text-red-400" : "text-gray-400"
                  )}
                >
                  {t("rightAI")} <Bot className="w-4 h-4 md:w-5 md:h-5" />
                </span>
              </div>
              <span className="text-lg md:text-xl text-yellow-300 font-bold">
                <Sword className="inline w-6 h-6 md:w-8 md:h-8" />
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            disabled={!leftChatbot || !rightChatbot}
            className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 hover:from-yellow-600 hover:via-red-600 hover:to-purple-700 text-white text-lg md:text-xl font-bold px-6 md:px-12 py-4 md:py-6 h-auto shadow-lg hover:shadow-yellow-500/30 transition-all duration-200 border border-yellow-400"
            onClick={onStartConversation}
          >
            <Sword className="inline w-5 h-5 md:w-6 md:h-6 mr-2" />{" "}
            {t("startConversation")}{" "}
            <Scale className="inline w-5 h-5 md:w-6 md:h-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CombatSelection;
