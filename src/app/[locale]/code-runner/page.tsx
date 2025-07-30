"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  GitBranch,
  Play,
  Loader2,
  Code2,
  Folder,
  FolderOpen,
  File,
  FileText,
} from "lucide-react";
import { ApiDomain } from "@/constant";
import EnhancedIDEEditor from "@/components/code-runner/enhanced-ide-editor";

// Enhanced folder upload interfaces
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

// Input analysis interfaces
interface InputPattern {
  type: string;
  line_number: number;
  variable_name?: string;
  prompt_message?: string;
  data_type?: string;
  raw_code: string;
}

interface InputAnalysisResult {
  language: string;
  total_inputs: number;
  input_patterns: InputPattern[];
  suggestions: string[];
}

const CodeRunnerPage = () => {
  const [language, setLanguage] = useState("python");
  const [mainFiles, setMainFiles] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"repo" | "upload">("repo");
  const [isDragOver, setIsDragOver] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Enhanced folder upload states
  const [folderStructure, setFolderStructure] =
    useState<FolderStructure | null>(null);
  const [selectedFileNode, setSelectedFileNode] = useState<FileNode | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Input analysis states
  const [inputAnalysis, setInputAnalysis] =
    useState<InputAnalysisResult | null>(null);
  const [userInputValues, setUserInputValues] = useState<string[]>([]);
  const [showInputForm, setShowInputForm] = useState(false);
  const [analyzingInputs, setAnalyzingInputs] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<string>("");

  // Debug function to show rate limit status
  const updateRateLimitStatus = (status: string) => {
    setRateLimitStatus(status);
    setTimeout(() => setRateLimitStatus(""), 3000); // Clear after 3 seconds
  };

  // Language detection function
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "py":
        return "Python";
      case "java":
      case "class": // Java compiled bytecode
        return "Java";
      case "c":
        return "C";
      case "cpp":
      case "cc":
      case "cxx":
        return "C++";
      case "js":
      case "jsx":
        return "JavaScript";
      case "ts":
      case "tsx":
        return "TypeScript";
      case "html":
        return "HTML";
      case "css":
        return "CSS";
      case "json":
        return "JSON";
      default:
        return "Text";
    }
  };

  // Auto-detect language from files array (prioritizes executables)
  const detectLanguageFromFiles = (files: File[]): string => {
    // Sort files by priority: executable first (.class, .jar), then source files
    const fileExtensions = files
      .map((file) => file.name.split(".").pop()?.toLowerCase())
      .filter(Boolean) as string[];

    // Java executables (.class files)
    if (fileExtensions.includes("class")) return "java";
    if (fileExtensions.includes("jar")) return "java";

    // C/C++ executables
    if (fileExtensions.includes("exe")) return "cpp";
    if (fileExtensions.includes("out")) return "cpp";

    // Source files by priority
    const languageMap: { [key: string]: string } = {
      py: "python",
      java: "java",
      cpp: "cpp",
      cc: "cpp",
      cxx: "cpp",
      c: "c",
      js: "javascript",
      ts: "typescript",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      kt: "kotlin",
      scala: "scala",
      sh: "bash",
      cs: "csharp",
    };

    for (const ext of fileExtensions) {
      if (languageMap[ext]) {
        return languageMap[ext];
      }
    }

    return "python"; // Default
  };

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

  // Enhanced drag and drop events - unified for both files and folders
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

    console.log("=== Enhanced Unified Drag & Drop Event ===");
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

      // For classic mode, we still need FileList for compatibility
      const fileList = new DataTransfer();
      files.forEach((file) => fileList.items.add(file));
      const fileListObject = fileList.files;

      if (validateFileSize(fileListObject)) {
        // Create folder structure for enhanced display if multiple files with paths
        const hasFolder = files.some(
          (f) =>
            (f as any).webkitRelativePath &&
            (f as any).webkitRelativePath.includes("/")
        );
        if (hasFolder) {
          const structure = processFolderStructure(files);
          setFolderStructure(structure);

          // Auto-expand root folders
          const rootFolderPaths = structure.files
            .filter((node) => node.type === "folder")
            .map((node) => node.path);
          setOpenFolders(new Set(rootFolderPaths));
        } else {
          setFolderStructure(null);
        }

        setFiles(fileListObject);
        setMainFiles([]);
        setError(null);
      }
    } catch (error) {
      console.error("Error processing dropped files:", error);
      setError("Error processing dropped files");
    } finally {
      setIsProcessing(false);
    }
  };

  // Unified file/folder selection handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log("=== Unified File/Folder Input Selection ===");
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
      // For classic mode, we still need FileList for compatibility
      const fileList = new DataTransfer();
      files.forEach((file) => fileList.items.add(file));
      const fileListObject = fileList.files;

      if (validateFileSize(fileListObject)) {
        // Create folder structure for enhanced display if multiple files with paths
        const hasFolder = files.some(
          (f) =>
            (f as any).webkitRelativePath &&
            (f as any).webkitRelativePath.includes("/")
        );
        if (hasFolder) {
          const structure = processFolderStructure(files);
          setFolderStructure(structure);

          // Auto-expand root folders
          const rootFolderPaths = structure.files
            .filter((node) => node.type === "folder")
            .map((node) => node.path);
          setOpenFolders(new Set(rootFolderPaths));
        } else {
          setFolderStructure(null);
        }

        setFiles(fileListObject);
        setMainFiles([]);
        setError(null);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      setError("Error processing files");
    } finally {
      setIsProcessing(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  // Calculate total size of files
  const calculateTotalSize = (filesList: FileList) => {
    let total = 0;
    for (let i = 0; i < filesList.length; i++) {
      total += filesList[i].size;
    }
    return total;
  };

  // Validate file size
  const validateFileSize = (filesList: FileList) => {
    const total = calculateTotalSize(filesList);
    setTotalSize(total);

    if (total > MAX_SIZE_BYTES) {
      setError(
        `Total file size (${(total / 1024 / 1024).toFixed(
          2
        )}MB) exceeds the ${MAX_SIZE_MB}MB limit.`
      );
      return false;
    }
    return true;
  };

  // Clear main files when switching upload modes
  const handleUploadModeChange = (mode: "repo" | "upload") => {
    setUploadMode(mode);
    setMainFiles([]);
    setFiles(null);
    setRepoUrl("");
    setTotalSize(0);
    setError(null);
    setFolderStructure(null);
    setSelectedFileNode(null);
    setOpenFolders(new Set());
  };

  // Toggle folder open/close
  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  // Render folder tree
  const renderFileTree = (nodes: FileNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: `${level * 16}px` }}>
        {node.type === "folder" ? (
          <div
            className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
            onClick={() => toggleFolder(node.path)}
          >
            {openFolders.has(node.path) ? (
              <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 mr-2 text-blue-500" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
          </div>
        ) : (
          <div
            className={`flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded ${
              selectedFileNode?.id === node.id ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedFileNode(node)}
          >
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{node.name}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {getLanguageFromExtension(node.name)}
            </Badge>
            {node.size && (
              <span className="ml-auto text-xs text-gray-400">
                {(node.size / 1024).toFixed(1)}KB
              </span>
            )}
          </div>
        )}
        {node.type === "folder" &&
          openFolders.has(node.path) &&
          node.children &&
          renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  // Analyze inputs for specific code content (simple API)
  const analyzeCodeContent = async (
    codeContent: string,
    language: string
  ): Promise<InputAnalysisResult | null> => {
    if (!codeContent.trim()) {
      console.log("No code content to analyze");
      return null;
    }

    setAnalyzingInputs(true);
    try {
      const formData = new FormData();
      formData.append("code_content", codeContent);
      formData.append("language", language);

      const response = await fetch(`${ApiDomain}/code/analyze-inputs`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle rate limiting gracefully
        if (response.status === 429) {
          console.warn("Rate limit exceeded, skipping analysis");
          updateRateLimitStatus("Rate limit exceeded - analysis skipped");
          return null; // Don't show error for rate limiting
        }

        throw new Error(errorData.detail || "Failed to analyze inputs");
      }

      const data = await response.json();
      console.log("Input analysis result:", data);
      return data;
    } catch (err: any) {
      // Only log errors that are not rate limiting
      if (!err.message.includes("Rate limit")) {
        console.error("Input analysis error:", err);
        setError(`Input analysis failed: ${err.message}`);
      }
      return null;
    } finally {
      setAnalyzingInputs(false);
    }
  };

  // Analyze inputs API call (legacy for file-based analysis)
  const analyzeInputs = async (): Promise<InputAnalysisResult | null> => {
    if (!files || files.length === 0) {
      console.log("No files to analyze");
      return null;
    }

    setAnalyzingInputs(true);
    try {
      const formData = new FormData();

      // Add files
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      // Add main files
      formData.append("main_files", JSON.stringify(mainFiles));

      // Add repo URL if in repo mode
      if (uploadMode === "repo" && repoUrl) {
        formData.append("repo_url", repoUrl);
      }

      const response = await fetch(`${ApiDomain}/code/analyze-inputs`, {
        method: "POST",
        body: formData,
      });
      console.log("Analyzing inputs with form data:", {
        response,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze inputs");
      }

      const data = await response.json();
      console.log("Input analysis result:", data);
      return data;
    } catch (err: any) {
      console.error("Input analysis error:", err);
      setError(`Input analysis failed: ${err.message}`);
      return null;
    } finally {
      setAnalyzingInputs(false);
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Analyze inputs first
      console.log("Step 1: Analyzing inputs...");
      const inputAnalysisResult = await analyzeInputs();
      console.log("Input analysis result:", inputAnalysisResult);

      if (inputAnalysisResult) {
        setInputAnalysis(inputAnalysisResult);

        // If inputs are required, show the input form
        if (
          inputAnalysisResult.total_inputs > 0 &&
          inputAnalysisResult.input_patterns.length > 0
        ) {
          console.log("Inputs required, showing input form");
          setShowInputForm(true);
          setUserInputValues(
            new Array(inputAnalysisResult.input_patterns.length).fill("")
          );
          setLoading(false);
          return;
        }
      }

      // Step 2: Execute code (no inputs required or analysis failed)
      await executeCode([]);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const executeCode = async (inputData: string[]) => {
    console.log("Executing code with input data:", inputData);

    const formData = new FormData();
    // Language is now auto-detected by the backend, no need to send it
    formData.append("main_files", JSON.stringify(mainFiles));

    // Add input data if provided
    if (inputData.length > 0) {
      formData.append("input_data", JSON.stringify(inputData));
    }

    if (uploadMode === "repo") {
      if (!repoUrl) {
        setError("Please enter a repository URL.");
        setLoading(false);
        return;
      }
      formData.append("repo_url", repoUrl);
    } else {
      if (!files || files.length === 0) {
        setError("Please select files to upload.");
        setLoading(false);
        return;
      }
      if (mainFiles.length === 0) {
        setError("Please select at least one main file to execute.");
        setLoading(false);
        return;
      }
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      const response = await fetch(`${ApiDomain}/code/judge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Execute code for IDE mode
  const executeCodeIDE = async (inputData: string[]) => {
    console.log("Executing code in IDE mode with input data:", inputData);

    const formData = new FormData();

    // Add input data if provided
    if (inputData.length > 0) {
      formData.append("input_data", JSON.stringify(inputData));
    }

    if (uploadMode === "repo") {
      if (!repoUrl) {
        setError("Please enter a repository URL.");
        setLoading(false);
        return;
      }
      formData.append("repo_url", repoUrl);
      formData.append("main_files", JSON.stringify(mainFiles));
    } else {
      if (!files || files.length === 0) {
        setError("Please select files to upload.");
        setLoading(false);
        return;
      }
      if (mainFiles.length === 0) {
        setError("Please select at least one main file to execute.");
        setLoading(false);
        return;
      }
      formData.append("main_files", JSON.stringify(mainFiles));
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      const response = await fetch(`${ApiDomain}/code/judge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input form submission
  const handleInputSubmit = async () => {
    console.log("Submitting inputs:", userInputValues);
    setLoading(true);
    setShowInputForm(false);

    try {
      await executeCode(userInputValues);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle input value change
  const handleInputChange = (index: number, value: string) => {
    const newValues = [...userInputValues];
    newValues[index] = value;
    setUserInputValues(newValues);
  };

  // Cancel input form
  const handleInputCancel = () => {
    setShowInputForm(false);
    setInputAnalysis(null);
    setUserInputValues([]);
    setLoading(false);
  };

  return (
    <Tabs defaultValue="ide" className="w-full h-screen">
      <TabsContent value="classic">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="max-w-7xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-between">
                  Code Runner
                  <TabsList className="grid grid-cols-2 w-64">
                    <TabsTrigger value="ide">IDE Mode</TabsTrigger>

                    <TabsTrigger value="classic">Classic Mode</TabsTrigger>
                  </TabsList>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Input Form Modal */}
                {showInputForm && inputAnalysis && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="max-w-2xl w-full mx-4">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Code2 className="h-5 w-5 mr-2" />
                          Program Inputs Required
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          This program requires {inputAnalysis.total_inputs}{" "}
                          input(s). Please provide the values below:
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {inputAnalysis.input_patterns.map(
                            (pattern, index) => (
                              <div key={index} className="space-y-2">
                                <Label htmlFor={`input-${index}`}>
                                  Input {index + 1}
                                  {pattern.variable_name && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({pattern.variable_name})
                                    </span>
                                  )}
                                </Label>
                                <Input
                                  id={`input-${index}`}
                                  placeholder={
                                    pattern.data_type || "Enter value"
                                  }
                                  value={userInputValues[index] || ""}
                                  onChange={(e) =>
                                    handleInputChange(index, e.target.value)
                                  }
                                  className="w-full"
                                />
                                {pattern.prompt_message && (
                                  <p className="text-xs text-gray-400">
                                    Prompt: {pattern.prompt_message}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Line {pattern.line_number}: {pattern.raw_code}
                                </p>
                              </div>
                            )
                          )}

                          {inputAnalysis.suggestions.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">
                                Suggestions:
                              </h4>
                              <ul className="text-xs text-blue-700 space-y-1">
                                {inputAnalysis.suggestions.map(
                                  (suggestion, index) => (
                                    <li key={index}>• {suggestion}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={handleInputCancel}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleInputSubmit}
                              disabled={
                                loading ||
                                userInputValues.some((val) => val.trim() === "")
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Run with Inputs
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      {files && files.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="default"
                            className="text-sm py-2 px-3"
                          >
                            Auto-detected:{" "}
                            {(() => {
                              // Auto-detect language from first main file or first code file
                              const firstMainFile = mainFiles[0];
                              if (firstMainFile) {
                                return getLanguageFromExtension(firstMainFile);
                              }

                              // Find first code file
                              const codeFile = Array.from(files).find((f) => {
                                const ext = f.name
                                  .split(".")
                                  .pop()
                                  ?.toLowerCase();
                                return [
                                  "py",
                                  "java",
                                  "c",
                                  "cpp",
                                  "js",
                                  "ts",
                                ].includes(ext || "");
                              });

                              return codeFile
                                ? getLanguageFromExtension(codeFile.name)
                                : "Unknown";
                            })()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            (Language is automatically detected from file
                            extensions)
                          </span>
                        </div>
                      ) : (
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="main-files">Main Files</Label>
                      <Input
                        id="main-files"
                        value={mainFiles.join(", ")}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Button
                        variant={uploadMode === "repo" ? "default" : "outline"}
                        onClick={() => handleUploadModeChange("repo")}
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        Git Repository
                      </Button>
                      <Button
                        variant={
                          uploadMode === "upload" ? "default" : "outline"
                        }
                        onClick={() => handleUploadModeChange("upload")}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files/Folders
                      </Button>
                    </div>

                    {uploadMode === "repo" ? (
                      <div>
                        <Label htmlFor="repo-url">Repository URL</Label>
                        <Input
                          id="repo-url"
                          placeholder="https://github.com/user/repo.git"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum repository size: {MAX_SIZE_MB}MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Label>Upload Files or Folders</Label>
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                          <strong>Enhanced Upload:</strong> Drag & drop files or
                          folders. Use "Choose Files" for individual files or
                          "Choose Folder" for entire folders.
                        </div>
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragOver
                              ? "border-primary bg-primary/5"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {isProcessing ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                              <p className="mt-4 text-lg font-medium">
                                Processing files...
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <p className="text-lg font-medium">
                                  {isDragOver
                                    ? "Drop files or folders here"
                                    : "Drag and drop files or folders here"}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  or use the buttons below to browse
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Maximum total size: {MAX_SIZE_MB}MB
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* File selection buttons */}
                        <div className="flex gap-2 mt-4">
                          <label htmlFor="file-input" className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full"
                              type="button"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Choose Files
                            </Button>
                          </label>
                          <label htmlFor="folder-input" className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full"
                              type="button"
                            >
                              <Folder className="mr-2 h-4 w-4" />
                              Choose Folder
                            </Button>
                          </label>
                        </div>

                        {/* Hidden file inputs */}
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          multiple
                        />
                        <input
                          ref={folderInputRef}
                          id="folder-input"
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          {...({ webkitdirectory: "" } as any)}
                        />

                        {files && files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-sm text-gray-600">
                              {files.length} file(s) uploaded
                            </div>
                            <div className="text-sm text-gray-500">
                              Total size: {(totalSize / 1024 / 1024).toFixed(2)}
                              MB / {MAX_SIZE_MB}MB
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  totalSize > MAX_SIZE_BYTES
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (totalSize / MAX_SIZE_BYTES) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Enhanced folder structure display */}
                        {folderStructure && (
                          <div className="mt-4">
                            <Label>Folder Structure:</Label>
                            <Card className="mt-2">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center">
                                  <Folder className="h-4 w-4 mr-2" />
                                  {folderStructure.rootName}
                                  <Badge variant="outline" className="ml-2">
                                    {folderStructure.totalFiles} files
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <ScrollArea className="h-48">
                                  {renderFileTree(folderStructure.files)}
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {files && (
                          <div className="mt-4">
                            <Label>Select Main File(s) to Execute:</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {Array.from(files).map((file) => {
                                const isCodeFile = [
                                  "py",
                                  "java",
                                  "c",
                                  "cpp",
                                  "js",
                                  "ts",
                                ].includes(
                                  file.name.split(".").pop()?.toLowerCase() ||
                                    ""
                                );
                                // Use webkitRelativePath if available (for folders), otherwise use file.name
                                const filePath =
                                  (file as any).webkitRelativePath || file.name;
                                const displayName = filePath;

                                return (
                                  <div
                                    key={filePath}
                                    className={`flex items-center p-2 rounded ${
                                      isCodeFile
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={mainFiles.includes(filePath)}
                                      onChange={() =>
                                        setMainFiles((prev) =>
                                          prev.includes(filePath)
                                            ? prev.filter((f) => f !== filePath)
                                            : [...prev, filePath]
                                        )
                                      }
                                      className="mr-3"
                                    />
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="flex-1">
                                      {displayName}
                                    </span>
                                    <Badge variant="secondary" className="ml-2">
                                      {getLanguageFromExtension(file.name)}
                                    </Badge>
                                    {isCodeFile && (
                                      <Badge
                                        variant="default"
                                        className="ml-2 bg-green-500"
                                      >
                                        Executable
                                      </Badge>
                                    )}
                                    <span className="ml-2 text-xs text-gray-400">
                                      {(file.size / 1024).toFixed(1)}KB
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleRunCode}
                    disabled={loading || analyzingInputs}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Code
                      </>
                    ) : analyzingInputs ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Inputs
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Code
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Result</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Exit Code</Label>
                          <p
                            className={`font-mono ${
                              result.exit_code === 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {result.exit_code}
                          </p>
                        </div>
                        <div>
                          <Label>Execution Time</Label>
                          <p className="font-mono">
                            {result.execution_time.toFixed(4)}s
                          </p>
                        </div>
                        <div>
                          <Label>Standard Output</Label>
                          <Textarea
                            readOnly
                            value={result.stdout}
                            className="font-mono h-40 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <Label>Standard Error</Label>
                          <Textarea
                            readOnly
                            value={result.stderr}
                            className="font-mono h-40 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="ide" className="h-screen bg-background">
        <div className="h-full flex flex-col">
          {/* IDE Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">Code Runner - IDE Mode</h1>
              </div>
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="ide">IDE Mode</TabsTrigger>

                <TabsTrigger value="classic">Classic Mode</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* IDE Content */}
          <div className="flex-1 overflow-hidden">
            <EnhancedIDEEditor
              initialFiles={files}
              onInputAnalysisRequired={(
                analysis: InputAnalysisResult | null
              ) => {
                setInputAnalysis(analysis);
                // Don't set showInputForm for IDE mode - it's handled internally
              }}
              onAnalyzeCodeContent={analyzeCodeContent}
              analyzingInputs={analyzingInputs}
              inputAnalysis={inputAnalysis}
              externalResult={result}
              isExternalRunning={loading}
              onRunWithInputs={async (inputData: string[]) => {
                setLoading(true);
                setInputAnalysis(null);
                setResult(null); // Clear previous result
                try {
                  await executeCodeIDE(inputData);
                } catch (err: any) {
                  setError(err.message);
                  setLoading(false);
                }
              }}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CodeRunnerPage;
