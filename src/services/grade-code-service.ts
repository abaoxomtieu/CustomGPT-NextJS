import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";
import axios, { AxiosError } from "axios";

export const apiService = {
  fetchFileTree: async (repoUrl: string, extensions: string[]) => {
    try {
      const response = await axios.post(`${ApiDomain}/grade-code/get-file-tree`,{
        url: repoUrl,
        extensions,
      }, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      return { data: response.data.file_tree, error: null };
    } catch (err) {
      return { data: null, error: "Failed to fetch file tree data" };
    }
  },

  gradeCode: async (
    selectedFiles: string[],
    criteriasList: string[],
    projectDescription: string
  ) => {
    try {
      const response = await axios.post(`${ApiDomain}/grade-code/grade`, {
        selected_files: selectedFiles,
        criterias_list: criteriasList,
        project_description: projectDescription,
      }, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
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
      const response = await axios.get(`${ApiDomain}/grade-code/read-code-content`, {
        params: { file_path: filePath },
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
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
      const response = await axios.post(`${ApiDomain}/grade-code/grade-overall`, {
        data: data,
      }, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
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
};
