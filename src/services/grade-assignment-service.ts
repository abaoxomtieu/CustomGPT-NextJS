import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";
import axios, { AxiosError } from "axios";

export interface ExtractedData {
  extracted_text: string;
  split_questions: string[];
  total_images: number;
  image_names: string[];
  saved_combined_image: string;
}

export interface ExtractTextResponse {
  success: boolean;
  message: string;
  data: ExtractedData;
}

export const gradeAssignmentApiService = {
  extractTextFromImages: async (images: File[] | FileList): Promise<{ data: ExtractedData | null; error: string | null }> => {
    try {
      const formData = new FormData();
      
      // Add images to form data
      console.log("📤 Preparing to upload", images.length, "images");
      for (let i = 0; i < images.length; i++) {
        const file = Array.isArray(images) ? images[i] : images[i];
        console.log(`📎 Adding image ${i + 1}:`, file.name, `(${file.size} bytes)`);
        formData.append('images', file);
      }

      console.log("🚀 Sending request to:", `${ApiDomain}/graded-assignments/extract-text-from-images`);
      const response = await axios.post<ExtractTextResponse>(
        `${ApiDomain}/graded-assignments/extract-text-from-images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            // Don't set Content-Type for FormData - let axios handle it
          },
        }
      );

      console.log("✅ Response received:", response.status, response.statusText);
      console.log("📥 Response data:", response.data);

      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message || "Extraction failed" };
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      if (err instanceof AxiosError) {
        console.error("❌ Axios error details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
        });
        if (err.response?.status === 413) {
          return {
            data: null,
            error: "Hình ảnh quá lớn (vượt quá giới hạn 2MB). Vui lòng chọn hình ảnh nhỏ hơn.",
          };
        }
        if (err.response?.status === 422) {
          return {
            data: null,
            error: err.response?.data?.detail || "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại định dạng file.",
          };
        }
        return {
          data: null,
          error: err.response?.data?.detail || "Không thể trích xuất văn bản từ hình ảnh",
        };
      }
      return { data: null, error: "Đã xảy ra lỗi không xác định" };
    }
  },
};