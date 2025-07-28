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
    <main className="min-h-screen bg-gradient-to-b from-background/80 to-background/95 py-4 px-2 w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_25%_25%,rgba(var(--primary),0.08)_0%,transparent_60%),radial-gradient(circle_at_75%_75%,rgba(var(--primary),0.04)_0%,transparent_60%)] mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6 px-4 py-6 md:py-8">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent animate-fade-in">
              Danh sách Chatbot AI
            </h1>
            <p className="text-base md:text-lg text-muted-foreground animate-fade-in">
              Khám phá, trò chuyện và tạo chatbot AI cho nhiều mục đích khác nhau. Giao diện thân thiện, dễ sử dụng cho mọi đối tượng!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in">
              <Link href="/create-prompt">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-base rounded-full shadow-lg hover:shadow-xl group">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo Chatbot mới
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="h-10 px-6 text-base rounded-full"
                >
                  Trang chủ
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden group shadow-xl">
              <Bot className="h-12 w-12 md:h-20 md:w-20 text-primary/70" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
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
