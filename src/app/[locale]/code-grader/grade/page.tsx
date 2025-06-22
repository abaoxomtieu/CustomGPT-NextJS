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
import { useRouter } from "next/navigation";
import RepositoryConfig from "@/components/grade-code/reposistory-config";
import FileTreePanel from "@/components/grade-code/file-tree-panel";
import GradingPanel from "@/components/grade-code/grading-panel";
import GradingResultView from "@/components/grade-code/grading-result";
import ErrorNotification from "@/components/grade-code/error-notification";

const GradePage = () => {
  const [isFolderStructureModalVisible, setIsFolderStructureModalVisible] =
    useState(false);
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
    EXTENSION_OPTIONS.map((option) => option.value)
  );
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [projectDescription, setProjectDescription] = useState<string>("");
  const router = useRouter();

  const {
    fileTreeData,
    loading: treeLoading,
    error: treeError,
    fetchFileTree,
    generateProjectDescription,
  } = useFileTree({
    onTreeLoaded: () => setSelectedFiles([]),
  });

  const {
    criteria,
    setCriteria,
    folderCriteria,
    setFolderCriteria,
    gradeLoading,
    gradeResult,
    gradeFolderStructureResult,
    gradeCode,
    loadFrontendCriteria,
    loadBackendCriteria,
  } = useGrading({
    selectedFiles,
    projectDescription,
  });

  // Handler functions
  const handleExtensionChange = useCallback((value: string[]) => {
    setSelectedExtensions(value);
  }, []);

  const handleFileSelection = useCallback((files: string[]) => {
    setSelectedFiles(files);
  }, []);

  const handleFetchFileTree = useCallback(() => {
    fetchFileTree(repoUrl, selectedExtensions);
  }, [fetchFileTree, repoUrl, selectedExtensions]);

  const handleGenerateDescription = useCallback(() => {
    generateProjectDescription(selectedFiles).then((description) => {
      if (description) {
        setProjectDescription(description);
      }
    });
  }, [generateProjectDescription, selectedFiles]);

  const error = treeError;

  // Debug: Monitor gradeFolderStructureResult changes
  useEffect(() => {
    console.log(
      "gradeFolderStructureResult changed:",
      gradeFolderStructureResult
    );
    console.log("Should show button:", !!gradeFolderStructureResult);
  }, [gradeFolderStructureResult]);

  // Back to top button (simple implementation)
  const handleBackTop = () => {
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <RepositoryConfig
              repoUrl={repoUrl}
              loading={treeLoading}
              selectedExtensions={selectedExtensions}
              onRepoUrlChange={setRepoUrl}
              onExtensionChange={handleExtensionChange}
              onFetchFiles={handleFetchFileTree}
            />
          </div>
        </div>

        {error && <ErrorNotification message={error} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 h-[500px]">
          <FileTreePanel
            fileTreeData={fileTreeData}
            selectedFiles={selectedFiles}
            onFileSelection={handleFileSelection}
          />

          <GradingPanel
            criteria={criteria}
            setCriteria={setCriteria}
            folderCriteria={folderCriteria}
            setFolderCriteria={setFolderCriteria}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            onGenerateDescription={handleGenerateDescription}
            onGradeCode={() => gradeCode(criteria)}
            onLoadFrontendCriteria={loadFrontendCriteria}
            onLoadBackendCriteria={loadBackendCriteria}
            isGenerateDisabled={selectedFiles.length === 0}
            isGradeDisabled={
              gradeLoading ||
              selectedFiles.length === 0 ||
              criteria.filter((c) => c.trim() !== "").length === 0
            }
            gradeLoading={gradeLoading}
          />
        </div>
        {gradeFolderStructureResult && (
          <>
            <Button
              variant="default"
              onClick={() => setIsFolderStructureModalVisible(true)}
              className="mb-4 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-blue-500" />
              View Folder Structure Evaluation
            </Button>

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
                      __html: marked(gradeFolderStructureResult),
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
          </>
        )}
        {gradeResult.length > 0 && (
          <GradingResultView
            results={gradeResult}
            gradeFolderStructureResult={gradeFolderStructureResult}
          />
        )}
      </div>
      <Button
        variant="secondary"
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
        onClick={handleBackTop}
        aria-label="Back to Top"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/code-grader")}
        className="fixed top-4 right-4 flex items-center gap-2 shadow-lg"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">View History</span>
      </Button>
    </div>
  );
};

export default GradePage;
