import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách Chatbot - AI FTES",
  description:
    "Khám phá bộ sưu tập chatbot AI đa dạng từ AI FTES. Tương tác với các chatbot thông minh được thiết kế cho nhiều mục đích khác nhau.",
  keywords:
    "Chatbot AI, Danh sách chatbot, AI FTES, Chatbot thông minh, Tương tác AI, Chatbot đa năng",
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
