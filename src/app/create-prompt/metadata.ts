import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Chatbot AI - AI FTES",
  description:
    "Tạo chatbot AI thông minh với AI FTES. Tùy chỉnh và phát triển chatbot theo nhu cầu của bạn với giao diện trực quan và dễ sử dụng.",
  keywords:
    "Tạo Chatbot AI, Chatbot thông minh, AI FTES, Phát triển chatbot, Tùy chỉnh AI, Chatbot tùy chỉnh",
  openGraph: {
    title: "Tạo Chatbot AI - AI FTES",
    description:
      "Tạo chatbot AI thông minh với AI FTES. Tùy chỉnh và phát triển chatbot theo nhu cầu của bạn với giao diện trực quan và dễ sử dụng.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES Create Chatbot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tạo Chatbot AI - AI FTES",
    description:
      "Tạo chatbot AI thông minh với AI FTES. Tùy chỉnh và phát triển chatbot theo nhu cầu của bạn với giao diện trực quan và dễ sử dụng.",
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
    canonical: "/create-prompt",
  },
};
