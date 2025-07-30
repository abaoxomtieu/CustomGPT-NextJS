import React, { useState, useRef, useEffect } from "react";
import { message, Button, Tree } from "antd";
import {
  FolderOpenOutlined,
  FolderOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  file?: File;
  size?: number;
  extension?: string;
}

export interface FolderStructure {
  rootName: string;
  files: FileNode[];
  totalFiles: number;
  totalSize: number;
}

export interface CodeExecutionContext {
  selectedFile: FileNode | null;
  folderStructure: FolderStructure | null;
  isExecuting: boolean;
  output: string[];
  error?: string;
}
interface RedirectData {
  folderData: any;
  assignmentId: string;
  assignmentData?: any;
  failedFiles?: string[];
}

interface FolderUploaderProps {
  onFolderStructureChange: (structure: FolderStructure | null) => void;
  onFileSelect: (file: FileNode) => void;
  executionContext: CodeExecutionContext;
  redirectData?: RedirectData | null;
  onRedirectDataUsed?: () => void;
}

export const FolderUploader: React.FC<FolderUploaderProps> = ({
  onFolderStructureChange,
  onFileSelect,
  executionContext,
  redirectData,
  onRedirectDataUsed,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Handle redirect data from Assignment Grading
  useEffect(() => {
    if (redirectData && redirectData.folderData) {
      handleRedirectData(redirectData);
      if (onRedirectDataUsed) {
        onRedirectDataUsed();
      }
    }
  }, [redirectData, onRedirectDataUsed]);

  // Process redirect data to create folder structure
  const handleRedirectData = async (data: RedirectData) => {
    try {
      setIsProcessing(true);
      messageApi.loading("Processing redirected folder data...", 0);

      const { folderData, assignmentData, failedFiles } = data;

      // Create files from the redirect data
      const files: File[] = [];

      for (const fileInfo of folderData.files) {
        // Create a File object from the content
        const blob = new Blob([fileInfo.content], { type: "text/plain" });
        const file = new File([blob], fileInfo.name, {
          type: "text/plain",
          lastModified: Date.now(),
        });

        // Add the webkitRelativePath property to preserve structure
        Object.defineProperty(file, "webkitRelativePath", {
          value: fileInfo.path,
          writable: false,
        });

        files.push(file);
      }

      // Filter only Python files
      const pythonFiles = files.filter((file) => {
        const extension = file.name.toLowerCase();
        return extension.endsWith(".py");
      });

      if (pythonFiles.length === 0) {
        messageApi.destroy();
        messageApi.error("No Python files found in the redirected data");
        return;
      }

      // Create folder structure
      const structure = processFolderStructure(pythonFiles);

      messageApi.destroy();
      messageApi.success(
        `Successfully loaded project from Assignment Grading (${
          structure.totalFiles
        } Python files)${
          failedFiles && failedFiles.length > 0
            ? ` - ${failedFiles.length} files had execution errors`
            : ""
        }`
      );

      // Show assignment context info
      if (assignmentData) {
        messageApi.info(
          `Assignment Context: ${assignmentData.exercise_name}`,
          3
        );
      }

      onFolderStructureChange(structure);
    } catch (error) {
      messageApi.destroy();
      messageApi.error("Error processing redirected folder data");
      console.error("Redirect data processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process files to create folder structure
  const processFolderStructure = (files: File[]): FolderStructure => {
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

    return {
      rootName: firstPath.split("/")[0],
      files: rootNodes,
      totalFiles: files.filter((f) => f.name.endsWith(".py")).length,
      totalSize,
    };
  };

  // Convert FileNode to Antd Tree DataNode
  const convertToTreeData = (nodes: FileNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.path,
      title: (
        <div className="flex items-center space-x-2 w-full">
          {node.type === "folder" ? (
            <FolderOutlined className="text-blue-500 text-xs" />
          ) : (
            <FileTextOutlined
              className={`text-xs ${
                node.extension === "py" ? "text-green-600" : "text-gray-400"
              }`}
            />
          )}
          <span
            className={`truncate text-xs ${
              node.type === "folder"
                ? "font-medium text-gray-900"
                : node.extension === "py"
                ? "text-blue-600 cursor-pointer hover:text-blue-800"
                : "text-gray-600"
            }`}
            onClick={(e) => {
              if (node.type === "file" && node.extension === "py") {
                e.stopPropagation();
                onFileSelect(node);
              }
            }}
            title={node.name}
          >
            {node.name}
          </span>
        </div>
      ),
      children: node.children ? convertToTreeData(node.children) : undefined,
      isLeaf: node.type === "file",
      selectable: node.type === "file" && node.extension === "py",
    }));
  };

  // Handle tree node selection
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const selectedPath = selectedKeys[0] as string;

      // Find the selected node
      const findNode = (nodes: FileNode[], path: string): FileNode | null => {
        for (const node of nodes) {
          if (node.path === path) {
            return node;
          }
          if (node.type === "folder" && node.children) {
            const found = findNode(node.children, path);
            if (found) return found;
          }
        }
        return null;
      };

      if (executionContext.folderStructure) {
        const selectedNode = findNode(
          executionContext.folderStructure.files,
          selectedPath
        );
        if (
          selectedNode &&
          selectedNode.type === "file" &&
          selectedNode.extension === "py"
        ) {
          onFileSelect(selectedNode);
        }
      }
    }
  };

  // Handle folder selection
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    messageApi.loading("Processing folder structure...", 0);

    try {
      // Filter only Python files and __init__.py files
      const pythonFiles = files.filter((file) => {
        const extension = file.name.toLowerCase();
        return extension.endsWith(".py");
      });

      if (pythonFiles.length === 0) {
        messageApi.destroy();
        messageApi.error("No Python files found in the selected folder");
        return;
      }

      // Create folder structure
      const structure = processFolderStructure(pythonFiles);

      messageApi.destroy();
      messageApi.success(
        `Successfully processed folder with ${structure.totalFiles} Python files`
      );

      onFolderStructureChange(structure);
    } catch (error) {
      messageApi.destroy();
      messageApi.error("Error processing folder structure");
      console.error("Folder processing error:", error);
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

    const items = e.dataTransfer.items;
    if (!items) return;

    setIsProcessing(true);
    messageApi.loading("Processing dropped folder...", 0);

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
              if (file.name.toLowerCase().endsWith(".py")) {
                // Add webkitRelativePath property
                const relativePath = path ? `${path}/${file.name}` : file.name;
                Object.defineProperty(file, "webkitRelativePath", {
                  value: relativePath,
                  writable: false,
                });
                files.push(file);
              }
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

      if (files.length === 0) {
        messageApi.destroy();
        messageApi.warning("No Python files found in the dropped folder");
        return;
      }

      const structure = processFolderStructure(files);

      messageApi.destroy();
      messageApi.success(
        `Successfully processed folder with ${structure.totalFiles} Python files`
      );

      onFolderStructureChange(structure);
    } catch (error) {
      messageApi.destroy();
      messageApi.error("Error processing dropped folder");
      console.error("Drop error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {contextHolder}
      {/* Sidebar Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FolderOpenOutlined className="text-blue-600" />
            <span className="font-medium text-gray-900">EXPLORER</span>
          </div>
          <Button
            type="text"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => folderInputRef.current?.click()}
            loading={isProcessing}
            title="Select Folder"
          />
        </div>

        {executionContext.folderStructure && (
          <div className="text-xs text-gray-500">
            {executionContext.folderStructure.totalFiles} Python files •{" "}
            {formatFileSize(executionContext.folderStructure.totalSize)}
          </div>
        )}
      </div>

      {/* File Tree Content */}
      <div className="flex-1 overflow-auto">
        {!executionContext.folderStructure ? (
          /* Upload Area when no folder is loaded */
          <div className="h-full flex items-center justify-center p-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full ${
                isDragOver
                  ? "border-blue-400 bg-blue-50"
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
              <FolderOutlined
                className={`text-3xl mb-3 ${
                  isDragOver ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop folder here
              </p>
              <p className="text-xs text-gray-500 mb-3">
                or click Select Folder above
              </p>
              <Button
                type="primary"
                size="small"
                onClick={() => folderInputRef.current?.click()}
                loading={isProcessing}
              >
                Browse
              </Button>
            </div>
          </div>
        ) : (
          /* File Tree */
          <div className="p-2">
            <div className="mb-2 px-2">
              <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                <FolderOutlined />
                <span className="uppercase">
                  {executionContext.folderStructure.rootName}
                </span>
              </div>
            </div>

            <Tree
              showIcon={false}
              defaultExpandAll
              selectable
              onSelect={handleTreeSelect}
              selectedKeys={
                executionContext.selectedFile
                  ? [executionContext.selectedFile.path]
                  : []
              }
              treeData={convertToTreeData(
                executionContext.folderStructure.files
              )}
              className="bg-transparent border-none"
              style={{
                fontSize: "13px",
                lineHeight: "22px",
              }}
            />
          </div>
        )}
      </div>

      {/* Selected File Info - Bottom Panel */}
      {executionContext.selectedFile && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
          <div className="text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <FileTextOutlined className="text-green-600" />
              <span className="font-medium text-gray-900 truncate">
                {executionContext.selectedFile.name}
              </span>
            </div>
            <div className="text-gray-500 truncate">
              {executionContext.selectedFile.path}
            </div>
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
        accept=".py"
      />
    </div>
  );
};
