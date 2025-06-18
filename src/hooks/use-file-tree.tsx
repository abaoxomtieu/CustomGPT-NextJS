import { useState, useCallback } from "react";
import { TreeNode } from "../../types/type";
import { apiService } from "@/services/grade-code-service";
import { toast } from "sonner";

interface UseFileTreeProps {
  onTreeLoaded?: () => void;
}

export const useFileTree = ({ onTreeLoaded }: UseFileTreeProps) => {
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFileTree = useCallback(
    async (repoUrl: string, selectedExtensions: string[]) => {
      setLoading(true);
      setFileTreeData([]);
      setError("");

      toast.loading("Cloning repository...", {
        id: "clone-repository-loading",
      });

      const { data, error: fetchError } = await apiService.fetchFileTree(
        repoUrl,
        selectedExtensions
      );

      if (data) {
        setFileTreeData(data);
        toast.success("Repository cloned successfully!", {
          id: "clone-repository-loading",
        });
      } else if (fetchError) {
        setError(fetchError);
        setFileTreeData([]);
        toast.error(fetchError, { id: "clone-repository-loading" });
      }

      setLoading(false);

      if (onTreeLoaded) {
        onTreeLoaded();
      }
    },
    [onTreeLoaded]
  );

  const generateProjectDescription = useCallback(
    async (selectedFiles: string[]) => {
      if (selectedFiles.length === 0) {
        toast.error("Please select files first");
        return null;
      }

      toast.loading("Generating project description...", {
        id: "project-description-loading",
      });

      const { data, error } = await apiService.generateProjectDescription(
        selectedFiles
      );

      if (data) {
        toast.success("Description generated successfully!", {
          id: "project-description-loading",
        });
        return data;
      } else if (error) {
        toast.error(error, { id: "project-description-loading" });
        return null;
      }
    },
    []
  );

  return {
    fileTreeData,
    loading,
    error,
    fetchFileTree,
    generateProjectDescription,
  };
};
