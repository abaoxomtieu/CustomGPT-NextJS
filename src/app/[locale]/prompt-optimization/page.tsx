import { Metadata } from "next";
import PromptOptimizationClient from "./prompt-optimization-client";

export const metadata: Metadata = {
  title: "Prompt Optimization - AI FTES",
  description:
    "Tối ưu hóa prompt AI với công cụ thông minh. Hỗ trợ system prompt và user prompt optimization với nhiều template khác nhau.",
  keywords:
    "prompt optimization, AI prompt, tối ưu prompt, system prompt, user prompt, AI optimization",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Prompt Optimization - AI FTES",
    description:
      "Tối ưu hóa prompt AI với công cụ thông minh. Hỗ trợ system prompt và user prompt optimization với nhiều template khác nhau.",
    images: ["/logo.svg"],
  },
};

export default function PromptOptimizationPage() {
  return <PromptOptimizationClient />;
}
