'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  uploadedFile?: File | null;
  accept?: string;
  placeholder?: string;
  className?: string;
}

export default function FileUpload({ 
  onFileChange, 
  uploadedFile, 
  accept = "image/*",
  placeholder = "Kéo thả file hoặc click để chọn file",
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!uploadedFile ? (
        <Card 
          className={`group border-2 border-dashed cursor-pointer transition-all duration-300 h-full hover:shadow-lg ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-3 text-center h-full flex flex-col justify-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver 
                ? 'bg-blue-100 dark:bg-blue-800' 
                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-800'
            }`}>
              <Upload className={`h-6 w-6 transition-all duration-300 ${
                isDragOver 
                  ? 'text-blue-600 scale-110' 
                  : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-110'
              }`} />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {placeholder}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-300 text-xs px-2 py-1 h-7"
            >
              <Upload className="h-3 w-3 mr-1" />
              Chọn file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 h-full shadow-md">
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                  {uploadedFile.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <File className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-green-800 dark:text-green-200 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700 dark:text-green-300">Đã tải lên</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 flex-shrink-0 transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
