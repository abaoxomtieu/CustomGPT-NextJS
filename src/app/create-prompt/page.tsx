import { Suspense } from "react";
import CreatePromptClient from "./create-prompt-client";
export const metadata = {
  title: "Chatbot AI | Create Prompt",
  description:
    "Tạo chatbot AI với trợ lý AI, tích hợp Gemini API.",
};
export default function CreatePromptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <CreatePromptClient />
    </Suspense>
  );
}
