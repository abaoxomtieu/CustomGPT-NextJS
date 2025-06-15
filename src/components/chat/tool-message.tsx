import React, { useState, useEffect } from "react";
import {
  Wrench,
  Cog,
  Database,
  Search,
  FileText,
  Code,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolMessageProps {
  content: string;
  metadata?: {
    node: string;
    step: number;
    checkpoint_ns: string;
  };
}

const getToolIcon = (content: string) => {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("search") || lowerContent.includes("tìm kiếm")) {
    return <Search className="w-4 h-4" />;
  }
  if (
    lowerContent.includes("database") ||
    lowerContent.includes("cơ sở dữ liệu")
  ) {
    return <Database className="w-4 h-4" />;
  }
  if (lowerContent.includes("file") || lowerContent.includes("tệp")) {
    return <FileText className="w-4 h-4" />;
  }
  if (lowerContent.includes("code") || lowerContent.includes("mã")) {
    return <Code className="w-4 h-4" />;
  }
  if (lowerContent.includes("config") || lowerContent.includes("cấu hình")) {
    return <Cog className="w-4 h-4" />;
  }

  return <Wrench className="w-4 h-4" />;
};

const getToolDescription = (content: string) => {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("search") || lowerContent.includes("tìm kiếm")) {
    return "Đang tìm kiếm thông tin";
  }
  if (
    lowerContent.includes("database") ||
    lowerContent.includes("cơ sở dữ liệu")
  ) {
    return "Đang truy cập cơ sở dữ liệu";
  }
  if (lowerContent.includes("file") || lowerContent.includes("tệp")) {
    return "Đang xử lý tệp";
  }
  if (lowerContent.includes("code") || lowerContent.includes("mã")) {
    return "Đang tạo mã";
  }
  if (lowerContent.includes("config") || lowerContent.includes("cấu hình")) {
    return "Đang cấu hình";
  }

  return "Đang sử dụng công cụ";
};

const TOOL_MESSAGE_COLLAPSED_KEY = "tool_message_collapsed_preference";

const ToolMessage: React.FC<ToolMessageProps> = ({ content, metadata }) => {
  // Initialize state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(TOOL_MESSAGE_COLLAPSED_KEY);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const toolIcon = getToolIcon(content);
  const toolDescription = getToolDescription(content);

  // Save preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        TOOL_MESSAGE_COLLAPSED_KEY,
        JSON.stringify(isCollapsed)
      );
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (isExpanded) setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isCollapsed) setIsCollapsed(false);
  };

  const isLongContent = content.length > 200;

  return (
    <div className="mb-4 md:mb-6">
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse rounded-full h-2 w-2 bg-blue-500 flex-shrink-0"></div>
              <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                {toolIcon}
              </div>
              <span className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                {toolDescription}
              </span>
            </div>
            {metadata?.step && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  Bước {metadata.step}
                </span>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {isLongContent && !isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
              title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isCollapsed ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Content - Collapsible with smooth animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-h-0 opacity-0" : "h-50 opacity-100"
          }`}
        >
          <div className="px-3 md:px-4 pb-3 md:pb-4">
            <div className="relative">
              <div
                className={`text-sm md:text-base text-blue-800 dark:text-blue-200 bg-white/70 dark:bg-blue-900/30 rounded-md p-3 border border-blue-100 dark:border-blue-700/50 transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-none" : "max-h-32 overflow-hidden"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 break-words">{content}</div>
                </div>

                {/* Fade overlay when not expanded and content is long */}
                {!isExpanded && isLongContent && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/70 dark:from-blue-900/30 to-transparent pointer-events-none rounded-b-md"></div>
                )}
              </div>

              {/* Progress indicator and controls */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Đang xử lý...
                  </span>
                </div>

                {/* Show expand hint for long content */}
                {!isExpanded && isLongContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpand}
                    className="h-5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 transition-colors duration-200"
                  >
                    Xem thêm
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolMessage;
