"use client";

import { useState, useEffect } from "react";
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
import { Upload, GitBranch, Play, Loader2, Check } from "lucide-react";
import { ApiDomain } from "@/constant";

const CodeRunnerPage = () => {
  const [language, setLanguage] = useState("python");
  const [mainFiles, setMainFiles] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"repo" | "upload" | "folder">("repo");
  const [isDragOver, setIsDragOver] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Handle drag and drop events
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

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      if (validateFileSize(droppedFiles)) {
        setFiles(droppedFiles);
        setMainFiles([]); // Clear selected main files when new files are dropped
        setError(null);
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
      setError(`Total file size (${(total / 1024 / 1024).toFixed(2)}MB) exceeds the ${MAX_SIZE_MB}MB limit.`);
      return false;
    }
    return true;
  };

  // Clear main files when switching upload modes
  const handleUploadModeChange = (mode: "repo" | "upload" | "folder") => {
    setUploadMode(mode);
    setMainFiles([]);
    setFiles(null);
    setRepoUrl("");
    setTotalSize(0);
    setError(null);
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("language", language);
    formData.append("main_files", JSON.stringify(mainFiles));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Code Runner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
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
              </div>
              <div>
                <Label htmlFor="main-files">Main Files</Label>
                <Input id="main-files" value={mainFiles.join(", ")} readOnly />
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
                  variant={uploadMode === "upload" ? "default" : "outline"}
                  onClick={() => handleUploadModeChange("upload")}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                <Button
                  variant={uploadMode === "folder" ? "default" : "outline"}
                  onClick={() => handleUploadModeChange("folder")}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Folder
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
                  <Label>{uploadMode === "folder" ? "Upload Folder" : "Upload Files"}</Label>
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
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-lg font-medium">
                        {isDragOver
                          ? `Drop ${uploadMode === "folder" ? "folder" : "files"} here`
                          : `Drag and drop ${uploadMode === "folder" ? "folder" : "files"} here`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or{" "}
                        <label
                          htmlFor="file-input"
                          className="text-primary cursor-pointer hover:underline"
                        >
                          browse to upload
                        </label>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Maximum total size: {MAX_SIZE_MB}MB
                      </p>
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && validateFileSize(e.target.files)) {
                          setFiles(e.target.files);
                          setMainFiles([]);
                        }
                      }}
                      multiple={uploadMode !== "folder"}
                      {...(uploadMode === "folder" ? { webkitdirectory: "" } : {})}
                    />
                  </div>

                  {files && files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-gray-600">
                        {files.length} file(s) uploaded
                      </div>
                      <div className="text-sm text-gray-500">
                        Total size: {(totalSize / 1024 / 1024).toFixed(2)}MB / {MAX_SIZE_MB}MB
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            totalSize > MAX_SIZE_BYTES ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((totalSize / MAX_SIZE_BYTES) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {files && (
                    <div className="mt-4">
                      <Label>Select Main File(s):</Label>
                      <div className="space-y-2">
                        {Array.from(files).map((file) => (
                          <div key={file.name} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={mainFiles.includes(file.name)}
                              onChange={() =>
                                setMainFiles((prev) =>
                                  prev.includes(file.name)
                                    ? prev.filter((f) => f !== file.name)
                                    : [...prev, file.name]
                                )
                              }
                              className="mr-2"
                            />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleRunCode}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Code
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
  );
};

export default CodeRunnerPage;
