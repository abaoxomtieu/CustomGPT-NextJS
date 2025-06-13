import { generateMongoId } from "@/helpers/Cookies";
import EditorChatbotClient from "./editor-chatbot-client";

export default function UpdateChatbotPage(props: any) {
  let notFounded = false;
  const slugArray = Array.isArray(props.params?.slug)
    ? props.params.slug
    : [props.params?.slug ?? ""];
  let botId = slugArray[0];
  if (!botId) {
    botId = generateMongoId();
    notFounded = true;
  }
  return (
    <main>
      <h1 className="sr-only">Update Chatbot - AI FTES</h1>
      <EditorChatbotClient botId={botId} notFounded={notFounded} />
    </main>
  );
}
