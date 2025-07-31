"use client";

import { useState } from "react";
import { Upload, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gradeAssignmentApiService, ExtractedData } from "@/services/grade-assignment-service";
import { toast } from "sonner";

interface ImageUploadDropzoneProps {
  onExtractComplete: (data: ExtractedData) => void;
  onExtractStart: () => void;
  isLoading: boolean;
}

const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  onExtractComplete,
  onExtractStart,
  isLoading,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== files.length) {
      setError("Chỉ chấp nhận các file hình ảnh (jpg, png, etc.)");
    }

    if (imageFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== files.length) {
      setError("Chỉ chấp nhận các file hình ảnh (jpg, png, etc.)");
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const handleExtract = async () => {
    if (selectedFiles.length === 0) {
      setError("Vui lòng chọn ít nhất một hình ảnh");
      return;
    }

    try {
      onExtractStart();
      setError(null);

      const { data, error } = await gradeAssignmentApiService.extractTextFromImages(selectedFiles);

      if (error) {
        setError(error);
        toast.error(error);
        return;
      }

      if (data) {
        onExtractComplete(data);
        // toast.success("Trích xuất văn bản thành công!");
      }
    } catch (err) {
      const errorMessage = "Đã xảy ra lỗi khi trích xuất văn bản";
      setError(errorMessage);
      // toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('image-file-input')?.click()}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          <div>
            <p className="text-xs sm:text-sm font-medium">
              {isDragOver
                ? "Thả hình ảnh vào đây..."
                : "Kéo thả hình ảnh hoặc click để chọn"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ: JPG, PNG, BMP, TIFF, WEBP
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id="image-file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              Đã chọn {selectedFiles.length} hình ảnh
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiles}
              disabled={isLoading}
            >
              Xóa tất cả
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-1 sm:gap-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded border"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Image className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                  className="ml-1 flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extract Button */}
      <Button
        onClick={handleExtract}
        disabled={selectedFiles.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang trích xuất...
          </>
        ) : (
          "Trích Xuất Văn Bản"
        )}
      </Button>
    </div>
  );
};

export default ImageUploadDropzone;