import RagAgentClient from "./rag-agent-client";
export const metadata = {
  title: "Chatbot AI | Rag Agent",
  description:
    "Trò chuyện thông minh với chatbot AI Rag Agent, tích hợp Gemini API.",
};
export default function RagAgentPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slugArray = Array.isArray(params.slug)
    ? params.slug
    : [params.slug || ""];

  return <RagAgentClient params={{ slug: slugArray }} />;
}
