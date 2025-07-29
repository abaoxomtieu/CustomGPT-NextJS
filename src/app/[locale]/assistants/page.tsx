import { Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import ChatbotListClient from "./chatbot-list-client";
export const metadata: Metadata = {
  title: "Danh sách Chatbot - AI FTES",
  description:
    "Khám phá bộ sưu tập chatbot AI đa dạng từ AI FTES. Tương tác với các chatbot thông minh được thiết kế cho nhiều mục đích khác nhau.",
  keywords:
    "Chatbot AI, Danh sách chatbot, AI FTES, Chatbot thông minh, Tương tác AI, Chatbot đa năng",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Danh sách Chatbot - AI FTES",
    description:
      "Khám phá bộ sưu tập chatbot AI đa dạng từ AI FTES. Tương tác với các chatbot thông minh được thiết kế cho nhiều mục đích khác nhau.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES Assistants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Danh sách Chatbot - AI FTES",
    description:
      "Khám phá bộ sưu tập chatbot AI đa dạng từ AI FTES. Tương tác với các chatbot thông minh được thiết kế cho nhiều mục đích khác nhau.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ai.ftes.vn/assistants",
  },
};

export default function ChatbotListPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background/80 via-blue-primary/5 to-background/95 py-4 px-2 w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-primary/8 via-blue-60/5 to-transparent border border-blue-60/20 mb-4 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <div className="flex-1 space-y-1">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-primary to-blue-active bg-clip-text text-transparent">
              Danh sách Chatbot AI
            </h1>
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
              Khám phá, trò chuyện và tạo chatbot AI cho nhiều mục đích khác
              nhau
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-primary/10 to-blue-60/20 border border-blue-primary/20">
              <Bot className="w-6 h-6 md:w-7 md:h-7 text-blue-primary" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/create-prompt">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-primary to-blue-active hover:from-blue-active hover:to-blue-primary shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm font-semibold whitespace-nowrap"
                >
                  <Sparkles className="mr-1.5 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Tạo mới</span>
                  <span className="sm:hidden">Tạo</span>
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-60/30 hover:border-blue-primary/50 hover:bg-blue-primary/5 text-xs md:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Trang chủ</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Chatbot List Section */}
      <section>
        <ChatbotListClient />
      </section>
    </main>
  );
}
