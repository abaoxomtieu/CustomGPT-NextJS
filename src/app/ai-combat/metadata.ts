import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đấu Trường AI - AI FTES",
  description:
    "Tham gia Đấu Trường AI của AI FTES - Nơi các mô hình AI tranh tài và tranh luận. Khám phá khả năng của AI trong việc đối thoại và phân tích.",
  keywords:
    "Đấu Trường AI, AI Combat, Tranh luận AI, AI FTES, Đối thoại AI, Phân tích AI",
  openGraph: {
    title: "Đấu Trường AI - AI FTES",
    description:
      "Tham gia Đấu Trường AI của AI FTES - Nơi các mô hình AI tranh tài và tranh luận. Khám phá khả năng của AI trong việc đối thoại và phân tích.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES Combat Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Đấu Trường AI - AI FTES",
    description:
      "Tham gia Đấu Trường AI của AI FTES - Nơi các mô hình AI tranh tài và tranh luận. Khám phá khả năng của AI trong việc đối thoại và phân tích.",
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
    canonical: "/ai-combat",
  },
};
