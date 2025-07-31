"use client";

import { useState } from "react";
import { Upload, X, ImageIcon, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUploadDropzone from "./image-upload-dropzone";

interface ExtractQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtractComplete: (data: any) => void;
  onExtractStart: () => void;
  isLoading: boolean;
}

const ExtractQuestionsDialog: React.FC<ExtractQuestionsDialogProps> = ({
  open,
  onOpenChange,
  onExtractComplete,
  onExtractStart,
  isLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Trích Xuất Câu Hỏi Từ Hình Ảnh
          </DialogTitle>
          <DialogDescription className="text-sm space-y-2">
            <p>
              Tải lên các hình ảnh chứa đề bài để hệ thống tự động trích xuất và phân tách các câu hỏi.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Hướng dẫn sử dụng:</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Chọn các file hình ảnh có chứa đề bài (JPG, PNG, WebP)</li>
                <li>• Hệ thống sẽ tự động nhận dạng và tách các câu hỏi</li>
                <li>• Bạn có thể chỉnh sửa câu hỏi sau khi trích xuất</li>
                <li>• Hình ảnh nên có chất lượng tốt và chữ rõ nét</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <ImageUploadDropzone
                onExtractComplete={(data) => {
                  onExtractComplete(data);
                  onOpenChange(false);
                }}
                onExtractStart={onExtractStart}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Đang xử lý hình ảnh và trích xuất câu hỏi... Vui lòng đợi trong giây lát.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractQuestionsDialog;
