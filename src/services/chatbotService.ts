import axios from "axios";
import { getCookie } from "../helpers/Cookies";
import { ApiDomain } from "../constant";

// API URLs
const CHATBOTS_URL = `${ApiDomain}/ai/chatbots`;

// Chatbot interface
export interface Chatbot {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  tools: any[];
  created_at?: string;
  updated_at?: string;
  public?: boolean;
}

// Update request structure for chatbot
export interface ChatbotUpdateRequest {
  name?: string;
  prompt?: string;
  tools?: any[];
  public?: boolean;
}

// Response structure for chatbot list
export interface ChatbotListResponse {
  chatbots: Chatbot[];
}

// Model options interface
export interface ModelOption {
  value: string;
  label: string;
}

// Available models
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    value: "gemini-2.5-flash-preview-05-20",
    label: "Gemini 2.5 Flash",
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
  },
];

// Default model
export const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20";

/**
 * Fetch all available chatbots
 */
export const fetchChatbots = async (): Promise<Chatbot[]> => {
  try {
    const response = await axios.get<ChatbotListResponse>(CHATBOTS_URL, {
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return response.data.chatbots;
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    throw error;
  }
};
export const fetchPublicChatbots = async (): Promise<Chatbot[]> => {
  try {
    const response = await axios.get<ChatbotListResponse>(`${CHATBOTS_URL}/public`, {
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return response.data.chatbots;
  } catch (error) {
    console.error("Error fetching public chatbots:", error);
    throw error;
  }
};
/**
 * Fetch details of a specific chatbot by ID
 * @param id The ID of the chatbot to fetch
 */
export const fetchChatbotDetail = async (id: string): Promise<Chatbot> => {
  try {
    const response = await axios.get<Chatbot>(`${CHATBOTS_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chatbot with ID ${id}:`, error);
    throw error;
  }
};

export const fetchPublicChatbotDetail = async (
  id: string
): Promise<Chatbot> => {
  try {
    const response = await axios.get<Chatbot>(`${CHATBOTS_URL}/public/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public chatbot with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a chatbot's properties
 * @param id The ID of the chatbot to update
 * @param updateData The data to update (name, prompt, tools)
 */
export const updateChatbot = async (
  id: string,
  updateData: ChatbotUpdateRequest
): Promise<Chatbot> => {
  try {
    const response = await axios.put<Chatbot>(
      `${CHATBOTS_URL}/${id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating chatbot with ID ${id}:`, error);
    throw error;
  }
};

export const deleteChatbot = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${CHATBOTS_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    throw error;
  }
};
