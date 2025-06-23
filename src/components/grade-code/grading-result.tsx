"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Code,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Download,
  FolderOpen,
  Loader2,
  Maximize2,
} from "lucide-react";
import { marked } from "marked";
import * as XLSX from "xlsx";
import { statusConfig } from "../../constant";
import { toast } from "sonner";
import { GradingResult } from "../../../types/type";
import { apiService } from "@/services/grade-code-service";
import { useTranslations } from "next-intl";

interface GradingResultViewProps {
  results: GradingResult[];
  gradeFolderStructureResult?: string;
  setResults?: React.Dispatch<React.SetStateAction<GradingResult[]>>;
}

export default function GradingResultView({
  results,
  gradeFolderStructureResult,
  setResults,
}: GradingResultViewProps) {
  const t = useTranslations("codeGrader.gradingResult");
  const [localResults, setLocalResults] = useState<GradingResult[]>(results);
  const [gradeOverall, setGradeOverall] = useState<Record<string, string>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file_name: string;
    comment: string;
    criteria_eval: string;
  } | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>("0");
  const [codeContent, setCodeContent] = useState<string>("");
  const [loadingGrade, setLoadingGrade] = useState<Record<string, boolean>>({});
  const [isCodeFullscreen, setIsCodeFullscreen] = useState(false);

  // View file details modal
  const handleViewDetails = (fileResult: {
    file_name: string;
    comment: string;
    criteria_eval: string;
  }) => {
    setSelectedFile(fileResult);
    setIsModalVisible(true);
    setCodeContent("");
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
    setCodeContent("");
  };

  // Show code
  const handleShowCode = async () => {
    if (selectedFile) {
      const { data, error } = await apiService.getCodeContent(
        selectedFile.file_name
      );

      if (data) {
        setCodeContent(data);
      } else if (error) {
        toast.error(error);
      }
    }
  };

  // Remove file
  const handleRemoveFile = (fileIndex: number) => {
    const currentTabIndex = parseInt(activeTabKey);

    const updatedResults = [...localResults];
    if (
      updatedResults[currentTabIndex] &&
      updatedResults[currentTabIndex].analyze_code_result
    ) {
      updatedResults[currentTabIndex].analyze_code_result = updatedResults[
        currentTabIndex
      ].analyze_code_result.filter((_, index) => index !== fileIndex);

      setLocalResults(updatedResults);
      setResults?.(updatedResults);

      toast.success(t("messages.fileRemoved"));
    }
  };

  // Grade overall
  const handleGradeOverall = async (criteriaIndex: number) => {
    try {
      setLoadingGrade((prev) => ({ ...prev, [criteriaIndex]: true }));

      if (
        !localResults[criteriaIndex] ||
        !localResults[criteriaIndex].analyze_code_result
      ) {
        toast.error(t("messages.noResults"));
        return;
      }

      const response = await apiService.overallGrade(
        localResults[criteriaIndex]
      );
      setGradeOverall((prev) => ({
        ...prev,
        [criteriaIndex]: response.data,
      }));

      toast.success(t("messages.gradeSuccess"));
    } catch (error) {
      toast.error(t("messages.gradeError"));
    } finally {
      setLoadingGrade((prev) => ({ ...prev, [criteriaIndex]: false }));
    }
  };

  // Export to excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    if (gradeFolderStructureResult) {
      const folderStructureData = [
        {
          Section: t("export.folderStructureSection"),
          Content: gradeFolderStructureResult
            .replace(/\*\*/g, "")
            .replace(/#/g, "")
            .replace(/<[^>]*>?/gm, ""),
        },
      ];

      const folderStructureSheet =
        XLSX.utils.json_to_sheet(folderStructureData);
      folderStructureSheet["!cols"] = [{ wch: 20 }, { wch: 100 }];
      XLSX.utils.book_append_sheet(
        workbook,
        folderStructureSheet,
        t("export.folderStructureSheet")
      );
    }
    localResults.forEach((currentResults, index) => {
      if (!currentResults || !currentResults.analyze_code_result) return;
      const data = currentResults.analyze_code_result.map((item) => {
        const fileName = item.file_name.split("/").pop() || item.file_name;
        const ratingText =
          statusConfig[item.rating]?.text || String(item.rating);
        const plainTextEval = item.criteria_eval
          .replace(/<[^>]*>?/gm, "")
          .replace(/\*\*/g, "");

        return {
          [t("export.fileName")]: fileName,
          [t("export.rating")]: ratingText,
          [t("export.ratingValue")]: String(item.rating),
          [t("export.comments")]: item.comment,
          [t("export.evaluation")]: plainTextEval,
        };
      });
      data.push({
        [t("export.fileName")]: "",
        [t("export.rating")]: "",
        [t("export.ratingValue")]: "",
        [t("export.comments")]: "",
        [t("export.evaluation")]: "",
      });
      if (gradeOverall[index]) {
        const overallGradeRow = {
          [t("export.fileName")]: t("export.overallGrade"),
          [t("export.rating")]: "",
          [t("export.ratingValue")]: "",
          [t("export.comments")]: gradeOverall[index]
            .replace(/\*\*/g, "")
            .replace(/#/g, "")
            .replace(/<[^>]*>?/gm, ""),
          [t("export.evaluation")]: "",
        };
        data.push(overallGradeRow);
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 10 },
        { wch: 40 },
        { wch: 60 },
      ];
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        t("export.criteriaSheet", { index: index + 1 })
      );
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `grading_results_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    setLocalResults(results);
  }, [results]);

  // Table columns definition
  const getTableRows = (data: any[]) =>
    data.map((item, idx) => (
      <TableRow key={item.file_name}>
        <TableCell>{item.file_name}</TableCell>
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        statusConfig[item.rating]?.color || "#e5e7eb",
                      color: "#1e293b",
                    }}
                  >
                    {statusConfig[item.rating]?.text || item.rating}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {statusConfig[item.rating]?.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleViewDetails(item)}
            >
              {t("table.viewDetails")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRemoveFile(idx)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));

  // Tabs
  const tabItems = localResults.map((result, index) => (
    <TabsContent value={index.toString()} key={index}>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.fileName")}</TableHead>
              <TableHead>{t("table.rating")}</TableHead>
              <TableHead>{t("table.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.analyze_code_result &&
              getTableRows(result.analyze_code_result)}
          </TableBody>
        </Table>
        <Button
          className="bg-green-700 mt-4"
          onClick={() => handleGradeOverall(index)}
          disabled={
            !result.analyze_code_result ||
            result.analyze_code_result.length === 0
          }
        >
          {loadingGrade[index] && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("gradeOverallButton")}
        </Button>
        {gradeOverall[index] && (
          <div className="border rounded-lg bg-background p-6 shadow-sm mt-6 overflow-x-auto">
            <h4 className="text-xl font-semibold text-blue-600 mb-4">
              {t("overallAnalysisTitle")}
            </h4>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(gradeOverall[index]) }}
            />
          </div>
        )}
      </div>
    </TabsContent>
  ));

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-primary" /> {t("title")}
      </h3>

      {localResults.length > 0 ? (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="default"
              onClick={exportToExcel}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("exportButton")}
            </Button>
          </div>
          <Tabs
            value={activeTabKey}
            onValueChange={setActiveTabKey}
            className="w-full"
          >
            <TabsList>
              {localResults.map((_, idx) => (
                <TabsTrigger value={idx.toString()} key={idx}>
                  {t("criteriaTab", { index: idx + 1 })}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabItems}
          </Tabs>

          {/* File details modal */}
          <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <FileText className="text-blue-500 w-5 h-5" />
                  <span className="font-semibold truncate">
                    {selectedFile?.file_name}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                  {/* Comments */}
                  <div className="bg-background p-4 rounded-lg shadow-sm border flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <MessageSquare className="text-green-500 w-5 h-5" />
                      <h3 className="font-semibold text-lg">{t("modal.comments")}</h3>
                    </div>
                    <div
                      className="prose prose-sm max-w-none overflow-y-auto flex-1 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: marked(selectedFile?.comment || ""),
                      }}
                    />
                  </div>
                  {/* Evaluation */}
                  <div className="bg-background p-4 rounded-lg shadow-sm border flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <CheckCircle2 className="text-blue-500 w-5 h-5" />
                      <h3 className="font-semibold text-lg">{t("modal.evaluation")}</h3>
                    </div>
                    <div
                      className="prose prose-sm max-w-none overflow-y-auto flex-1 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: marked(selectedFile?.criteria_eval || ""),
                      }}
                    />
                  </div>
                </div>
                {/* Source code */}
                {codeContent && (
                  <div className="bg-background p-4 rounded-lg shadow-sm border flex flex-col h-[350px]">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Code className="text-purple-500 w-5 h-5" />
                        <h3 className="font-semibold text-lg">{t("modal.sourceCode")}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCodeFullscreen(true)}
                        className="h-8 px-2"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">
                          {t("modal.fullscreen")}
                        </span>
                      </Button>
                    </div>
                    <pre
                      className="w-full overflow-auto bg-muted rounded-lg flex-1"
                      style={{
                        padding: "1rem",
                        fontSize: "0.8rem",
                        lineHeight: "1.4",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      }}
                    >
                      <code>{codeContent}</code>
                    </pre>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button
                  onClick={handleShowCode}
                  disabled={!!codeContent}
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  {t("modal.viewSourceCode")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const fileIndex = localResults[
                      parseInt(activeTabKey)
                    ]?.analyze_code_result.findIndex(
                      (file) => file.file_name === selectedFile?.file_name
                    );
                    if (fileIndex !== undefined && fileIndex !== -1) {
                      handleRemoveFile(fileIndex);
                      handleCancel();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {t("modal.removeFile")}
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary">{t("modal.close")}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Fullscreen Code Dialog */}
          <Dialog open={isCodeFullscreen} onOpenChange={setIsCodeFullscreen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Code className="text-purple-500 w-5 h-5" />
                  <span className="font-semibold truncate">
                    {selectedFile?.file_name}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden p-6">
                <pre
                  className="w-full h-full overflow-auto bg-muted rounded-lg"
                  style={{
                    padding: "1.5rem",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  <code>{codeContent}</code>
                </pre>
              </div>
              <DialogFooter className="px-6 py-4 border-t">
                <DialogClose asChild>
                  <Button variant="secondary">{t("modal.close")}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p>{t("noResults")}</p>
      )}
    </div>
  );
}
