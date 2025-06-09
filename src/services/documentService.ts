import axios from "axios";
import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";
import { DocumentVectorStore } from "../../types/document";

// API URLs
const VECTOR_STORE_URL = `${ApiDomain}/vector-store`;

/**
 * Fetch documents for a specific chatbot
 */
export const fetchDocuments = async (
  botId: string
): Promise<DocumentVectorStore[]> => {
  try {
    const response = await axios.get(`${VECTOR_STORE_URL}/get-documents`, {
      params: { bot_id: botId },
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

/**
 * Add documents to a chatbot
 */
export const addDocuments = async (
  botId: string,
  documents: DocumentVectorStore[],
  ids: string[]
): Promise<any> => {
  try {
    const response = await axios.post(
      `${VECTOR_STORE_URL}/add-documents`,
      {
        bot_id: botId,
        documents,
        ids,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding documents:", error);
    throw error;
  }
};

/**
 * Delete documents from a chatbot
 */
export const deleteDocuments = async (
  botId: string,
  ids?: string[]
): Promise<any> => {
  try {
    const params: any = { bot_id: botId };
    if (ids) {
      params.ids = ids;
    }
    const response = await axios.delete(
      `${VECTOR_STORE_URL}/delete-documents`,
      {
        params,
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting documents:", error);
    throw error;
  }
};

export const updateDocument = async (
  botId: string,
  document: DocumentVectorStore,
  id: string
): Promise<any> => {
  return await addDocuments(botId, [document], [id]);
};

export const documentService = {
  fetchDocuments,
  addDocuments,
  deleteDocuments,
  updateDocument,
};
