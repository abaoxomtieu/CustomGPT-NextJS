"use client";

import { useState } from "react";
import {
  Upload,
  X,
  ImageIcon,
  FileText,
  Loader2,
  Lightbulb,
} from "lucide-react";
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
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Trích Xuất Câu Hỏi Từ Hình Ảnh
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Tải lên các hình ảnh chứa đề bài để hệ thống tự động trích xuất
                và phân tách các câu hỏi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                  Hướng dẫn sử dụng:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Chọn các file hình ảnh có chứa đề bài (JPG, PNG, WebP)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Hệ thống sẽ tự động nhận dạng và tách các câu hỏi
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Bạn có thể chỉnh sửa câu hỏi sau khi trích xuất
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Hình ảnh nên có chất lượng tốt và chữ rõ nét
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                Đang xử lý hình ảnh và trích xuất câu hỏi... Vui lòng đợi trong
                giây lát.
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
