"use client";
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, X, File as FileIcon } from "lucide-react";
import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";

interface FileUploadDialogProps {
  isVisible: boolean;
  onClose: () => void;
  botId: string;
}

interface FileAnalysis {
  file_path: string;
  word_count: number;
  image_count: number;
  file_type: string;
}

const DocumentUpload: React.FC<FileUploadDialogProps> = ({
  isVisible,
  onClose,
  botId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setFile(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalysis(null);

    // Analyze file
    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);

      const response = await fetch(`${ApiDomain}/file/analyze`, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      toast.error("Lỗi phân tích tệp");
    }
  };

  const handleUpload = async () => {
    if (!file || !analysis) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("bot_id", botId);

      const response = await fetch(`${ApiDomain}/file/ingress`, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      await response.json();
      toast.success("Tệp đã được tải lên thành công");
      handleClear();
      onClose();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Lỗi tải lên tệp");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Tải lên tệp</DialogTitle>
          <DialogDescription>
            Tải lên và phân tích tệp tài liệu, hỗ trợ .pdf, .doc, .docx, .txt
          </DialogDescription>
        </DialogHeader>

        {/* Upload Area */}
        <div className="flex flex-col space-y-4 py-2">
          <div
            className="flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition"
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                disabled={uploading}
              />
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="font-semibold text-gray-600">
                Nhấn để chọn tệp tài liệu
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Hỗ trợ: PDF, DOC, DOCX, TXT
              </span>
            </label>
          </div>

          {/* File info */}
          {file && (
            <div className="flex items-center gap-2 bg-muted/70 rounded px-3 py-2">
              <FileIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={handleClear}
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* File analysis */}
          {analysis && (
            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 bg-muted/40">
              <div>
                <div className="text-xs text-gray-500">Số từ:</div>
                <div className="font-semibold">{analysis.word_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Số hình ảnh:</div>
                <div className="font-semibold">{analysis.image_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Loại tệp:</div>
                <div className="font-semibold">{analysis.file_type}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={uploading && !file}
            type="button"
          >
            Xóa
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleClear();
              onClose();
            }}
            disabled={uploading}
            type="button"
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !analysis || uploading}
            type="button"
          >
            Tải lên
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;
