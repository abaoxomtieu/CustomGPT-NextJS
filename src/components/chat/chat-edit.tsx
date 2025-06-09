"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { HelpCircle, Wrench } from "lucide-react";
import {
  updateChatbot,
  Chatbot,
  ChatbotUpdateRequest,
} from "@/services/chatbotService";

interface ChatbotEditDialogProps {
  isVisible: boolean;
  onClose: () => void;
  chatbot: Chatbot | null;
  onSuccess: (updatedChatbot: Chatbot) => void;
}

const toolList = [
  {
    key: "retrieve_document",
    label: "Truy xuất tài liệu",
    help: "Cho phép chatbot tìm kiếm và truy xuất thông tin từ các tài liệu đã tải lên",
  },
  {
    key: "duckduckgo_search",
    label: "Tìm kiếm DuckDuckGo",
    help: "Cho phép chatbot tìm kiếm thông tin trực tuyến qua DuckDuckGo",
  },
  {
    key: "python_repl",
    label: "Python REPL",
    help: "Cho phép chatbot chạy mã Python để tính toán và phân tích dữ liệu",
  },
];

const ChatbotEditDialog: React.FC<ChatbotEditDialogProps> = ({
  isVisible,
  onClose,
  chatbot,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  // Controlled form states
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [errors, setErrors] = useState<{ name?: string; prompt?: string }>({});

  useEffect(() => {
    if (chatbot && isVisible) {
      setSelectedTools(Array.isArray(chatbot.tools) ? chatbot.tools : []);
      setIsPublic(chatbot.public || false);
      setName(chatbot.name || "");
      setPrompt(chatbot.prompt || "");
      setErrors({});
    }
  }, [chatbot, isVisible]);

  const validate = () => {
    let newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Tên chatbot là bắt buộc";
    if (!prompt.trim()) newErrors.prompt = "System Prompt là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const updateData: ChatbotUpdateRequest = {
        name: name.trim(),
        prompt: prompt.trim(),
        tools: selectedTools,
        public: isPublic,
      };
      if (chatbot?.id) {
        const updatedChatbot = await updateChatbot(chatbot.id, updateData);
        toast.success("Cập nhật chatbot thành công");
        onSuccess(updatedChatbot);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      toast.error("Có lỗi xảy ra khi cập nhật chatbot");
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Chatbot</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và cấu hình cho chatbot của bạn
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6 pt-4"
          onSubmit={handleSave}
          autoComplete="off"
        >
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Tên chatbot</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên cho chatbot của bạn"
              disabled={saving}
              className="h-10"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Prompt */}
          <div>
            <label className="block font-medium mb-1">System Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập System Prompt để định hướng hành vi của chatbot"
              className="font-mono text-sm md:h-50 h-25"
              disabled={saving}
            />
            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-xs">
              <span>
                System Prompt sẽ định hướng cách chatbot phản hồi và hành xử
              </span>
            </div>
            {errors.prompt && (
              <p className="text-red-500 text-xs mt-1">{errors.prompt}</p>
            )}
          </div>

          {/* Public option */}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(!!checked)}
                id="public-checkbox"
                disabled={saving}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <span tabIndex={-1}>
                        <HelpCircle className="ml-2 inline-block w-4 h-4 text-gray-400" />
                      </span>
                      <span className="font-medium">Công khai chatbot</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Cho phép người khác có thể tìm thấy và sử dụng chatbot này
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Tools */}
          <Separator />
          <div className="flex items-center mb-2">
            <Wrench className="w-4 h-4 mr-2" />
            <span className="font-medium">Công cụ</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={-1}>
                    <HelpCircle className="ml-2 inline-block w-4 h-4 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Chọn các công cụ mà chatbot có thể sử dụng để trả lời câu hỏi
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-3">
            {toolList.map((tool) => (
              <div className="flex items-center" key={tool.key}>
                <Checkbox
                  checked={selectedTools.includes(tool.key)}
                  onCheckedChange={() => toggleTool(tool.key)}
                  disabled={saving}
                  id={`tool-${tool.key}`}
                >
                  <span className="font-medium">{tool.label}</span>
                </Checkbox>
                <div className="ml-6 text-sm text-muted-foreground">
                  {tool.help}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
              disabled={saving}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotEditDialog;
