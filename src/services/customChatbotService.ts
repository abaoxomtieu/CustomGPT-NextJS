import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";

export interface CustomChatbotStreamPayload {
  query: string;
  bot_id: string;
  model_name: string;
  attachs?: File[];
}

export interface CustomChatbotStreamResponse {
  type: "message" | "final" | "error" | "tools_message";
  content: string | {
    final_response: string;
    done: boolean;
  };
  metadata?: {
    node: string;
    step: number;
    checkpoint_ns: string;
  };
}

export const sendStreamingCustomChatbotMessage = async (
  payload: CustomChatbotStreamPayload,
  onMessage: (message: string) => void,
  onFinal: (data: { final_response: string; done: boolean }) => void,
  onError: (error: string) => void,
  onThinking: (text: string) => void,
  onToolsMessage?: (content: string, metadata: any) => void,
  abortSignal?: AbortSignal
) => {
  try {
    onThinking("Đang xử lý...");
    
    const formData = new FormData();
    formData.append("query", payload.query);
    formData.append("bot_id", payload.bot_id);
    formData.append("model_name", payload.model_name);
    
    if (getCookie("gemini_api_key")) {
      formData.append("api_key", getCookie("gemini_api_key") || "");
    }
    
    if (payload.attachs) {
      payload.attachs.forEach((file) => {
        formData.append("attachs", file);
      });
    }

    const response = await fetch(
      `${ApiDomain}/ai/custom_chatbot/update/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: formData,
        signal: abortSignal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    let accumulatedMessage = "";
    let buffer = "";
    
    while (true) {
      if (abortSignal?.aborted) {
        reader.cancel();
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      buffer += text;
      
      // Split by double newlines as backend sends \n\n
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: CustomChatbotStreamResponse = JSON.parse(line);

            if (abortSignal?.aborted) {
              return;
            }

            switch (data.type) {
              case "message":
                accumulatedMessage += data.content as string;
                onMessage(accumulatedMessage);
                onThinking("");
                break;
              case "tools_message":
                if (onToolsMessage) {
                  onToolsMessage(data.content as string, data.metadata);
                }
                onThinking("");
                break;
              case "final":
                const finalData = data.content as { final_response: string; done: boolean };
                onFinal(finalData);
                onThinking("");
                break;
              case "error":
                onError(data.content as string);
                onThinking("");
                break;
            }
          } catch (e) {
            console.error("Error parsing stream data:", e, "Line:", line);
            onError("Error parsing stream data");
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    
    console.error("Error in streaming chat:", error);
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}; 