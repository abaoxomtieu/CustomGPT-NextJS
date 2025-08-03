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
import { ApiDomain } from "@/constant";
import { toast } from "sonner";

type OptimizationType = "system" | "user";
type SystemOptimizationType =
  | "general"
  | "general_with_output_format"
  | "analytical_structured";
type UserOptimizationType = "professional" | "basic" | "step_by_step_planning";

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
    useState<UserOptimizationType>("professional");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [renderMode, setRenderMode] = useState<"render" | "source">("render");
  const [model, setModel] = useState("gemini-2.5-flash");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) {
      toast.error(t("messages.enterPrompt"));
      return;
    }

    setIsOptimizing(true);
    setOptimizedPrompt("");

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const endpoint =
        activeTab === "system" ? "/system-prompt" : "/user-prompt";
      const optimizationType =
        activeTab === "system" ? systemOptimizationType : userOptimizationType;

      console.log(
        "Sending request to:",
        `${ApiDomain}/prompt-optimization${endpoint}`
      );
      console.log("Request body:", {
        prompt: originalPrompt,
        optimization_type: optimizationType,
        model_name: model,
      });

      const response = await fetch(
        `${ApiDomain}/prompt-optimization${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: originalPrompt,
            optimization_type: optimizationType,
            model_name: model,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is null");
      }

      let accumulatedContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        console.log("Raw chunk received:", chunk);

        // Split by single newlines since each JSON object is on its own line
        const lines = buffer.split("\n");

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            console.log("Processing line:", line);
            try {
              const data = JSON.parse(line.trim());
              console.log("Parsed data:", data);

              if (data.content) {
                accumulatedContent += data.content;
                setOptimizedPrompt(accumulatedContent);
                console.log(
                  "Updated prompt content, total length:",
                  accumulatedContent.length
                );
                
                // Auto-scroll to bottom
                if (scrollAreaRef.current) {
                  scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                }
              }
            } catch (e) {
              console.warn("Failed to parse line:", line, "Error:", e);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer.trim());
          if (data.content) {
            accumulatedContent += data.content;
            setOptimizedPrompt(accumulatedContent);
          }
        } catch (e) {
          console.warn("Failed to parse final buffer:", buffer, "Error:", e);
        }
      }

      toast.success(t("messages.optimizationSuccess"));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info(t("messages.optimizationCancelled"));
      } else if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error("Network error - CORS or connection issue:", error);
        toast.error(t("messages.networkError"));
      } else {
        console.error("Error optimizing prompt:", error);
        toast.error(
          t("messages.unknownError", {
            error: error instanceof Error ? error.message : "Unknown error"
          })
        );
      }
    } finally {
      setIsOptimizing(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopOptimization = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = async () => {
    if (optimizedPrompt) {
      await navigator.clipboard.writeText(optimizedPrompt);
      toast.success(t("messages.copied"));
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
                    <SelectItem value="professional">
                      {t("templates.professional")}
                    </SelectItem>
                    <SelectItem value="basic">
                      {t("templates.basic")}
                    </SelectItem>
                    <SelectItem value="step_by_step_planning">
                      {t("templates.stepByStep")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("labels.optimizationModel")}
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={t("actions.selectModel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">{t("models.gemini")}</SelectItem>
                  <SelectItem value="gpt-4">{t("models.gpt4")}</SelectItem>
                  <SelectItem value="claude-3">{t("models.claude")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optimize Button */}
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !originalPrompt.trim()}
              className="w-full text-xs bg-blue-primary hover:bg-blue-active"
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
