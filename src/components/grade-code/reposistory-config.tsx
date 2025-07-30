"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudDownload, Upload, Github, FolderOpen, MousePointerClick } from "lucide-react";
import { EXTENSION_OPTIONS } from "@/constant";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useCallback } from "react";

interface RepositoryConfigProps {
  repoUrl: string;
  loading: boolean;
  selectedExtensions: string[];
  onRepoUrlChange: (url: string) => void;
  onExtensionChange: (extensions: string[]) => void;
  onFetchFiles: () => void;
  onUploadFiles: (files: FileList) => void;
}

export default function RepositoryConfig({
  repoUrl,
  loading,
  selectedExtensions,
  onRepoUrlChange,
  onExtensionChange,
  onFetchFiles,
  onUploadFiles,
}: RepositoryConfigProps) {
  const t = useTranslations("codeGrader.repositoryConfig");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Handler for multi-select (simulate multi-select if needed)
  const handleSelectChange = (value: string) => {
    let newSelected: string[];
    if (selectedExtensions.includes(value)) {
      newSelected = selectedExtensions.filter((v) => v !== value);
    } else {
      newSelected = [...selectedExtensions, value];
    }
    onExtensionChange(newSelected);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUploadClick = () => {
    if (selectedFiles) {
      onUploadFiles(selectedFiles);
    }
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (items) {
      const files: File[] = [];
      
      // Process dropped items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry && entry.isDirectory) {
            // Handle directory drop
            try {
              await processDirectoryEntry(entry as FileSystemDirectoryEntry, files, '');
            } catch (error) {
              console.error('Error processing directory:', error);
            }
          } else {
            // Handle single file drop
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }
      }
      
      if (files.length > 0) {
        const fileList = createFileList(files);
        setSelectedFiles(fileList);
      }
    }
  }, []);

  const processDirectoryEntry = async (
    dirEntry: FileSystemDirectoryEntry, 
    files: File[], 
    path: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const dirReader = dirEntry.createReader();
      
      const readEntries = () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve();
            return;
          }
          
          const promises = entries.map(async (entry) => {
            const fullPath = path ? `${path}/${entry.name}` : entry.name;
            
            if (entry.isFile) {
              return new Promise<void>((fileResolve) => {
                (entry as FileSystemFileEntry).file((file) => {
                  // Create a new file with the full path
                  const fileWithPath = new File([file], file.name, {
                    type: file.type,
                    lastModified: file.lastModified,
                  });
                  // Add webkitRelativePath property
                  Object.defineProperty(fileWithPath, 'webkitRelativePath', {
                    value: fullPath,
                    writable: false
                  });
                  files.push(fileWithPath);
                  fileResolve();
                });
              });
            } else if (entry.isDirectory) {
              return processDirectoryEntry(entry as FileSystemDirectoryEntry, files, fullPath);
            }
          });
          
          await Promise.all(promises);
          readEntries(); // Continue reading if there are more entries
        });
      };
      
      readEntries();
    });
  };

  const createFileList = (files: File[]): FileList => {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    return dt.files;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    if (!selectedFiles) return 0;
    let total = 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      total += selectedFiles[i].size;
    }
    return total;
  };

  const totalSize = getTotalSize();
  const sizeLimit = 2 * 1024 * 1024; // 2MB
  const isOverLimit = totalSize > sizeLimit;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent 
        className="space-y-4 p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <Tabs defaultValue="repository" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="repository" className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              Repository
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="repository" className="space-y-3 mt-4">
            <Input
              value={repoUrl}
              onChange={(e) => onRepoUrlChange(e.target.value)}
              placeholder={t("placeholder")}
              className="rounded-lg text-sm h-8"
              disabled={loading}
            />
            <Button
              size="sm"
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-8 text-sm"
              onClick={onFetchFiles}
              disabled={loading || !repoUrl.trim()}
            >
              <CloudDownload className="mr-2 w-3.5 h-3.5" />
              {loading ? t("cloning") : t("cloneButton")}
            </Button>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-3 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              {...({ webkitdirectory: "" } as any)}
              style={{ display: 'none' }}
            />
            
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out ${
                isDragOver 
                  ? 'border-blue-primary bg-blue-primary/10 scale-[1.02] shadow-lg shadow-blue-primary/20' 
                  : 'border-gray-300 hover:border-blue-primary/50 hover:bg-blue-primary/5'
              } ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleChooseFiles}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-blue-primary/20 scale-110' 
                    : 'bg-gray-100 hover:bg-blue-primary/10'
                }`}>
                  {isDragOver ? (
                    <Upload className="w-8 h-8 text-blue-primary animate-bounce" />
                  ) : (
                    <FolderOpen className="w-8 h-8 text-gray-500 group-hover:text-blue-primary transition-colors" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className={`text-base font-medium transition-colors ${
                    isDragOver ? 'text-blue-primary' : 'text-gray-700'
                  }`}>
                    {isDragOver ? 'Drop your folder here!' : 'Drag & drop a project folder'}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <MousePointerClick className="w-4 h-4" />
                    or click to browse folders
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum size: 2MB
                  </p>
                </div>
              </div>
              
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-primary/5 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-blue-primary text-white px-4 py-2 rounded-lg font-medium shadow-lg animate-pulse">
                    Release to upload folder
                  </div>
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="w-full h-8 text-sm text-gray-500 hover:text-gray-700"
              onClick={handleChooseFiles}
              disabled={loading}
            >
              <FolderOpen className="mr-2 w-3.5 h-3.5" />
              Browse manually instead
            </Button>
            
            {selectedFiles && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen className="w-4 h-4 text-blue-primary" />
                    <span className="text-sm font-medium text-gray-700">
                      Folder Ready to Upload
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>{selectedFiles.length} files selected</span>
                    {totalSize > 0 && (
                      <span className={`font-medium ${isOverLimit ? 'text-red-500' : 'text-green-600'}`}>
                        {formatFileSize(totalSize)}
                      </span>
                    )}
                  </div>
                </div>
                
                {isOverLimit && (
                  <div className="text-xs text-red-500">
                    Size limit exceeded! Maximum allowed: {formatFileSize(sizeLimit)}
                  </div>
                )}
                
                <Button
                  size="sm"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 h-8 text-sm"
                  onClick={handleUploadClick}
                  disabled={loading || isOverLimit}
                >
                  <Upload className="mr-2 w-3.5 h-3.5" />
                  {loading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div>
          <div className="mb-2 text-sm font-medium text-foreground">
            {t("fileExtensions")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXTENSION_OPTIONS.map((opt, index) => (
              <Button
                key={index}
                variant={selectedExtensions.includes(opt.value) ? "default" : "outline"}
                size="sm"
                className={`h-6 px-2 text-xs rounded transition-colors ${
                  selectedExtensions.includes(opt.value) 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-background text-foreground border-foreground/20 hover:bg-foreground/5'
                }`}
                onClick={() => handleSelectChange(opt.value)}
                disabled={loading}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
