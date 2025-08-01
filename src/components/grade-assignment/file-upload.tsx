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
          className={`border-2 border-dashed cursor-pointer transition-colors h-full ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-4 text-center h-full flex flex-col justify-center">
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-2">
              {placeholder}
            </p>
            <Button variant="outline" size="sm">
              Chọn file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 h-full">
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {uploadedFile.type.startsWith('image/') ? (
                  <Image className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <File className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-100 h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
