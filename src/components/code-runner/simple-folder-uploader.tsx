"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FolderOpen, File, Upload, Loader2 } from "lucide-react";

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

interface SimpleFolderUploaderProps {
  onFolderChange?: (structure: FolderStructure | null) => void;
  onFileSelect?: (fileNode: FileNode) => void;
}

const SimpleFolderUploader: React.FC<SimpleFolderUploaderProps> = ({
  onFolderChange,
  onFileSelect,
}) => {
  const [folderStructure, setFolderStructure] =
    useState<FolderStructure | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Process files to create folder structure
  const processFolderStructure = (files: File[]): FolderStructure => {
    console.log("=== Processing Folder Structure ===");
    console.log(
      "Input files:",
      files.map((f) => ({
        name: f.name,
        path: (f as any).webkitRelativePath || f.name,
        size: f.size,
      }))
    );

    const fileNodes: Map<string, FileNode> = new Map();
    const rootNodes: FileNode[] = [];

    // Sort files to ensure consistent ordering
    const sortedFiles = files.sort((a, b) => {
      const pathA = (a as any).webkitRelativePath || a.name;
      const pathB = (b as any).webkitRelativePath || b.name;
      return pathA.localeCompare(pathB);
    });

    let totalSize = 0;

    sortedFiles.forEach((file, index) => {
      totalSize += file.size;
      const relativePath = (file as any).webkitRelativePath || file.name;
      const pathParts = relativePath.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const extension = fileName.includes(".")
        ? fileName.split(".").pop()?.toLowerCase()
        : "";

      console.log(`Processing file ${index + 1}: ${relativePath}`);

      // Create file node
      const fileNode: FileNode = {
        id: `file-${index}`,
        name: fileName,
        path: relativePath,
        type: "file",
        file,
        size: file.size,
        extension,
      };

      fileNodes.set(relativePath, fileNode);

      // Create folder structure
      let currentPath = "";
      let currentLevel = rootNodes;

      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath += (currentPath ? "/" : "") + pathParts[i];

        let folder = fileNodes.get(currentPath);
        if (!folder) {
          console.log(`Creating folder: ${currentPath}`);
          folder = {
            id: `folder-${currentPath}`,
            name: pathParts[i],
            path: currentPath,
            type: "folder",
            children: [],
          };
          fileNodes.set(currentPath, folder);
          currentLevel.push(folder);
        }

        currentLevel = folder.children!;
      }

      // Add file to its parent folder
      currentLevel.push(fileNode);
    });

    const firstFile = sortedFiles[0];
    const firstPath = firstFile
      ? (firstFile as any).webkitRelativePath || firstFile.name
      : "uploaded-folder";

    const structure = {
      rootName: firstPath.split("/")[0],
      files: rootNodes,
      totalFiles: files.length,
      totalSize,
    };

    console.log("Created folder structure:", structure);
    return structure;
  };

  // Handle folder selection via input
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log("=== Folder Input Selection ===");
    console.log(
      "Selected files:",
      files.map((f) => ({
        name: f.name,
        path: (f as any).webkitRelativePath || f.name,
        size: f.size,
      }))
    );

    setIsProcessing(true);

    try {
      // Create folder structure
      const structure = processFolderStructure(files);
      setFolderStructure(structure);
      onFolderChange?.(structure);

      // Auto-expand root folders
      const rootFolderPaths = structure.files
        .filter((node) => node.type === "folder")
        .map((node) => node.path);
      setOpenFolders(new Set(rootFolderPaths));
    } catch (error) {
      console.error("Error processing folder structure:", error);
    } finally {
      setIsProcessing(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    console.log("=== Drag & Drop Event ===");
    const items = e.dataTransfer.items;
    if (!items) return;

    setIsProcessing(true);

    try {
      const files: File[] = [];

      const processEntry = async (
        entry: FileSystemEntry,
        path = ""
      ): Promise<void> => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          return new Promise((resolve) => {
            fileEntry.file((file) => {
              // Add webkitRelativePath property
              const relativePath = path ? `${path}/${file.name}` : file.name;
              Object.defineProperty(file, "webkitRelativePath", {
                value: relativePath,
                writable: false,
              });
              files.push(file);
              console.log(`Added file: ${relativePath}`);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const dirReader = dirEntry.createReader();
          const currentPath = path ? `${path}/${entry.name}` : entry.name;

          return new Promise((resolve) => {
            const readEntries = () => {
              dirReader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  resolve();
                  return;
                }

                for (const childEntry of entries) {
                  await processEntry(childEntry, currentPath);
                }

                readEntries();
              });
            };
            readEntries();
          });
        }
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await processEntry(entry);
          }
        }
      }

      console.log(
        "Processed files from drag & drop:",
        files.map((f) => ({
          name: f.name,
          path: (f as any).webkitRelativePath || f.name,
          size: f.size,
        }))
      );

      if (files.length === 0) {
        console.warn("No files found in dropped content");
        return;
      }

      const structure = processFolderStructure(files);
      setFolderStructure(structure);
      onFolderChange?.(structure);
    } catch (error) {
      console.error("Error processing dropped content:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle folder open/close
  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Handle file selection
  const handleFileSelect = (fileNode: FileNode) => {
    setSelectedFile(fileNode);
    onFileSelect?.(fileNode);
  };

  // Render file tree node
  const renderTreeNode = (
    node: FileNode,
    level: number = 0
  ): React.ReactNode => {
    const isFolder = node.type === "folder";
    const isOpen = openFolders.has(node.path);
    const paddingLeft = level * 16;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-muted cursor-pointer text-sm ${
            selectedFile?.path === node.path ? "bg-primary/20" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              handleFileSelect(node);
            }
          }}
        >
          {isFolder ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-blue-500" />
            )
          ) : (
            <File
              className={`w-4 h-4 mr-2 ${
                node.extension === "py"
                  ? "text-green-600"
                  : ["js", "ts", "jsx", "tsx"].includes(node.extension || "")
                  ? "text-yellow-600"
                  : ["java"].includes(node.extension || "")
                  ? "text-red-600"
                  : ["cpp", "c"].includes(node.extension || "")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
          )}
          <span className="truncate">{node.name}</span>
          {node.type === "file" && node.size && (
            <span className="ml-auto text-xs text-muted-foreground">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        {isFolder && isOpen && node.children && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-[400px] w-full border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center">
            <Folder className="w-4 h-4 mr-2" />
            Folder Explorer
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="h-6 w-6 p-0"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
          </Button>
        </div>

        {folderStructure && (
          <div className="text-xs text-muted-foreground">
            {folderStructure.totalFiles} files •{" "}
            {formatFileSize(folderStructure.totalSize)}
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-2">
          {!folderStructure ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
            >
              <Folder
                className={`w-8 h-8 mx-auto mb-2 ${
                  isDragOver ? "text-primary" : "text-gray-400"
                }`}
              />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop folder here
              </p>
              <p className="text-xs text-gray-500 mb-3">
                or click upload above
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => folderInputRef.current?.click()}
                disabled={isProcessing}
              >
                Browse Folder
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-2 px-2">
                <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                  <Folder className="w-3 h-3" />
                  <span className="uppercase">{folderStructure.rootName}</span>
                </div>
              </div>
              {folderStructure.files.map((node) => renderTreeNode(node))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="p-2 border-t bg-muted/10">
          <div className="text-xs space-y-1">
            <div className="font-medium text-gray-900 truncate">
              Selected: {selectedFile.name}
            </div>
            <div className="text-gray-500 truncate">{selectedFile.path}</div>
          </div>
        </div>
      )}

      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default SimpleFolderUploader;
