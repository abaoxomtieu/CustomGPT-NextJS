import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RAG Agent - AI FTES",
  description:
    "Khám phá sức mạnh của RAG Agent với AI FTES. Tương tác với AI thông minh được trang bị khả năng truy xuất và tạo lập thông tin nâng cao.",
  keywords:
    "RAG Agent, AI thông minh, Truy xuất thông tin, AI FTES, Chatbot nâng cao, AI tương tác",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "RAG Agent - AI FTES",
    description:
      "Khám phá sức mạnh của RAG Agent với AI FTES. Tương tác với AI thông minh được trang bị khả năng truy xuất và tạo lập thông tin nâng cao.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES RAG Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Agent - AI FTES",
    description:
      "Khám phá sức mạnh của RAG Agent với AI FTES. Tương tác với AI thông minh được trang bị khả năng truy xuất và tạo lập thông tin nâng cao.",
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
    canonical: "https://ai.ftes.vn/rag-agent",
  },
};
