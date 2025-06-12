import UpdateChatbotClient from "./update-chatbot-client";

export default function UpdateChatbotPage({
  params,
}: {
  params: { botId: string };
}) {
  return <UpdateChatbotClient botId={params.botId} />;
}
