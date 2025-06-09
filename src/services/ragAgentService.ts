import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";

// RAG Agent payload that matches the backend RagAgentBody
export interface RagAgentPayload {
  query: string;
  bot_id?: string;
  conversation_id?: string;
  model_name?: string;
  attachs?: File[];
}

// Response structure for RAG Agent
export interface RagAgentResponse {
  final_response: string;
  selected_ids: number[];
  selected_documents: any[];
}

// Stream response types for RAG Agent
export interface RagStreamResponse {
  type: "message" | "error" | "final";
  content:
    | string
    | {
        final_response: string;
        selected_ids: number[];
        selected_documents: any[];
      };
}
const RAG_AGENT_STREAM_URL = `${ApiDomain}/ai/rag_agent_template/stream`;
// Function to send messages to the streaming RAG agent endpoint
export const sendStreamingRagAgentMessage = async (
  payload: RagAgentPayload,
  onMessage: (message: string) => void,
  onFinal: (data: any) => void,
  onError: (error: string) => void,
  abortSignal?: AbortSignal
) => {
  try {
    const formData = new FormData();
    formData.append("query", payload.query);
    if (payload.bot_id) formData.append("bot_id", payload.bot_id);
    if (payload.conversation_id)
      formData.append("conversation_id", payload.conversation_id);
    if (payload.model_name) formData.append("model_name", payload.model_name);
    if (getCookie("gemini_api_key"))
      formData.append("api_key", getCookie("gemini_api_key") || "");
    if (payload.attachs) {
      payload.attachs.forEach((file) => {
        formData.append("attachs", file);
      });
    }

    const response = await fetch(RAG_AGENT_STREAM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: formData,
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No reader available");
    }

    let buffer = "";
    while (true) {
      if (abortSignal?.aborted) {
        reader.cancel();
        return;
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: RagStreamResponse = JSON.parse(line);

            if (abortSignal?.aborted) {
              return;
            }

            switch (data.type) {
              case "message":
                onMessage(data.content as string);
                break;
              case "final":
                onFinal(data.content);
                break;
              case "error":
                onError(data.content as string);
                break;
            }
          } catch (e) {
            onError("Error parsing stream data");
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    onError(error instanceof Error ? error.message : "Unknown error");
  }
};
