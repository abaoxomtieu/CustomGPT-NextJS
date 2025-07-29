import { useState, useCallback, useEffect } from "react";
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

        toast.loading("Grading in progress...", {
          id: "grading-progress",
        });

        let hasError = false;
        let chunkCount = 0;
        let buffer = ""; // Buffer to accumulate partial JSON

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunkCount++;
          const chunkText = decoder.decode(value, { stream: true });

          // Add to buffer
          buffer += chunkText;

          // Skip if buffer is empty
          if (!buffer.trim()) {
            continue;
          }

          // Split by double newlines to find complete JSON objects
          const parts = buffer.split("\n\n");

          // Keep the last part in buffer (might be incomplete)
          buffer = parts.pop() || "";

          // Process complete JSON objects
          const jsonChunks = parts.filter((chunk) => chunk.trim());

          for (let i = 0; i < jsonChunks.length; i++) {
            const jsonChunk = jsonChunks[i].trim();
            if (!jsonChunk) continue;

            try {
              const chunk: GradeResponse = JSON.parse(jsonChunk);

              // Process only folder_structure and final chunks
              if (chunk.type === "folder_structure") {
                setGradeFolderStructureResult(chunk.output as string);
              } else if (chunk.type === "criteria_result") {
                // Update partial results to show progress
                if (chunk.partial_results) {
                  setGradeResult(chunk.partial_results);
                  toast.loading(
                    `Processing criteria ${chunk.criteria_index}/${chunk.total_criteria}...`,
                    {
                      id: "grading-progress",
                    }
                  );
                }
              } else if (chunk.type === "final") {
                setGradeResult(chunk.output as GradingResult[]);

                // Also set folder structure result if present in final response
                if (chunk.grade_folder_structure) {
                  setGradeFolderStructureResult(chunk.grade_folder_structure);
                }

                toast.dismiss("grading-progress");
                // Don't break here, continue processing remaining chunks
              } else if (chunk.type === "error") {
                hasError = true;
                toast.error(chunk.output as string);
              } else {
                console.log("⚠️ Unknown chunk type:", chunk.type);
              }
            } catch (chunkError) {
              console.error("❌ Error processing JSON chunk:", chunkError);
              console.error("❌ Problematic JSON chunk:", jsonChunk);
              hasError = true;
              toast.error("Error processing grading chunk");
              // Continue processing next chunks
              continue;
            }
          }

          // Check if we received final chunk to break the loop
          if (
            jsonChunks.some((chunk) => {
              try {
                const parsed = JSON.parse(chunk.trim());
                return parsed.type === "final";
              } catch {
                return false;
              }
            })
          ) {
            console.log("Final chunk detected, breaking loop");
            break;
          }
        }

        // Process any remaining content in buffer
        if (buffer.trim()) {
          try {
            const chunk: GradeResponse = JSON.parse(buffer.trim());

            // Process the remaining chunk
            if (chunk.type === "folder_structure") {
              setGradeFolderStructureResult(chunk.output as string);
            } else if (chunk.type === "criteria_result") {
              console.log(
                `✅ Processing remaining criteria ${chunk.criteria_index}/${chunk.total_criteria}:`,
                chunk.result
              );
              if (chunk.partial_results) {
                setGradeResult(chunk.partial_results);
              }
            } else if (chunk.type === "final") {
              setGradeResult(chunk.output as GradingResult[]);
              if (chunk.grade_folder_structure) {
                setGradeFolderStructureResult(chunk.grade_folder_structure);
              }
            } else if (chunk.type === "error") {
              hasError = true;
              toast.error(chunk.output as string);
            }
          } catch (bufferError) {
            console.error("❌ Error processing remaining buffer:", bufferError);
            console.error("❌ Problematic buffer content:", buffer.trim());
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
    [selectedFiles, projectDescription, folderCriteria]
  );

  return {
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
  };
};
