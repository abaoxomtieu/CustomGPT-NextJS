import { Metadata } from "next";
import RagAgentClient from "./rag-agent-client";

export const metadata: Metadata = {
  title: "Rag Agent Chat",
  description:
    "Trò chuyện thông minh với chatbot AI Rag Agent, tích hợp Gemini API.",
};

interface PageProps {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RagAgentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug || ""];

  return <RagAgentClient params={{ slug: slugArray }} />;
}
