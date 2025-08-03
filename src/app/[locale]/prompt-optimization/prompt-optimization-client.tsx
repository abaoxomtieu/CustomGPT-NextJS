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
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Copy,
  ArrowRight,
  Loader2,
  Maximize2,
  Settings,
  Sparkles,
  Brain,
  Edit,
  X,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ApiDomain } from "@/constant";
import MarkdownRenderer from "@/components/markdown-render";

type OptimizationType = "system" | "user";
type SystemOptimizationType =
  | "general"
  | "general_with_output_format"
  | "analytical_structured";
type UserOptimizationType = "professional" | "basic" | "step_by_step_planning";

export default function PromptOptimizationClient() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<OptimizationType>("system");
  const [systemOptimizationType, setSystemOptimizationType] =
    useState<SystemOptimizationType>("general");
  const [userOptimizationType, setUserOptimizationType] =
    useState<UserOptimizationType>("professional");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [renderMode, setRenderMode] = useState<"render" | "source">("render");
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (optimizedPrompt && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [optimizedPrompt]);

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) {
      toast.error("Vui lòng nhập prompt cần tối ưu hóa");
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

      toast.success("Tối ưu hóa prompt thành công!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info("Đã hủy tối ưu hóa prompt");
      } else if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error("Network error - CORS or connection issue:", error);
        toast.error(
          "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc server backend."
        );
      } else {
        console.error("Error optimizing prompt:", error);
        toast.error(
          `Có lỗi xảy ra khi tối ưu hóa prompt: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
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

  const handleCopy = () => {
    if (optimizedPrompt) {
      navigator.clipboard.writeText(optimizedPrompt);
      toast.success("Đã sao chép prompt!");
    }
  };

  const getOptimizationTypeDisplay = () => {
    if (activeTab === "system") {
      switch (systemOptimizationType) {
        case "general":
          return "General Optimization";
        case "general_with_output_format":
          return "General with Output Format";
        case "analytical_structured":
          return "Analytical Structured Optimization";
        default:
          return "General Optimization";
      }
    } else {
      switch (userOptimizationType) {
        case "professional":
          return "Professional Optimization";
        case "basic":
          return "Basic Optimization";
        case "step_by_step_planning":
          return "Step by Step Planning";
        default:
          return "Professional Optimization";
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">Prompt Optimization</h1>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Brain className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Panel - Input */}
          <div className="p-4 sm:p-6 border-r bg-muted/20 overflow-auto max-h-[calc(100vh-4rem)] lg:max-h-none">
            <div className="space-y-4 sm:space-y-6">
              {/* Original Prompt */}
              <div className="space-y-3">
                <Label
                  htmlFor="original-prompt"
                  className="text-base font-medium"
                >
                  Original Prompt
                </Label>
                <Textarea
                  id="original-prompt"
                  placeholder="Enter your original prompt to optimize..."
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  className="min-h-[150px] sm:min-h-[200px] resize-none"
                />
              </div>

              {/* Optimization Type Tabs */}
              <div className="space-y-3">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as OptimizationType)
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="system"
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">
                        System Prompt Optimization
                      </span>
                      <span className="sm:hidden">System</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="user"
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">
                        User Prompt Optimization
                      </span>
                      <span className="sm:hidden">User</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Model and Template Selection */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Optimization Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-2.5-flash">Gemini</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Optimization Template
                  </Label>
                  {activeTab === "system" ? (
                    <Select
                      value={systemOptimizationType}
                      onValueChange={(value) =>
                        setSystemOptimizationType(
                          value as SystemOptimizationType
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General Optimization
                        </SelectItem>
                        <SelectItem value="general_with_output_format">
                          General with Output Format
                        </SelectItem>
                        <SelectItem value="analytical_structured">
                          Analytical Structured Optimization
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          Professional Optimization
                        </SelectItem>
                        <SelectItem value="basic">
                          Basic Optimization
                        </SelectItem>
                        <SelectItem value="step_by_step_planning">
                          Step by Step Planning
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Optimize Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !originalPrompt.trim()}
                  className="flex-1"
                  size="lg"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      Optimize
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                {isOptimizing && (
                  <Button
                    onClick={handleStopOptimization}
                    variant="outline"
                    size="lg"
                    className="px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="flex flex-col max-h-[calc(100vh-4rem)] lg:max-h-none">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">
                  Optimized Prompt
                </h3>
                <div className="flex items-center gap-2">
                  <Tabs
                    value={renderMode}
                    onValueChange={(value) =>
                      setRenderMode(value as "render" | "source")
                    }
                  >
                    <TabsList className="h-7 sm:h-8">
                      <TabsTrigger value="render" className="text-xs px-2">
                        Render
                      </TabsTrigger>
                      <TabsTrigger value="source" className="text-xs px-2">
                        Source
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!optimizedPrompt}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!optimizedPrompt}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div
                className="h-full overflow-y-auto"
                ref={scrollAreaRef}
                style={{ maxHeight: "calc(100vh - 8rem)" }}
              >
                <div className="p-4 sm:p-6" style={{ minHeight: "100%" }}>
                  {!optimizedPrompt && !isOptimizing ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground min-h-[200px]">
                      <div className="text-center">
                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-base sm:text-lg">
                          Optimized prompt will be shown here...
                        </p>
                        <p className="text-xs sm:text-sm mt-2">
                          Enter a prompt and click optimize to get started
                        </p>
                      </div>
                    </div>
                  ) : !optimizedPrompt && isOptimizing ? (
                    <div className="h-full flex items-center justify-center min-h-[200px]">
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm sm:text-base">
                          Optimizing your prompt...
                        </p>
                      </div>
                    </div>
                  ) : renderMode === "render" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownRenderer content={optimizedPrompt} />
                      {isOptimizing && (
                        <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs">Generating...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                        {optimizedPrompt}
                      </pre>
                      {isOptimizing && (
                        <div className="flex items-center gap-2 mt-4 text-muted-foreground">
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
        </div>
      </div>

      {/* Credit Link */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://github.com/linshenkx/prompt-optimizer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm text-muted-foreground hover:text-foreground"
        >
          <Github className="w-4 h-4" />
          <span>Original by linshenkx</span>
        </a>
      </div>
    </div>
  );
}
