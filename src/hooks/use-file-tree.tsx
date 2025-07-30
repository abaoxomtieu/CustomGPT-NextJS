import { useState, useCallback, useEffect } from "react";
import { TreeNode } from "../../types/type";
import { apiService } from "@/services/grade-code-service";
import { toast } from "sonner";

interface UseFileTreeProps {
  onTreeLoaded?: () => void;
}

// Helper function to transform API data to TreeNode format
const transformToTreeNode = (data: any): TreeNode[] => {
  if (!data) {
    return [];
  }

  // If data is already in correct format
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data[0]?.label &&
    data[0]?.value
  ) {
    return data;
  }

  // If data is a simple array of file paths
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
    return data.map((filePath: string, index: number) => ({
      label: filePath.split("/").pop() || filePath,
      value: filePath,
      children: undefined,
    }));
  }

  // If data is an object, try to convert it to tree structure
  if (typeof data === "object" && !Array.isArray(data)) {
    const convertObjectToTree = (obj: any, path = ""): TreeNode[] => {
      return Object.keys(obj).map((key) => {
        const currentPath = path ? `${path}/${key}` : key;
        const value = obj[key];

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // It's a directory
          return {
            label: key,
            value: currentPath,
            children: convertObjectToTree(value, currentPath),
          };
        } else if (Array.isArray(value)) {
          // It's a directory with files
          return {
            label: key,
            value: currentPath,
            children: value.map((item: any) => ({
              label:
                typeof item === "string"
                  ? item
                  : item.name || item.label || "Unknown",
              value: `${currentPath}/${
                typeof item === "string"
                  ? item
                  : item.name || item.label || "unknown"
              }`,
              children: undefined,
            })),
          };
        } else {
          // It's a file
          return {
            label: key,
            value: currentPath,
            children: undefined,
          };
        }
      });
    };

    return convertObjectToTree(data);
  }

  // If data is an empty array
  if (Array.isArray(data) && data.length === 0) {
    return [];
  }

  return [];
};

export const useFileTree = ({ onTreeLoaded }: UseFileTreeProps) => {
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUploadedFiles, setIsUploadedFiles] = useState(false);

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
        const transformedData = transformToTreeNode(data);
        setFileTreeData(transformedData);
        setIsUploadedFiles(false);
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

  const fetchFileTreeFromUpload = useCallback(
    async (files: FileList, selectedExtensions: string[]) => {
      setLoading(true);
      setFileTreeData([]);
      setError("");

      toast.loading("Processing uploaded files...", {
        id: "upload-files-loading",
      });

      const { data, error: fetchError } =
        await apiService.fetchFileTreeFromUpload(files, selectedExtensions);

      if (data) {
        const transformedData = transformToTreeNode(data);
        setFileTreeData(transformedData);
        setIsUploadedFiles(true);
        toast.success("Files processed successfully!", {
          id: "upload-files-loading",
        });
      } else if (fetchError) {
        setError(fetchError);
        setFileTreeData([]);
        toast.error(fetchError, { id: "upload-files-loading" });
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

  const cleanupUpload = useCallback(async () => {
    try {
      await apiService.cleanupUpload();
    } catch (error) {
      console.error("Error cleaning up upload:", error);
    }
  }, []);

  // Cleanup on unmount if files were uploaded
  useEffect(() => {
    return () => {
      if (isUploadedFiles) {
        cleanupUpload();
      }
    };
  }, [isUploadedFiles, cleanupUpload]);

  return {
    fileTreeData,
    loading,
    error,
    fetchFileTree,
    fetchFileTreeFromUpload,
    generateProjectDescription,
    cleanupUpload,
    isUploadedFiles,
  };
};
