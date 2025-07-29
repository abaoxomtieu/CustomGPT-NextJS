"use client";

import { marked } from "marked";

import { FolderOpen, ArrowUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_REPO_URL } from "@/constant";
import { EXTENSION_OPTIONS } from "@/constant";
import { useFileTree } from "@/hooks/use-file-tree";
import { useGrading } from "@/hooks/use-grading";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import FileTreePanel from "@/components/grade-code/file-tree-panel";
import GradingPanel from "@/components/grade-code/grading-panel";
import RepositoryConfig from "@/components/grade-code/reposistory-config";
import GradingResult from "@/components/grade-code/grading-result";
import { TreeNode } from "../../../../types/type";

const GradePage = () => {
  const t = useTranslations("codeGrader");
  const router = useRouter();
  const [isFolderStructureModalVisible, setIsFolderStructureModalVisible] =
    useState(false);

  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
  const [projectName, setProjectName] = useState("");
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([
    "js",
    "ts",
    "jsx",
    "tsx",
    "py",
    "java",
    "cpp",
    "c",
    "html",
    "css",
  ]);
  const [folderStructureCriteria, setFolderStructureCriteria] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const {
    criteria,
    setCriteria,
    folderCriteria,
    setFolderCriteria,
    gradeLoading,
    error,
    gradeResult,
    gradeFolderStructureResult,
    gradeCode,
    loadFrontendCriteria,
    loadBackendCriteria,
  } = useGrading({
    selectedFiles: selectedFiles,
    projectDescription: projectName,
  });

  const {
    fileTreeData,
    loading: isLoadingFileTree,
    error: fileTreeError,
    fetchFileTree,
  } = useFileTree({});

  const handleFetchFileTree = useCallback(() => {
    if (repoUrl) {
      fetchFileTree(repoUrl, selectedExtensions);
    }
  }, [repoUrl, selectedExtensions, fetchFileTree]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-primary/5 to-blue-60/10 p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-60/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-primary/8 via-blue-60/5 to-transparent border border-blue-60/20 mb-8 shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-primary/5 via-transparent to-blue-active/5"></div>
          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border border-blue-primary/20">
                    <FolderOpen className="w-8 h-8 text-blue-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-primary to-blue-active bg-clip-text text-transparent">
                      Code Grader
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Grade and evaluate code quality with AI assistance
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-primary/10 border border-blue-primary/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-primary">AI Powered</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-60/10 border border-blue-60/20">
                    <FolderOpen className="w-3 h-3 text-blue-60" />
                    <span className="text-xs font-medium text-blue-60">Repository Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-active/10 border border-blue-active/20">
                    <ArrowUp className="w-3 h-3 text-blue-active" />
                    <span className="text-xs font-medium text-blue-active">Quality Assessment</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border-2 border-dashed border-blue-primary/30">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-primary/20 animate-ping"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-primary to-blue-active flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Repository Configuration Section */}
        <div className="mb-8 animate-fade-in delay-100">
          <div className="glass-card border-blue-60/20 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-primary/5 to-blue-60/5 border-b border-blue-60/10 p-4">
              <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-primary/10 text-blue-primary">
                  <FolderOpen className="w-5 h-5" />
                </div>
                Repository Configuration
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your repository URL and file extensions for analysis
              </p>
            </div>
            <div className="p-4">
              <RepositoryConfig
                repoUrl={repoUrl}
                loading={isLoadingFileTree}
                selectedExtensions={selectedExtensions}
                onRepoUrlChange={setRepoUrl}
                onExtensionChange={setSelectedExtensions}
                onFetchFiles={handleFetchFileTree}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in delay-200">
          <style jsx>{`
            .glass-card {
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .glass-card:hover {
              transform: translateY(-2px);
            }
            @media (max-width: 768px) {
              .glass-card:hover {
                transform: none;
              }
            }
          `}</style>
          <FileTreePanel
            fileTreeData={fileTreeData}
            selectedFiles={selectedFiles}
            onFileSelection={setSelectedFiles}
          />

          <GradingPanel
            criteria={criteria}
            setCriteria={setCriteria}
            folderCriteria={folderCriteria}
            setFolderCriteria={setFolderCriteria}
            projectDescription={projectName}
            setProjectDescription={setProjectName}
            onGenerateDescription={() => {}}
            onGradeCode={() => gradeCode(criteria)}
            onLoadFrontendCriteria={loadFrontendCriteria}
            onLoadBackendCriteria={loadBackendCriteria}
            isGenerateDisabled={selectedFiles.length === 0}
            isGradeDisabled={
              selectedFiles.length === 0 || criteria.length === 0
            }
            gradeLoading={gradeLoading}
          />
        </div>

        {gradeLoading && (
          <div className="mb-8">
            <div className="glass-card border-blue-60/20 bg-card/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-primary/10">
                  <div className="w-5 h-5 border-2 border-blue-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Grading in Progress</h3>
                  <p className="text-sm text-muted-foreground">Analyzing your code quality...</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-card-foreground">Processing files</span>
                  <span className="text-muted-foreground">Please wait...</span>
                </div>
                <Progress value={50} className="w-full h-2 bg-blue-primary/10" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8">
            <div className="glass-card border-red-200/50 bg-red-50/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error Occurred</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {gradeResult.length > 0 && (
          <GradingResult
            results={gradeResult}
            gradeFolderStructureResult={gradeFolderStructureResult}
          />
        )}

        <Dialog
          open={isFolderStructureModalVisible}
          onOpenChange={setIsFolderStructureModalVisible}
        >
          <DialogContent className="overflow-y-auto max-h-[70vh] max-w-[80vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="text-blue-500" />
                <span className="font-semibold">
                  Folder Structure Evaluation
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="prose max-w-none break-words">
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(folderCriteria),
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsFolderStructureModalVisible(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <Button
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border-blue-60/30 hover:border-blue-primary/50 hover:bg-blue-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <ArrowUp className="w-5 h-5 text-blue-primary group-hover:scale-110 transition-transform" />
        </Button>
      </div>
      
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          onClick={() => router.push("/code-grader/history")}
          className="bg-card/80 backdrop-blur-sm border-blue-60/30 hover:border-blue-primary/50 hover:bg-blue-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <History className="w-4 h-4 text-blue-primary group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline ml-2 text-blue-primary font-medium">View History</span>
        </Button>
      </div>
    </div>
  );
};

export default GradePage;
