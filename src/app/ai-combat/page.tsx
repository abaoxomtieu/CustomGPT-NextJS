import { Metadata } from "next";
import AICombatClient from "./ai-combat-client";

export const metadata: Metadata = {
  title: "AI Combat Arena - Đấu trường AI",
  description:
    "Khám phá đấu trường AI nơi các chatbot thông minh tranh tài. Xem các cuộc đối thoại thú vị giữa các AI và tìm hiểu về khả năng của chúng.",
  keywords:
    "AI Combat, Chatbot Arena, AI đối thoại, Trí tuệ nhân tạo, Chatbot battle, AI competition",
  openGraph: {
    title: "AI Combat Arena - Đấu trường AI",
    description:
      "Khám phá đấu trường AI nơi các chatbot thông minh tranh tài. Xem các cuộc đối thoại thú vị giữa các AI và tìm hiểu về khả năng của chúng.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI Combat Arena",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Combat Arena - Đấu trường AI",
    description:
      "Khám phá đấu trường AI nơi các chatbot thông minh tranh tài. Xem các cuộc đối thoại thú vị giữa các AI và tìm hiểu về khả năng của chúng.",
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

export default function AICombatPage() {
  return (
    <main>
      <h1 className="sr-only">AI Combat Arena - Đấu trường AI</h1>
      <AICombatClient />
    </main>
  );
}
