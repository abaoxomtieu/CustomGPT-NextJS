import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  PenTool,
  PenToolIcon,
  MailQuestion,
  MessageCircle,
  Sparkles,
  Globe,
  FileText,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CreateChatbotFormProps {
  onSuccess: () => void;
}

const TOOL_LIST = [
  {
    value: "retrieve_document",
    label: "Truy xuất tài liệu",
    help: "Cho phép chatbot tìm và trả lời dựa trên tài liệu bạn cung cấp.",
    icon: FileText,
  },
  {
    value: "duckduckgo_search",
    label: "Tìm kiếm trên Internet",
    help: "Cho phép chatbot sử dụng DuckDuckGo để tra cứu thông tin ngoài thực tế.",
    icon: Globe,
  },
  {
    value: "python_repl",
    label: "Python REPL",
    help: "Cho phép chatbot chạy và trả lời các đoạn mã Python đơn giản.",
    icon: Code,
  },
];

const CreateChatbotForm: React.FC<CreateChatbotFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setPrompt("");
    setSelectedTools([]);
    setIsPublic(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên chatbot");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập lời nhắc cho chatbot");
      return;
    }
    try {
      setLoading(true);
      const { data, status } = await axios.post(
        `${ApiDomain}/ai/chatbots/create`,
        {
          name,
          prompt,
          tools: selectedTools,
          public: isPublic,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (status === 201) {
        toast.success("Tạo chatbot thành công!");
        resetForm();
        onSuccess();
        setTimeout(() => {
          router.push("/assistants");
        }, 3000);
      } else {
        toast.error(data.error || "Lỗi không xác định.");
      }
    } catch (error: any) {
      console.error("Lỗi tạo chatbot:", error);
      toast.error(
        error?.response?.data?.error ||
          (error instanceof Error ? error.message : "Tạo chatbot thất bại.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card shadow-lg p-8 h-full transition-all duration-300 flex flex-col gap-2 border-r border-border"
      autoComplete="off"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <PenTool className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-md font-bold text-card-foreground">
            Tạo Chatbot Mới
          </h2>
        </div>
      </div>

      {/* Tên chatbot */}
      <div className="space-y-2">
        <label
          className="font-medium block text-card-foreground text-sm"
          htmlFor="name"
        >
          Tên Chatbot
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên chatbot"
          disabled={loading}
          className="h-12 text-base bg-background border-border focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <label
          className="font-medium block text-card-foreground text-sm"
          htmlFor="prompt"
        >
          Lời nhắc (prompt) cho Chatbot
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ví dụ: Bạn là một trợ lý thân thiện giúp đỡ khách hàng về sản phẩm."
          rows={4}
          disabled={loading}
          className="resize-none bg-background border-border focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Công khai */}
      <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
        <Checkbox
          id="public"
          checked={isPublic}
          onCheckedChange={(v) => setIsPublic(!!v)}
          disabled={loading}
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <div className="flex-1">
          <label
            htmlFor="public"
            className="font-medium text-card-foreground text-sm cursor-pointer"
          >
            Công khai chatbot này
          </label>
          <p className="text-sm text-muted-foreground">
            Cho phép người dùng khác tìm thấy và sử dụng chatbot của bạn
          </p>
        </div>
        <Popover
          open={popoverOpen === "public"}
          onOpenChange={(open) => setPopoverOpen(open ? "public" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <MailQuestion className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">
              Nếu bật, chatbot này sẽ hiển thị công khai trên danh sách cho mọi
              người dùng khác.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Chức năng hỗ trợ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-card-foreground">
            Chức năng hỗ trợ
          </span>
          <Popover
            open={popoverOpen === "tools"}
            onOpenChange={(open) => setPopoverOpen(open ? "tools" : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs p-4 bg-card border-border">
              <p className="text-sm text-muted-foreground">
                Chọn các chức năng bạn muốn tích hợp cho chatbot.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-1">
          {TOOL_LIST.map((tool) => (
            <div
              key={tool.value}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${
                selectedTools.includes(tool.value)
                  ? "bg-primary/10 border-primary/20"
                  : "bg-background border-border hover:border-primary/20"
              }`}
            >
              <Checkbox
                id={tool.value}
                checked={selectedTools.includes(tool.value)}
                onCheckedChange={() => handleCheckbox(tool.value)}
                disabled={loading}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <tool.icon
                    className={`w-4 h-4 ${
                      selectedTools.includes(tool.value)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <label
                    htmlFor={tool.value}
                    className="font-medium text-card-foreground text-sm cursor-pointer"
                  >
                    {tool.label}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span className="animate-pulse">Đang tạo chatbot...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tạo chatbot
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateChatbotForm;
