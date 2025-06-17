import React, { useRef, useState } from "react";
import { Paperclip, Send, Loader2, Brain } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  loading: boolean;
  botId: string;
  selectedFiles: File[];
  onInputChange: (value: string) => void;
  onSend: (files: File[]) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSelectedFilesChange: (files: File[]) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  color?: string;
  reasoning?: boolean;
  onReasoningChange?: (value: boolean) => void;
}

const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB in bytes

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  loading,
  selectedFiles,
  onInputChange,
  onSend,
  onKeyPress,
  onSelectedFilesChange,
  inputRef,
  disabled = false,
  color = "bg-background",
  reasoning = false,
  onReasoningChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const calculateTotalSize = (files: File[]): number => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalSize = calculateTotalSize([...selectedFiles, ...newFiles]);

    if (totalSize > MAX_TOTAL_SIZE) {
      setError("File size limit exceeded");
      return;
    }

    setError("");
    onSelectedFilesChange([...selectedFiles, ...newFiles]);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const newFiles: File[] = [];

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Convert to PNG if it's not already PNG or JPEG
          if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            try {
              const img = new Image();
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Create a promise to handle the image loading
              const imageLoadPromise = new Promise((resolve) => {
                img.onload = resolve;
                img.src = URL.createObjectURL(file);
              });

              await imageLoadPromise;
              
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              
              // Convert to PNG
              const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                  if (blob) resolve(blob);
                }, 'image/png');
              });
              
              const convertedFile = new File([blob], 'pasted-image.png', { type: 'image/png' });
              newFiles.push(convertedFile);
            } catch (error) {
              console.error('Error converting image:', error);
              newFiles.push(file);
            }
          } else {
            newFiles.push(file);
          }
        }
      }
    }

    if (newFiles.length > 0) {
      const totalSize = calculateTotalSize([...selectedFiles, ...newFiles]);
      if (totalSize > MAX_TOTAL_SIZE) {
        setError("File size limit exceeded");
        return;
      }
      setError("");
      onSelectedFilesChange([...selectedFiles, ...newFiles]);
    }
  };

  const handleSend = () => {
    onSend(selectedFiles);
  };

  return (
    <div className={`flex-none p-2 md:p-4 ${color} backdrop-blur-sm`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-xl md:rounded-2xl border border-gray-200">
          {error && (
            <div className="p-2 bg-red-50 border-b border-red-200">
              <p className="text-xs md:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded overflow-hidden"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-[10px] md:text-xs truncate px-1">
                          {file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        onSelectedFilesChange(
                          selectedFiles.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-end gap-2 p-2">
            <div className="flex-1 min-h-[50px] md:min-h-[60px]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={onKeyPress}
                onPaste={handlePaste}
                placeholder="Type a message or paste an image..."
                disabled={loading || disabled}
                className="w-full h-full min-h-[50px] md:min-h-[60px] px-3 md:px-4 py-2 md:py-3 text-base md:text-lg bg-transparent border-none focus:outline-none resize-none"
                style={{ lineHeight: "1.5" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2 pr-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                multiple
                accept="image/*,.pdf"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className={`p-1.5 md:p-2 transition-colors rounded-full ${
                  disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                }`}
                title="Upload file"
              >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="flex items-center gap-2">
                {onReasoningChange && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={reasoning ? "default" : "outline"}
                          size="sm"
                          onClick={() => onReasoningChange(!reasoning)}
                          className="h-8 w-8 p-0"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {reasoning ? "Tắt chế độ lý luận" : "Bật chế độ lý luận"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  onClick={handleSend}
                  disabled={
                    loading || disabled || (!input.trim() && selectedFiles.length === 0)
                  }
                  className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
                    loading || disabled || (!input.trim() && selectedFiles.length === 0)
                      ? "bg-foreground text-background cursor-not-allowed"
                      : "bg-foreground text-background shadow-sm hover:bg-foreground/80 hover:shadow-md"
                  }`}
                  title={loading ? "Processing..." : "Send"}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send size={18} className="md:w-5 md:h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
