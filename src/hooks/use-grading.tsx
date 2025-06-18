import { useState, useCallback } from "react";
import { GradeResponse, GradingResult } from "../../types/type";
import { apiService } from "@/services/grade-code-service";
import { DEFAULT_CRITERIA_BE, DEFAULT_CRITERIA_FE } from "@/constant";
import { toast } from "sonner";

interface UseGradingProps {
  selectedFiles: string[];
  projectDescription: string;
}

export const useGrading = ({
  selectedFiles,
  projectDescription,
}: UseGradingProps) => {
  const [criteria, setCriteria] = useState<string[]>(
    DEFAULT_CRITERIA_FE.slice(1)
  );
  const [folderCriteria, setFolderCriteria] = useState<string>(
    DEFAULT_CRITERIA_FE[0]
  );
  const [gradeLoading, setGradeLoading] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [error, setError] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult[]>([]);
  const [gradeFolderStructureResult, setGradeFolderStructureResult] =
    useState<string>("");
  const loadFrontendCriteria = useCallback(() => {
    setFolderCriteria(DEFAULT_CRITERIA_FE[0]);
    setCriteria(DEFAULT_CRITERIA_FE.slice(1));
    toast.success("Frontend criteria loaded");
  }, []);

  const loadBackendCriteria = useCallback(() => {
    setFolderCriteria(DEFAULT_CRITERIA_BE[0]);
    setCriteria(DEFAULT_CRITERIA_BE.slice(1));
    toast.success("Backend criteria loaded");
  }, []);

  const gradeCode = useCallback(
    async (criteriaToUse: string[]) => {
      setError("");
      setGradeResult([]);
      setGradeLoading(true);

      if (selectedFiles.length === 0) {
        toast.error("Please select at least one file to grade");
        setGradeLoading(false);
        return;
      }

      const validCriteria = criteriaToUse.filter(
        (criteria) => criteria.trim() !== ""
      );

      if (validCriteria.length === 0) {
        toast.error("Please add at least one grading criteria");
        setGradeLoading(false);
        return;
      }

      try {
        const response = await apiService.gradeCodeStream(
          selectedFiles,
          folderCriteria,
          validCriteria,
          projectDescription
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Stream reader not available");
        }
        let hasError = false;
        while (true) {
          try {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk: GradeResponse = JSON.parse(
              decoder.decode(value, { stream: true })
            );

            // Process chunks even if previous chunks had errors
            if (chunk.type === "noti") {
              toast.loading(chunk.output as string);
              setPercentage(chunk.percentage as number);
            } else if (chunk.type === "folder_structure") {
              setGradeFolderStructureResult(chunk.output as string);
              setPercentage(chunk.percentage as number);
            } else if (chunk.type === "final") {
              setGradeResult(chunk.output as GradingResult[]);
              setPercentage(chunk.percentage as number);
              break; // Exit after processing final chunk
            } else if (chunk.type === "error") {
              hasError = true;
              toast.error(chunk.output as string);
            }
          } catch (chunkError) {
            hasError = true;
            console.error("Error processing chunk:", chunkError);
            toast.error("Error processing grading chunk");
            // Continue processing next chunks
            continue;
          }
        }

        // Show final status based on error state
        if (hasError) {
          toast.warning("Grading completed with some errors");
        } else {
          toast.success("Code graded successfully!");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setGradeLoading(false);
      }
    },
    [selectedFiles, projectDescription]
  );

  return {
    criteria,
    setCriteria,
    folderCriteria,
    setFolderCriteria,
    gradeLoading,
    gradeError: error,
    gradeResult,
    gradeFolderStructureResult,
    percentage,
    gradeCode,
    loadFrontendCriteria,
    loadBackendCriteria,
  };
};
