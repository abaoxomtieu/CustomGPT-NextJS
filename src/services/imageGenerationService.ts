import axios from "axios";
import { getCookie } from "@/helpers/Cookies";
import { ApiDomain } from "@/constant";

// API URL
const IMAGE_GENERATION_URL = `${ApiDomain}/image-generation`;

/**
 * Generate image using AI
 * @param prompt The text prompt for image generation
 * @param image Optional image file for image-to-image generation
 */
export const generateImage = async (
  prompt: string,
  image?: File
): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);

    if (image) {
      formData.append("image", image);
    }

    const response = await axios.post(
      `${IMAGE_GENERATION_URL}/generate-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        responseType: "blob", // Important for handling binary data
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generate suggested prompt using AI
 * @param prompt The initial prompt to enhance
 */
export const generateImagePrompt = async (prompt: string): Promise<string> => {
  try {
    const apiKey = getCookie("gemini_api_key");
    const modelName = getCookie("model_name") || "gemini-2.5-flash-preview-05-20";

    if (!apiKey) {
      throw new Error("API_KEY_REQUIRED");
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", modelName);
    formData.append("api_key", apiKey);

    const response = await axios.post(
      `${IMAGE_GENERATION_URL}/generate-image-prompt`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        responseType: "text",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw error;
  }
};
