"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  ArrowRight,
  Loader2,
  Sparkles,
  Github,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ApiDomain } from "@/constant";
import MarkdownRenderer from "@/components/markdown-render";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type OptimizationType = "system" | "user";
type SystemOptimizationType = "general" | "general_with_output_format" | "analytical_structured";
type UserOptimizationType = "professional" | "basic" | "step_by_step_planning";

export default function PromptOptimizationMini() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<OptimizationType>("system");
  const [systemOptimizationType, setSystemOptimizationType] = useState<SystemOptimizationType>("general");
  const [userOptimizationType, setUserOptimizationType] = useState<UserOptimizationType>("professional");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [renderMode, setRenderMode] = useState<"render" | "source">("render");
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("HomePage");

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (optimizedPrompt && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [optimizedPrompt]);

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt to optimize");
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
      const endpoint = activeTab === "system" ? "/system-prompt" : "/user-prompt";
      const optimizationType = activeTab === "system" ? systemOptimizationType : userOptimizationType;

      const response = await fetch(`${ApiDomain}/prompt-optimization${endpoint}`, {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line.trim());
              if (data.content) {
                accumulatedContent += data.content;
                setOptimizedPrompt(accumulatedContent);
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

      toast.success("Prompt optimized successfully!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info("Optimization cancelled");
      } else {
        console.error("Error optimizing prompt:", error);
        toast.error(`Error optimizing prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleCopy = () => {
    if (optimizedPrompt) {
      navigator.clipboard.writeText(optimizedPrompt);
      toast.success("Prompt copied!");
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-lg border border-blue-60/20 hover:border-blue-primary/50 hover:shadow-xl transition-all duration-200 opacity-0" data-fade>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Prompt Optimization
            </h3>
            <p className="text-sm text-muted-foreground">
              AI-powered prompt enhancement tool
            </p>
          </div>
        </div>
        <Link href="/prompt-optimization">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Full Version
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <div className="space-y-4">
          {/* Original Prompt */}
          <div className="space-y-2">
            <Label htmlFor="original-prompt-mini" className="text-sm font-medium">
              Original Prompt
            </Label>
            <Textarea
              id="original-prompt-mini"
              placeholder="Enter your prompt to optimize..."
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="min-h-[120px] resize-none text-sm"
            />
          </div>

          {/* Optimization Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OptimizationType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                <TabsTrigger value="user" className="text-xs">User</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Template</Label>
            {activeTab === "system" ? (
              <Select value={systemOptimizationType} onValueChange={(value) => setSystemOptimizationType(value as SystemOptimizationType)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="general_with_output_format">With Output Format</SelectItem>
                  <SelectItem value="analytical_structured">Analytical</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={userOptimizationType} onValueChange={(value) => setUserOptimizationType(value as UserOptimizationType)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="step_by_step_planning">Step by Step</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Optimize Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !originalPrompt.trim()}
              className="flex-1"
              size="sm"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  Optimize
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
            {isOptimizing && (
              <Button
                onClick={handleStopOptimization}
                variant="outline"
                size="sm"
                className="px-2"
              >
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Optimized Result</Label>
            <div className="flex items-center gap-2">
              <Tabs value={renderMode} onValueChange={(value) => setRenderMode(value as "render" | "source")}>
                <TabsList className="h-7">
                  <TabsTrigger value="render" className="text-xs px-2">Render</TabsTrigger>
                  <TabsTrigger value="source" className="text-xs px-2">Source</TabsTrigger>
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
              className="h-[240px] overflow-y-auto p-3" 
              ref={scrollAreaRef}
            >
              {!optimizedPrompt && !isOptimizing ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Optimized prompt will appear here...</p>
                  </div>
                </div>
              ) : !optimizedPrompt && isOptimizing ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">Optimizing...</p>
                  </div>
                </div>
              ) : renderMode === "render" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <MarkdownRenderer content={optimizedPrompt} />
                  {isOptimizing && (
                    <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Generating...</span>
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
                      <span className="text-xs">Generating...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Link */}
      <div className="flex justify-end mt-4">
        <a
          href="https://github.com/linshenkx/prompt-optimizer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="w-3 h-3" />
          <span>Original by linshenkx</span>
        </a>
      </div>
    </div>
  );
}
