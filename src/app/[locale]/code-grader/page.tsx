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
  const [useTestData, setUseTestData] = useState(false);

  // Test data for debugging
  const testTreeData: TreeNode[] = [
    {
      label: "src",
      value: "src",
      children: [
        {
          label: "components",
          value: "src/components",
          children: [
            { label: "Button.tsx", value: "src/components/Button.tsx" },
            { label: "Input.tsx", value: "src/components/Input.tsx" },
          ],
        },
        { label: "App.tsx", value: "src/App.tsx" },
        { label: "index.ts", value: "src/index.ts" },
      ],
    },
    { label: "package.json", value: "package.json" },
    { label: "README.md", value: "README.md" },
  ];

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
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Grader</h1>
          <p className="text-muted-foreground">
            Grade and evaluate code quality with AI assistance
          </p>

          {/* Test button for debugging */}
        </div>

        <RepositoryConfig
          repoUrl={repoUrl}
          loading={isLoadingFileTree}
          selectedExtensions={selectedExtensions}
          onRepoUrlChange={setRepoUrl}
          onExtensionChange={setSelectedExtensions}
          onFetchFiles={handleFetchFileTree}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 h-[500px]">
          <FileTreePanel
            fileTreeData={useTestData ? testTreeData : fileTreeData}
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Grading Progress</span>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
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

      <Button
        variant="outline"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 flex items-center gap-2 shadow-lg"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/code-grader/history")}
        className="fixed top-4 right-4 flex items-center gap-2 shadow-lg"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">View History</span>
      </Button>
    </div>
  );
};

export default GradePage;
