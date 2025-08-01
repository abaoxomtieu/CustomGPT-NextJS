import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";
import axios, { AxiosError } from "axios";

export const apiService = {
  fetchFileTreeFromUpload: async (files: FileList, extensions: string[]) => {
    try {
      const formData = new FormData();
      
      // Add files to form data
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i], files[i].webkitRelativePath || files[i].name);
      }
      
      // Add extensions
      extensions.forEach(ext => {
        formData.append('extensions', ext);
      });

      const response = await axios.post(
        `${ApiDomain}/grade-code/get-file-tree-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { data: response.data.file_tree, error: null };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 413) {
          return {
            data: null,
            error: "Files are too large (exceeds 2MB limit). Please select smaller files.",
          };
        }
        return {
          data: null,
          error: err.response?.data?.detail || "Failed to process uploaded files",
        };
      }
      return { data: null, error: "Failed to process uploaded files" };
    }
  },

  fetchFileTree: async (repoUrl: string, extensions: string[]) => {
    try {
      const response = await axios.post(
        `${ApiDomain}/grade-code/get-file-tree`,
        {
          url: repoUrl,
          extensions,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data.file_tree, error: null };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 413) {
          return {
            data: null,
            error:
              "Repository is too large (exceeds 2MB limit). Please use a smaller repository.",
          };
        }
        return {
          data: null,
          error: err.response?.data?.detail || "Failed to fetch file tree data",
        };
      }
      return { data: null, error: "Failed to fetch file tree data" };
    }
  },

  gradeCode: async (
    selectedFiles: string[],
    criteriasList: string[],
    projectDescription: string
  ) => {
    try {
      const response = await axios.post(
        `${ApiDomain}/grade-code/grade`,
        {
          selected_files: selectedFiles,
          criterias_list: criteriasList,
          project_description: projectDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data, error: null };
    } catch (err) {
      return { data: null, error: "Failed to grade code" };
    }
  },
  gradeCodeStream: (
    selectedFiles: string[],
    folder_structure_criteria: string,
    criteriasList: string[],
    projectDescription: string
  ) => {
    const url = new URL(`${ApiDomain}/grade-code/grade-stream`);
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify({
        selected_files: selectedFiles,
        folder_structure_criteria: folder_structure_criteria,
        criterias_list: criteriasList,
        project_description: projectDescription,
        api_key: getCookie("gemini_api_key"),
      }),
    });
  },
  generateProjectDescription: async (selectedFiles: string[]) => {
    try {
      const response = await axios.post(
        `${ApiDomain}/grade-code/project-description-generation`,
        {
          selected_files: selectedFiles,
          api_key: getCookie("gemini_api_key"),
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail
            : "Failed to generate description",
      };
    }
  },
  getCodeContent: async (filePath: string) => {
    try {
      const response = await axios.get(
        `${ApiDomain}/grade-code/read-code-content`,
        {
          params: { file_path: filePath },
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail || "Failed to fetch code content"
            : "Failed to fetch code content",
      };
    }
  },
  overallGrade: async (data: any) => {
    try {
      const response = await axios.post(
        `${ApiDomain}/grade-code/grade-overall`,
        {
          data: data,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail
            : "Failed to grade overall",
      };
    }
  },
  
  cleanupUpload: async () => {
    try {
      const response = await axios.post(
        `${ApiDomain}/grade-code/cleanup-upload`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail || "Failed to cleanup upload"
            : "Failed to cleanup upload",
      };
    }
  },
};
