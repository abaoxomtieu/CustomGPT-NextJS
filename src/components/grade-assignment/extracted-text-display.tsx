"use client";

import { useState } from "react";
import { Copy, Check, FileText, Lightbulb } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Văn bản đã trích xuất
            </h3>
            <p className="text-sm text-gray-500">AI đã phân tích và trích xuất nội dung</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          <span className="hidden sm:inline">{copied ? "Đã sao chép" : "Sao chép"}</span>
          <span className="sm:hidden">{copied ? "✓" : "Copy"}</span>
        </Button>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Lưu ý quan trọng</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Thứ tự upload ảnh/screenshot sẽ ảnh hưởng đến kết quả cuối cùng. 
              Vui lòng upload theo đúng thứ tự từ trên xuống dưới hoặc từ trái qua phải để đảm bảo độ chính xác.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Nội dung trích xuất</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{text.length} ký tự</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Đã xử lý</span>
            </div>
          </div>
        </div>
        <div className="min-h-[300px] p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800 dark:to-gray-700">
          <MarkdownRenderer content={text || "Văn bản sẽ hiển thị ở đây..."} />
        </div>
      </div>
    </div>
  );
};

export default ExtractedTextDisplay;
