"use client";

import { useState } from "react";
import SimpleFolderUploader from "@/components/code-runner/simple-folder-uploader";

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  file?: File;
  size?: number;
  extension?: string;
}

interface FolderStructure {
  rootName: string;
  files: FileNode[];
  totalFiles: number;
  totalSize: number;
}

const TestFolderUpload = () => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // Language detection function
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'Python';
      case 'java': return 'Java';
      case 'c': return 'C';
      case 'cpp': case 'cc': case 'cxx': return 'C++';
      case 'js': case 'jsx': return 'JavaScript';
      case 'ts': case 'tsx': return 'TypeScript';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      default: return 'Text';
    }
  };

  const handleFolderChange = (structure: FolderStructure | null) => {
    console.log('Folder structure changed:', structure);
    setFolderStructure(structure);
  };

  const handleFileSelect = async (fileNode: FileNode) => {
    console.log('File selected:', fileNode);
    setSelectedFile(fileNode);
    
    if (fileNode.file) {
      try {
        const content = await fileNode.file.text();
        setFileContent(content);
      } catch (error) {
        console.error('Error reading file content:', error);
        setFileContent('Error reading file content');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Folder Upload</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folder Uploader */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Folder Uploader</h2>
          <SimpleFolderUploader 
            onFolderChange={handleFolderChange}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* File Content Display */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Selected File Content</h2>
          {selectedFile ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground">{selectedFile.path}</div>
              <div className="text-xs text-muted-foreground">
                Size: {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Unknown'}
              </div>
              {selectedFile.extension && (
                <div className="text-xs font-medium mt-1">
                  Language: <span className="px-2 py-1 bg-primary/20 rounded">
                    {getLanguageFromExtension(selectedFile.name)}
                  </span>
                </div>
              )}
            </div>              <div className="border rounded-lg">
                <div className="p-2 bg-muted/20 border-b">
                  <span className="text-sm font-medium">Content</span>
                </div>
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                  {fileContent || 'Loading...'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg text-muted-foreground">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {folderStructure && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <div className="p-4 bg-muted/20 rounded-lg">
            <h3 className="font-medium mb-2">Folder Structure</h3>
            <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
              {JSON.stringify(folderStructure, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestFolderUpload;
