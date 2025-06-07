// Đổi your-path thành đường dẫn bạn muốn nhé, ví dụ: app/chatbots/page.tsx
import { Metadata } from "next";
import ChatbotListClient from "./ChatbotListClient";

export const metadata: Metadata = {
  title: "Danh sách Chatbot | Abao Team",
  description:
    "Quản lý và tương tác với các chatbot của bạn tại Abao Team. Tìm kiếm, tạo mới và khám phá chatbot công khai.",
};

export default function ChatbotListPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Danh sách Chatbot
      </h1>
      <ChatbotListClient />
    </main>
  );
}
