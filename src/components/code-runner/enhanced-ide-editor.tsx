"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiDomain } from "@/constant";
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { 
  Play, 
  Save, 
  FileText, 
  Folder, 
  FolderOpen, 
  File,
  Terminal,
  Settings,
  Plus,
  X,
  Loader2,
  Minimize2,
  Maximize2,
  Upload
} from "lucide-react";

// Import types from FolderUploader
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

interface FileContent {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface EnhancedIDEEditorProps {
  initialFiles?: FileList | null;
  onInputAnalysisRequired?: (analysis: InputAnalysisResult | null) => void;
  onAnalyzeCodeContent?: (codeContent: string, language: string) => Promise<InputAnalysisResult | null>;
  analyzingInputs?: boolean;
  inputAnalysis?: InputAnalysisResult | null;
  onRunWithInputs?: (inputData: string[]) => void;
  externalResult?: OutputData | null;
  isExternalRunning?: boolean;
}

interface OutputData {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time: number;
}

const EnhancedIDEEditor: React.FC<EnhancedIDEEditorProps> = ({ 
  initialFiles,
  onInputAnalysisRequired,
  onAnalyzeCodeContent,
  analyzingInputs = false,
  inputAnalysis,
  onRunWithInputs,
  externalResult,
  isExternalRunning = false
}) => {
  // Folder management states
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [selectedFileNode, setSelectedFileNode] = useState<FileNode | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Editor states
  const [openFiles, setOpenFiles] = useState<FileContent[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [showOutput, setShowOutput] = useState(false);
  const [outputMinimized, setOutputMinimized] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Input form states
  const [userInputValues, setUserInputValues] = useState<string[]>([]);
  const [showInputForm, setShowInputForm] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalyzedRef = useRef<string>('');

  // Memoize analysis function to prevent unnecessary re-creation
  const analyzeCurrentFile = useCallback(async () => {
    console.log('=== analyzeCurrentFile called ===');
    console.log('activeFile:', activeFile);
    console.log('onAnalyzeCodeContent:', !!onAnalyzeCodeContent);
    console.log('onInputAnalysisRequired:', !!onInputAnalysisRequired);
    
    if (!activeFile || !onAnalyzeCodeContent || !onInputAnalysisRequired) {
      console.log('Early return: missing required params');
      return;
    }
    
    // Check if we already analyzed this file
    if (lastAnalyzedRef.current === activeFile) {
      console.log('Already analyzed this file, skipping');
      return;
    }
    
    // Only analyze executable code files
    const currentFile = openFiles.find(f => f.path === activeFile);
    if (!currentFile) {
      console.log('Early return: currentFile not found');
      return;
    }
    
    const isCodeFile = ['python', 'java', 'c', 'cpp', 'javascript', 'typescript'].includes(currentFile.language);
    console.log('File language:', currentFile.language, 'isCodeFile:', isCodeFile);
    if (!isCodeFile) {
      console.log('Early return: not a code file, language:', currentFile.language);
      onInputAnalysisRequired(null);
      return;
    }

    console.log('Proceeding with analysis for:', currentFile.language, 'file');

    // Prevent multiple simultaneous calls
    if (isAnalyzing) {
      console.log('Already analyzing, skipping...');
      return;
    }

    console.log(`Analyzing inputs for file: ${activeFile}`);
    setIsAnalyzing(true);
    
    try {
      const analysis = await onAnalyzeCodeContent(currentFile.content, currentFile.language);
      console.log(`Analysis result for ${activeFile}:`, analysis);
      
      // Mark this file as analyzed
      lastAnalyzedRef.current = activeFile;
      
      if (analysis && analysis.total_inputs > 0) {
        console.log(`File ${activeFile} requires ${analysis.total_inputs} inputs`, analysis);
        onInputAnalysisRequired(analysis);
      } else {
        console.log(`File ${activeFile} requires no inputs`);
        // Clear the form if no inputs are needed
        onInputAnalysisRequired(null);
      }
    } catch (error) {
      console.error('Failed to analyze inputs for file:', activeFile, error);
      // Clear form on error
      onInputAnalysisRequired(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeFile, onAnalyzeCodeContent, onInputAnalysisRequired, openFiles]); // Removed isAnalyzing from deps

  // Auto input analysis when activeFile changes
  useEffect(() => {
    console.log('useEffect triggered, activeFile:', activeFile);
    
    // Clear analyzed flag when file changes
    if (activeFile && lastAnalyzedRef.current !== activeFile) {
      lastAnalyzedRef.current = '';
    }
    
    // Debounce the analysis to avoid too many calls
    const timeoutId = setTimeout(() => {
      console.log('Timeout executed, calling analyzeCurrentFile');
      analyzeCurrentFile();
    }, 300); // Reduced debounce time for testing
    return () => {
      console.log('Cleanup timeout');
      clearTimeout(timeoutId);
    };
  }, [activeFile]); // Only depend on activeFile, not analyzeCurrentFile

  // Trigger analysis when file content changes (for editing)
  const lastContentRef = useRef<string>('');
  useEffect(() => {
    if (!activeFile) return;
    
    const currentFile = openFiles.find(f => f.path === activeFile);
    if (!currentFile) return;

    // Only trigger if content actually changed
    if (lastContentRef.current === currentFile.content) return;
    lastContentRef.current = currentFile.content;

    // Create debounced analysis for content changes
    const timeoutId = setTimeout(() => {
      console.log('File content changed, re-analyzing...');
      lastAnalyzedRef.current = ''; // Clear analyzed flag to force re-analysis
      analyzeCurrentFile();
    }, 1000); // Longer debounce for content changes

    return () => clearTimeout(timeoutId);
  }, [activeFile, openFiles, analyzeCurrentFile]);

  // Process initial files if provided
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const files = Array.from(initialFiles);
      
      // Check if files have folder structure
      const hasFolder = files.some(f => 
        (f as any).webkitRelativePath && 
        (f as any).webkitRelativePath.includes('/')
      );
      
      if (hasFolder) {
        const structure = processFolderStructure(files);
        setFolderStructure(structure);
        
        // Auto-expand root folders
        const rootFolderPaths = structure.files
          .filter(node => node.type === 'folder')
          .map(node => node.path);
        setOpenFolders(new Set(rootFolderPaths));
      }
    }
  }, [initialFiles]);

  // Show input form when inputAnalysis is provided
  useEffect(() => {
    console.log('inputAnalysis changed:', inputAnalysis);
    if (inputAnalysis && inputAnalysis.total_inputs > 0) {
      console.log('Setting showInputForm to true, total inputs:', inputAnalysis.total_inputs);
      setShowInputForm(true);
      setUserInputValues(new Array(inputAnalysis.input_patterns.length).fill(""));
    } else {
      console.log('Setting showInputForm to false');
      setShowInputForm(false);
      setUserInputValues([]);
    }
  }, [inputAnalysis]);

  // Handle external result
  useEffect(() => {
    if (externalResult) {
      setOutput(externalResult);
      setShowOutput(true);
      setOutputMinimized(false);
    }
  }, [externalResult]);

  // Language extensions mapping
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': case 'cc': case 'cxx': return 'cpp';
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      default: return 'text';
    }
  };

  // Get CodeMirror language extension
  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case 'python': return [python()];
      case 'java': return [java()];
      case 'c':
      case 'cpp': return [cpp()];
      case 'javascript':
      case 'typescript': return [javascript()];
      default: return [];
    }
  };

  // Process files to create folder structure (from FolderUploader)
  const processFolderStructure = (files: File[]): FolderStructure => {
    console.log('=== Processing Folder Structure ===');
    console.log('Input files:', files.map(f => ({
      name: f.name,
      path: (f as any).webkitRelativePath || f.name,
      size: f.size
    })));

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

    console.log('Created folder structure:', structure);
    return structure;
  };

  // Handle folder selection via input
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log('=== Folder Input Selection ===');
    console.log('Selected files:', files.map(f => ({
      name: f.name,
      path: (f as any).webkitRelativePath || f.name,
      size: f.size
    })));

    setIsProcessing(true);

    try {
      // Create folder structure
      const structure = processFolderStructure(files);
      setFolderStructure(structure);

      // Auto-open first code file
      const codeFiles = files.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['py', 'java', 'cpp', 'c', 'js', 'ts'].includes(ext || '');
      });

      if (codeFiles.length > 0) {
        const firstFile = codeFiles[0];
        const relativePath = (firstFile as any).webkitRelativePath || firstFile.name;
        await loadFileFromPath(relativePath);
      }

      // Auto-expand root folders
      const rootFolderPaths = structure.files
        .filter(node => node.type === "folder")
        .map(node => node.path);
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

  // Handle drag and drop (from FolderUploader with improvements)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    console.log('=== Drag & Drop Event ===');
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

      console.log('Processed files from drag & drop:', files.map(f => ({
        name: f.name,
        path: (f as any).webkitRelativePath || f.name,
        size: f.size
      })));

      if (files.length === 0) {
        console.warn("No files found in dropped content");
        return;
      }

      const structure = processFolderStructure(files);
      setFolderStructure(structure);

      // Auto-open first code file
      const codeFiles = files.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['py', 'java', 'cpp', 'c', 'js', 'ts'].includes(ext || '');
      });

      if (codeFiles.length > 0) {
        const firstFile = codeFiles[0];
        const relativePath = (firstFile as any).webkitRelativePath || firstFile.name;
        await loadFileFromPath(relativePath);
      }

    } catch (error) {
      console.error("Error processing dropped content:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load file from path
  const loadFileFromPath = async (path: string) => {
    if (!folderStructure) return;

    // Find the file node
    const findFileNode = (nodes: FileNode[], targetPath: string): FileNode | null => {
      for (const node of nodes) {
        if (node.path === targetPath && node.type === "file") {
          return node;
        }
        if (node.children) {
          const found = findFileNode(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const fileNode = findFileNode(folderStructure.files, path);
    if (!fileNode || !fileNode.file) return;

    try {
      const content = await fileNode.file.text();
      const fileContent: FileContent = {
        name: fileNode.name,
        content,
        language: getLanguageFromExtension(fileNode.name),
        path: fileNode.path
      };

      setOpenFiles(prev => {
        const existing = prev.find(f => f.path === fileContent.path);
        if (existing) {
          return prev;
        }
        return [...prev, fileContent];
      });
      
      setActiveFile(fileContent.path);
      setSelectedFileNode(fileNode);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  // Toggle folder open/close
  const toggleFolder = (path: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Close file tab
  const closeFile = (path: string) => {
    setOpenFiles(prev => prev.filter(f => f.path !== path));
    if (activeFile === path) {
      const remaining = openFiles.filter(f => f.path !== path);
      setActiveFile(remaining.length > 0 ? remaining[0].path : null);
    }
  };

  // Update file content
  const updateFileContent = (content: string) => {
    if (!activeFile) return;
    
    setOpenFiles(prev => prev.map(file => 
      file.path === activeFile 
        ? { ...file, content }
        : file
    ));
  };

  // Handle input value change
  const handleInputChange = (index: number, value: string) => {
    const newValues = [...userInputValues];
    newValues[index] = value;  
    setUserInputValues(newValues);
  };

  // Handle input form submission
  const handleInputSubmit = () => {
    console.log('=== handleInputSubmit called ===');
    console.log('userInputValues:', userInputValues);
    
    // Always use local execution for now since we want direct API calls
    runCodeWithInputs(userInputValues);
    setShowInputForm(false);
    
    // Also notify parent if callback exists
    if (onRunWithInputs) {
      console.log('Also calling parent onRunWithInputs callback');
      onRunWithInputs(userInputValues);
    }
  };

  // Cancel input form
  const handleInputCancel = () => {
    setShowInputForm(false);
    setUserInputValues([]);
  };

  // Run code
  const runCode = async () => {
    if (!activeFile) {
      setOutput({
        stdout: "",
        stderr: "No file selected to run.",
        exit_code: 1,
        execution_time: 0
      });
      setShowOutput(true);
      return;
    }

    const currentFile = openFiles.find(f => f.path === activeFile);
    if (!currentFile) {
      setOutput({
        stdout: "",
        stderr: "Current file not found.",
        exit_code: 1,
        execution_time: 0
      });
      setShowOutput(true);
      return;
    }

    // First analyze the code for inputs
    if (onAnalyzeCodeContent) {
      const analysis = await onAnalyzeCodeContent(currentFile.content, currentFile.language);
      if (analysis && analysis.total_inputs > 0) {
        // Trigger input form via props
        if (onInputAnalysisRequired) {
          onInputAnalysisRequired(analysis);
        }
        return; // Stop execution here, will continue after inputs are provided
      }
    }

    // No inputs required, proceed with execution
    await runCodeWithInputs([]);
  };

  // Run code with provided inputs
  const runCodeWithInputs = async (inputData: string[]) => {
    console.log('=== runCodeWithInputs called ===');
    console.log('activeFile:', activeFile);
    console.log('inputData:', inputData);
    
    if (!activeFile) return;

    const currentFile = openFiles.find(f => f.path === activeFile);
    if (!currentFile) return;

    console.log('Setting isRunning to true, calling API...');
    setIsRunning(true);
    setShowOutput(true);
    setOutputMinimized(false);

    try {
      const formData = new FormData();
      formData.append("main_files", JSON.stringify([currentFile.name]));
      
      // Add input data if provided
      if (inputData.length > 0) {
        formData.append("input_data", JSON.stringify(inputData));
        console.log('Added input_data to FormData:', JSON.stringify(inputData));
      }
      
      // Create a blob with the current file content
      const blob = new Blob([currentFile.content], { type: 'text/plain' });
      formData.append("files", blob, currentFile.name);

      const apiUrl = `${ApiDomain}/code/judge`;
      console.log('Making API call to:', apiUrl);
      console.log('FormData contents:', {
        main_files: JSON.stringify([currentFile.name]),
        input_data: inputData.length > 0 ? JSON.stringify(inputData) : 'none',
        file_name: currentFile.name
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const data = await response.json();
      console.log('API success response:', data);
      setOutput(data);
    } catch (error: any) {
      console.error('API call failed:', error);
      setOutput({
        stdout: "",
        stderr: `Error: ${error.message}`,
        exit_code: 1,
        execution_time: 0
      });
    } finally {
      console.log('Setting isRunning to false');
      setIsRunning(false);
    }
  };

  // Render file tree node
  const renderTreeNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isFolder = node.type === "folder";
    const isOpen = openFolders.has(node.path);
    const paddingLeft = level * 16;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-muted cursor-pointer text-sm ${
            selectedFileNode?.path === node.path ? 'bg-primary/20' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              loadFileFromPath(node.path);
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
            <File className={`w-4 h-4 mr-2 ${
              node.extension === 'py' ? 'text-green-600' : 
              ['js', 'ts', 'jsx', 'tsx'].includes(node.extension || '') ? 'text-yellow-600' :
              ['java'].includes(node.extension || '') ? 'text-red-600' :
              ['cpp', 'c'].includes(node.extension || '') ? 'text-blue-600' :
              'text-gray-500'
            }`} />
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
            {node.children.map(child => renderTreeNode(child, level + 1))}
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

  const currentFile = activeFile ? openFiles.find(f => f.path === activeFile) : null;

  return (
    <div className="h-[calc(100vh-120px)] flex border rounded-lg overflow-hidden relative">
      {/* File Explorer */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              Explorer
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
              {folderStructure.totalFiles} files • {formatFileSize(folderStructure.totalSize)}
            </div>
          )}
        </div>

        <ScrollArea className="h-full">
          <div className="p-2">
            {!folderStructure ? (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
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
                <Folder className={`w-8 h-8 mx-auto mb-2 ${
                  isDragOver ? "text-primary" : "text-gray-400"
                }`} />
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Drop folder here
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  or click upload above
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Browse
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
                {folderStructure.files.map(node => renderTreeNode(node))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t p-2 text-xs bg-yellow-50 dark:bg-yellow-950/20">
            <div className="font-mono text-yellow-800 dark:text-yellow-300">
              <div>Active: {activeFile || 'none'}</div>
              <div>Show Form: {showInputForm ? 'yes' : 'no'}</div>
              <div>Analysis: {inputAnalysis ? `${inputAnalysis.total_inputs} inputs` : 'none'}</div>
              <div>Analyzing: {isAnalyzing ? 'yes' : 'no'}</div>
              <div>External Analyzing: {analyzingInputs ? 'yes' : 'no'}</div>
              <div>Current File Language: {currentFile?.language || 'none'}</div>
              <div>onAnalyzeCodeContent: {onAnalyzeCodeContent ? 'available' : 'missing'}</div>
              <div>Last Analyzed: {lastAnalyzedRef.current || 'none'}</div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    console.log('Debug: Force analyze clicked');
                    lastAnalyzedRef.current = ''; // Clear analyzed flag
                    analyzeCurrentFile();
                  }}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Force Analyze'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Section - Right Panel */}
      {showInputForm && inputAnalysis && (
        <div className="w-80 border-l bg-background flex-shrink-0">
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Terminal className="w-5 h-5 mr-2 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Program Inputs</h4>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('Force re-analyze triggered');
                    lastAnalyzedRef.current = ''; // Clear analyzed flag
                    analyzeCurrentFile();
                  }}
                  className="h-7 px-2 text-xs"
                  title="Re-analyze inputs"
                >
                  🔄
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleInputCancel}
                  className="h-7 w-7 p-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
              This program requires <strong className="text-blue-800 dark:text-blue-300">{inputAnalysis.total_inputs}</strong> input(s):
            </div>

            <div className="space-y-4">
              {inputAnalysis.input_patterns.map((pattern, index) => (
                <div key={index} className="space-y-2 p-3 border border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 rounded-lg">
                  <Label htmlFor={`input-${index}`} className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Input {index + 1}
                    {pattern.variable_name && (
                      <span className="text-muted-foreground ml-2 font-normal">
                        → {pattern.variable_name}
                      </span>
                    )}
                    {pattern.data_type && (
                      <span className="ml-2 px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono text-blue-700 dark:text-blue-300">
                        {pattern.data_type}
                      </span>
                    )}
                  </Label>
                  <Input
                    id={`input-${index}`}
                    placeholder={pattern.prompt_message || `Enter ${pattern.data_type || 'value'}`}
                    value={userInputValues[index] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                    className="h-9 border-blue-200 focus:border-blue-400"
                  />
                  <p className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Line {pattern.line_number}: {pattern.raw_code}
                  </p>
                </div>
              ))}
            </div>

            {inputAnalysis.suggestions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
                <div className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  💡 Tips:
                </div>
                <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                  {inputAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleInputCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInputSubmit}
                disabled={userInputValues.some((val) => val.trim() === "")}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* File Tabs */}
        {openFiles.length > 0 && (
          <div className="flex border-b bg-muted/20 overflow-x-auto">
            {openFiles.map(file => (
              <div
                key={file.path}
                className={`flex items-center px-3 py-2 border-r cursor-pointer text-sm min-w-0 ${
                  activeFile === file.path 
                    ? 'bg-background border-b-2 border-b-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveFile(file.path)}
              >
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
                {/* Show analyzing indicator for active file */}
                {activeFile === file.path && analyzingInputs && (
                  <Loader2 className="w-3 h-3 ml-1 animate-spin text-blue-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.path);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              {/* Language auto-detected from file extension */}
              {currentFile && (
                <div className="px-3 py-1 bg-muted/50 rounded text-sm font-medium">
                  {currentFile.language.charAt(0).toUpperCase() + currentFile.language.slice(1)}
                </div>
              )}
              <Button 
                onClick={runCode} 
                disabled={isRunning || isExternalRunning || analyzingInputs || !currentFile}
                size="sm"
              >
                {isRunning || isExternalRunning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : analyzingInputs ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {analyzingInputs ? 'Analyzing...' : (isRunning || isExternalRunning) ? 'Running...' : 'Run'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* CodeMirror Editor */}
          {currentFile ? (
            <div className="flex-1 overflow-hidden">
              <CodeMirror
                value={currentFile.content}
                onChange={(value) => updateFileContent(value)}
                extensions={getLanguageExtension(currentFile.language)}
                theme={isDarkTheme ? oneDark : undefined}
                height="100%"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: false,
                }}
                className="h-full"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload a folder and select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Popup */}
      {showOutput && (
        <div className={`absolute bottom-4 right-4 bg-background border rounded-lg shadow-lg transition-all duration-300 ${
          outputMinimized ? 'w-80 h-12' : 'w-96 h-80'
        }`}>
          {/* Output Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span className="font-semibold text-sm">Console Output</span>
              {output && (
                <Badge 
                  variant={output.exit_code === 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  Exit: {output.exit_code}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOutputMinimized(!outputMinimized)}
                className="h-6 w-6 p-0"
              >
                {outputMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOutput(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Output Content */}
          {!outputMinimized && (
            <div className="p-3 h-[calc(100%-3rem)] overflow-hidden">
              {isRunning || isExternalRunning ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm">Running...</span>
                </div>
              ) : output ? (
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {output.stdout && (
                      <div>
                        <div className="text-xs font-semibold text-green-600 mb-1">STDOUT:</div>
                        <pre className="text-xs font-mono bg-muted/30 p-2 rounded whitespace-pre-wrap">
                          {output.stdout}
                        </pre>
                      </div>
                    )}
                    {output.stderr && (
                      <div>
                        <div className="text-xs font-semibold text-red-600 mb-1">STDERR:</div>
                        <pre className="text-xs font-mono bg-muted/30 p-2 rounded whitespace-pre-wrap">
                          {output.stderr}
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Execution time: {output.execution_time?.toFixed(4) || 'N/A'}s
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <span className="text-sm">No output yet. Run your code to see results.</span>
                </div>
              )}
            </div>
          )}
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

export default EnhancedIDEEditor;
