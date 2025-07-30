import { Metadata } from "next";
import HomeClient from "./home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI FTES - Nền tảng AI cho sinh viên",
  description:
    "Khám phá thế giới AI với AI FTES - Nền tảng học tập và thực hành AI dành cho sinh viên. Tạo chatbot, tham gia đấu trường AI và phát triển kỹ năng của bạn.",
  keywords:
    "AI FTES, Trí tuệ nhân tạo, Chatbot, Đấu trường AI, Học AI, Thực hành AI, Sinh viên AI",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "AI FTES - Nền tảng AI cho sinh viên",
    description:
      "Khám phá thế giới AI với AI FTES - Nền tảng học tập và thực hành AI dành cho sinh viên. Tạo chatbot, tham gia đấu trường AI và phát triển kỹ năng của bạn.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI FTES - Nền tảng AI cho sinh viên",
    description:
      "Khám phá thế giới AI với AI FTES - Nền tảng học tập và thực hành AI dành cho sinh viên. Tạo chatbot, tham gia đấu trường AI và phát triển kỹ năng của bạn.",
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
    canonical: "https://ai.ftes.vn",
  },
  verification: {
    google: "your-google-site-verification",
  },
};

export default function HomePage() {
  return (
    <main>
      <h1 className="sr-only">AI FTES - Nền tảng AI cho sinh viên</h1>
      <HomeClient />
    </main>
  );
}
