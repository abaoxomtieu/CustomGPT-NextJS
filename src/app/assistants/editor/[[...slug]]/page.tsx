import { Metadata } from "next";
import { Suspense } from "react";
import EditorChatbotClient from "./editor-chatbot-client";
import { notFound } from "next/navigation";
import { generateMongoId } from "@/helpers/Cookies";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const botId = params.slug?.[0];
  const isNewBot = !botId;

  if (isNewBot) {
    return {
      title: "Tạo Chatbot AI Mới | AI FTES",
      description:
        "Tạo chatbot AI thông minh với công nghệ Gemini. Tùy chỉnh prompt, cấu hình tools và triển khai chatbot của bạn một cách dễ dàng.",
      keywords: [
        "tạo chatbot",
        "AI chatbot",
        "Gemini AI",
        "chatbot builder",
        "AI assistant",
        "custom chatbot",
        "AI FTES",
        "trí tuệ nhân tạo",
      ],
      icons: {
        icon: "/logo.svg",
        shortcut: "/logo.svg",
        apple: "/logo.svg",
      },
      openGraph: {
        title: "Tạo Chatbot AI Mới | AI FTES",
        description:
          "Tạo chatbot AI thông minh với công nghệ Gemini. Tùy chỉnh prompt, cấu hình tools và triển khai chatbot của bạn một cách dễ dàng.",
        type: "website",
        locale: "vi_VN",
        siteName: "AI FTES",
        images: [
          {
            url: "/logo.svg",
            width: 1200,
            height: 630,
            alt: "AI FTES - Tạo Chatbot AI",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Tạo Chatbot AI Mới | AI FTES",
        description:
          "Tạo chatbot AI thông minh với công nghệ Gemini. Tùy chỉnh prompt, cấu hình tools và triển khai chatbot của bạn một cách dễ dàng.",
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
        canonical: "https://ai.ftes.vn/assistants/editor",
      },
    };
  }

  return {
    title: "Cập Nhật Chatbot AI | AI FTES",
    description:
      "Chỉnh sửa và cập nhật chatbot AI của bạn. Tối ưu prompt, cấu hình tools và cải thiện hiệu suất chatbot với công nghệ Gemini.",
    keywords: [
      "cập nhật chatbot",
      "chỉnh sửa chatbot",
      "AI chatbot editor",
      "Gemini AI",
      "chatbot management",
      "AI assistant",
      "AI FTES",
      "tối ưu chatbot",
    ],
    icons: {
      icon: "/logo.svg",
      shortcut: "/logo.svg",
      apple: "/logo.svg",
    },
    openGraph: {
      title: "Cập Nhật Chatbot AI | AI FTES",
      description:
        "Chỉnh sửa và cập nhật chatbot AI của bạn. Tối ưu prompt, cấu hình tools và cải thiện hiệu suất chatbot với công nghệ Gemini.",
      type: "website",
      locale: "vi_VN",
      siteName: "AI FTES",
      images: [
        {
          url: "/logo.svg",
          width: 1200,
          height: 630,
          alt: "AI FTES - Cập Nhật Chatbot AI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cập Nhật Chatbot AI | AI FTES",
      description:
        "Chỉnh sửa và cập nhật chatbot AI của bạn. Tối ưu prompt, cấu hình tools và cải thiện hiệu suất chatbot với công nghệ Gemini.",
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
      canonical: botId
        ? `https://ai.ftes.vn/assistants/editor/${botId}`
        : "https://ai.ftes.vn/assistants/editor",
    },
  };
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Đang tải trình chỉnh sửa chatbot...
        </p>
      </div>
    </div>
  );
}

export default function EditorPage({ params }: any) {
  let botId = params.slug?.[0];
  const notFounded = !botId;

  if (notFounded) {
    botId = generateMongoId();
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditorChatbotClient botId={botId} notFounded={notFounded} />
    </Suspense>
  );
}
