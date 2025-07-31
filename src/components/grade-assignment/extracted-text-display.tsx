"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/markdown-render";
// import { toast } from "sonner";

interface ExtractedTextDisplayProps {
  text: string;
}

const ExtractedTextDisplay: React.FC<ExtractedTextDisplayProps> = ({
  text,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // toast.success("Đã sao chép văn bản!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // toast.error("Không thể sao chép văn bản");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base sm:text-lg font-semibold">
          Văn bản đã trích xuất
        </h3>
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2 sm:px-3"
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sao chép</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>
      </div>

      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs sm:text-sm text-blue-800">
          <span className="font-medium">Lưu ý:</span> Thứ tự upload ảnh/screenshot sẽ ảnh hưởng đến kết quả cuối cùng. 
          Vui lòng upload theo đúng thứ tự từ trên xuống dưới hoặc từ trái qua phải để đảm bảo độ chính xác.
        </p>
      </div>

      <div className="min-h-[200px] sm:min-h-[300px] p-3 sm:p-4 border rounded-md bg-background">
        <MarkdownRenderer content={text || "Văn bản sẽ hiển thị ở đây..."} />
      </div>

      <div className="text-xs text-muted-foreground">
        Độ dài: {text.length} ký tự
      </div>
    </div>
  );
};

export default ExtractedTextDisplay;
