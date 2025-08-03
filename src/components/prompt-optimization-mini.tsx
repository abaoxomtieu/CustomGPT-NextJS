"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Copy, Github } from "lucide-react";
import MarkdownRenderer from "@/components/markdown-render";
import { useTranslations } from "next-intl";

type OptimizationType = "system" | "user";
type SystemOptimizationType =
  | "general"
  | "general_with_output_format"
  | "analytical_structured";
type UserOptimizationType = "gpt" | "claude" | "gemini";

interface OptimizeRequest {
  prompt: string;
  prompt_type: OptimizationType;
  optimization_type: SystemOptimizationType | UserOptimizationType;
}

export function PromptOptimizationMini() {
  const t = useTranslations("promptOptimization");

  const [originalPrompt, setOriginalPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<OptimizationType>("system");
  const [systemOptimizationType, setSystemOptimizationType] =
    useState<SystemOptimizationType>("general");
  const [userOptimizationType, setUserOptimizationType] =
    useState<UserOptimizationType>("gpt");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [renderMode, setRenderMode] = useState<"render" | "source">("render");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) return;

    setIsOptimizing(true);
    setOptimizedPrompt("");

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const requestData: OptimizeRequest = {
        prompt: originalPrompt,
        prompt_type: activeTab,
        optimization_type:
          activeTab === "system"
            ? systemOptimizationType
            : userOptimizationType,
      };

      const response = await fetch("/api/prompt-optimization/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.content) {
                accumulatedText += jsonData.content;
                setOptimizedPrompt(accumulatedText);

                // Auto-scroll to bottom
                if (scrollAreaRef.current) {
                  scrollAreaRef.current.scrollTop =
                    scrollAreaRef.current.scrollHeight;
                }
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error optimizing prompt:", error);
        setOptimizedPrompt(`${t("messages.error")}: ${error.message}`);
      }
    } finally {
      setIsOptimizing(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopOptimization = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsOptimizing(false);
    }
  };

  const handleCopy = async () => {
    if (optimizedPrompt) {
      await navigator.clipboard.writeText(optimizedPrompt);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">{t("title")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Panel - Input */}
          <div className="space-y-3">
            {/* Original Prompt */}
            <div className="space-y-2">
              <Label
                htmlFor="original-prompt-mini"
                className="text-sm font-medium"
              >
                {t("originalPrompt")}
              </Label>
              <Textarea
                id="original-prompt-mini"
                placeholder={t("placeholders.miniPrompt")}
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
              />
            </div>

            {/* Optimization Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("labels.optimizationType")}
              </Label>
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as OptimizationType)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="system" className="text-xs">
                    {t("types.system")}
                  </TabsTrigger>
                  <TabsTrigger value="user" className="text-xs">
                    {t("types.user")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("labels.template")}
              </Label>
              {activeTab === "system" ? (
                <Select
                  value={systemOptimizationType}
                  onValueChange={(value) =>
                    setSystemOptimizationType(value as SystemOptimizationType)
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue
                      placeholder={t("placeholders.selectTemplate")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {t("templates.general")}
                    </SelectItem>
                    <SelectItem value="general_with_output_format">
                      {t("templates.generalWithOutputFormat")}
                    </SelectItem>
                    <SelectItem value="analytical_structured">
                      {t("templates.analyticalStructured")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={userOptimizationType}
                  onValueChange={(value) =>
                    setUserOptimizationType(value as UserOptimizationType)
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue
                      placeholder={t("placeholders.selectTemplate")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt">{t("templates.gpt")}</SelectItem>
                    <SelectItem value="claude">
                      {t("templates.claude")}
                    </SelectItem>
                    <SelectItem value="gemini">
                      {t("templates.gemini")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Optimize Button */}
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !originalPrompt.trim()}
              className="w-full text-xs"
              size="sm"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {t("states.optimizing")}
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t("actions.optimize")}
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {t("labels.optimizedPrompt")}
              </Label>
              <div className="flex items-center gap-2">
                <Tabs
                  value={renderMode}
                  onValueChange={(value) =>
                    setRenderMode(value as "render" | "source")
                  }
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="render" className="text-xs px-2">
                      {t("labels.render")}
                    </TabsTrigger>
                    <TabsTrigger value="source" className="text-xs px-2">
                      {t("labels.source")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!optimizedPrompt}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-background/50">
              <div
                className="h-[200px] overflow-y-auto p-3"
                ref={scrollAreaRef}
              >
                {!optimizedPrompt && !isOptimizing ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">{t("messages.emptyState")}</p>
                    </div>
                  </div>
                ) : !optimizedPrompt && isOptimizing ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-muted-foreground text-xs">
                        {t("states.optimizing")}
                      </p>
                    </div>
                  </div>
                ) : renderMode === "render" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer content={optimizedPrompt} />
                    {isOptimizing && (
                      <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">
                          {t("states.generating")}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                      {optimizedPrompt}
                    </pre>
                    {isOptimizing && (
                      <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">
                          {t("states.generating")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stop Button (only shown when optimizing) */}
            {isOptimizing && (
              <Button
                onClick={handleStopOptimization}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                {t("actions.stop")}
              </Button>
            )}
          </div>
        </div>

        {/* Credit Link */}
        <div className="flex justify-end mt-4 pt-3 border-t">
          <a
            href="https://github.com/linshenkx/prompt-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-3 h-3" />
            <span>{t("credit")}</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
