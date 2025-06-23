"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, Info, AlertTriangle, Code, Copy } from "lucide-react";
import { getCookie } from "@/helpers/Cookies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface ApiDocsProps {
  botId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const apiUrl = "https://ai.ftes.vn/api/ai/rag_agent_template/stream";

export default function ApiDocs({ botId, open, onOpenChange }: ApiDocsProps) {
  const t = useTranslations("apiDocs");
  const currentApiKey = getCookie("gemini_api_key") || t("noApiKey");
  const token = getCookie("token") || t("yourToken");
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const exampleCode = `// ${t("example.fetchComment")}
const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \ ${getCookie("token")}\` // ${t(
    "example.tokenComment"
  )}
  },
  body: (() => {
    const formData = new FormData();
    formData.append("query", "${t("example.query")}");
    formData.append("bot_id", "${botId}");
    formData.append("conversation_id", "${t("example.conversationId")}");
    formData.append("model_name", "gemini-2.5-flash-preview-05-20");
    formData.append("api_key", "${currentApiKey}"); // ${t(
    "example.apiKeyComment"
  )}
    // ${t("example.attachComment")}
    // formData.append("attachs", file);
    return formData;
  })()
});

// ${t("example.handleResponse")}
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = new TextDecoder().decode(value);
  const lines = text.split("\n").filter(Boolean);

  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.type === "message") {
      // ${t("example.handleStreaming")}
      console.log(data.content);
    } else if (data.type === "final") {
      // ${t("example.handleFinal")}
      console.log(data.content.final_response);
    }
  }
}`;

  const curlExample = `curl -X POST '${apiUrl}' \
  -H 'Authorization: Bearer ${token}' \
  -F 'query=${t("example.query")}' \
  -F 'bot_id=${botId}' \
  -F 'conversation_id=${t("example.conversationId")}' \
  -F 'model_name=gemini-2.5-flash-preview-05-20' \
  -F 'api_key=${currentApiKey}'
  # ${t("example.attachComment")}
  # -F 'attachs=@/path/to/your/file'`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl w-full p-0">
        <DialogHeader className="p-4 md:p-6 border-b">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <DialogTitle className="text-lg md:text-xl">
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm md:text-base">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] md:max-h-[70vh]">
          <div className="space-y-4 md:space-y-6">
            {/* Alert Info */}
            <div className="px-3 md:px-4">
              <Alert variant="default" className="text-sm md:text-base">
                <Info className="h-4 w-4 md:h-5 md:w-5" />
                <AlertTitle className="text-sm md:text-base">
                  {t("alert.title")}
                </AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  {t("alert.description")}
                </AlertDescription>
              </Alert>
            </div>

            {/* Endpoint */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1">
                {t("endpoint")}
              </div>
              <div className="bg-muted px-3 md:px-4 py-2 rounded-lg font-mono text-xs md:text-sm w-full break-all">
                {apiUrl}
              </div>
            </section>

            {/* Method */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1">
                {t("method")}
              </div>
              <Badge
                variant="outline"
                className="border-foreground text-xs md:text-sm"
              >
                POST
              </Badge>
            </section>

            {/* Headers */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1">
                {t("headers")}
              </div>
              <div className="bg-muted px-3 md:px-4 py-2 rounded-lg font-mono text-xs md:text-sm w-full break-all max-w-full">
                Authorization: Bearer{" "}
                <span className="italic break-all block max-w-full overflow-x-auto whitespace-pre-wrap">
                  {token}
                </span>
              </div>
            </section>

            {/* FormData */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1 flex items-center justify-between">
                <span>{t("formData")}</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() =>
                    handleCopy(
                      "formdata",
                      JSON.stringify(
                        {
                          query: t("example.query"),
                          bot_id: botId,
                          conversation_id: t("example.conversationId"),
                          model_name: "gemini-2.5-flash-preview-05-20",
                          api_key: currentApiKey,
                          attachs: [],
                        },
                        null,
                        2
                      )
                    )
                  }
                  title="Copy"
                >
                  <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  {copied === "formdata" ? t("copied") : t("copy")}
                </button>
              </div>
              <pre className="bg-muted px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs w-full overflow-x-auto break-words whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    query: t("example.query"),
                    bot_id: botId,
                    conversation_id: t("example.conversationId"),
                    model_name: "gemini-2.5-flash-preview-05-20",
                    api_key: currentApiKey,
                    attachs: [],
                  },
                  null,
                  2
                )}
              </pre>
            </section>

            {/* Params */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1">
                {t("params")}
              </div>
              <div className="space-y-2">
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    query
                  </Badge>{" "}
                  <span> {t("paramsQuery")}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    bot_id
                  </Badge>{" "}
                  <span> {t("paramsBotId")}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    conversation_id
                  </Badge>{" "}
                  <span> {t("paramsConversationId")}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    model_name
                  </Badge>{" "}
                  <span> {t("paramsModelName")}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    api_key
                  </Badge>{" "}
                  <span> {t("paramsApiKey", { currentApiKey })}</span>
                </div>
                <div className="text-xs md:text-sm">
                  <Badge variant="outline" className="text-xs md:text-sm">
                    attachs
                  </Badge>{" "}
                  <span> {t("paramsAttachs")}</span>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t my-2 px-3 md:px-4" />

            {/* Response Format */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1 flex items-center justify-between">
                <span>{t("responseFormat")}</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() =>
                    handleCopy(
                      "response-message",
                      JSON.stringify(
                        {
                          type: "message",
                          content: t("example.streamingContent"),
                        },
                        null,
                        2
                      )
                    )
                  }
                  title="Copy"
                >
                  <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  {copied === "response-message" ? t("copied") : t("copy")}
                </button>
              </div>
              <div className="text-xs md:text-sm mb-2">
                {t("responseFormatDesc")}
              </div>
              <pre className="bg-muted px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs w-full overflow-x-auto break-words whitespace-pre">
                {JSON.stringify(
                  {
                    type: "message",
                    content: t("example.streamingContent"),
                  },
                  null,
                  2
                )}
              </pre>
              <div className="text-xs md:text-sm mt-2 mb-2 flex items-center justify-between">
                <span>{t("finalResponse")}</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() =>
                    handleCopy(
                      "response-final",
                      JSON.stringify(
                        {
                          type: "final",
                          content: {
                            final_response: t("example.finalResponseContent"),
                            selected_ids: [],
                            selected_documents: [],
                          },
                        },
                        null,
                        2
                      )
                    )
                  }
                  title="Copy"
                >
                  <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  {copied === "response-final" ? t("copied") : t("copy")}
                </button>
              </div>
              <pre className="bg-muted px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs w-full overflow-x-auto break-words whitespace-pre">
                {JSON.stringify(
                  {
                    type: "final",
                    content: {
                      final_response: t("example.finalResponseContent"),
                      selected_ids: [],
                      selected_documents: [],
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </section>

            {/* Divider */}
            <div className="border-t my-2 px-3 md:px-4" />

            {/* Example with Tabs */}
            <section className="mb-3 md:mb-4 px-3 md:px-4">
              <div className="font-semibold text-sm md:text-base mb-1 flex items-center gap-2">
                <Code className="w-4 h-4" />
                {t("example.title")}
              </div>
              <Tabs defaultValue="fetch" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fetch" className="text-xs md:text-sm">
                    {t("example.fetchTab")}
                  </TabsTrigger>
                  <TabsTrigger value="curl" className="text-xs md:text-sm">
                    {t("example.curlTab")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="fetch">
                  <div className="relative">
                    <button
                      className="absolute top-2 right-2 z-10 p-1 bg-background rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                      onClick={() => handleCopy("fetch", exampleCode)}
                      title="Copy"
                    >
                      <Copy className="w-3 h-3 md:w-4 md:h-4" />
                      {copied === "fetch" ? t("copied") : t("copy")}
                    </button>
                    <span className="break-all block max-w-full overflow-x-auto whitespace-pre-wrap text-pretty text-[10px] md:text-xs bg-muted p-2 rounded-lg">
                      {exampleCode}
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="curl">
                  <div className="relative">
                    <button
                      className="absolute top-2 right-2 z-10 p-1 bg-background rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                      onClick={() => handleCopy("curl", curlExample)}
                      title="Copy"
                    >
                      <Copy className="w-3 h-3 md:w-4 md:h-4" />
                      {copied === "curl" ? t("copied") : t("copy")}
                    </button>
                    <span className="break-all block max-w-full overflow-x-auto whitespace-pre-wrap text-pretty text-[10px] md:text-xs bg-muted p-2 rounded-lg">
                      {curlExample}
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            {/* Alert Warning */}
            <div className="px-3 md:px-4">
              <Alert variant="destructive" className="text-sm md:text-base">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                <AlertTitle className="text-sm md:text-base">
                  {t("alertWarning.title")}
                </AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  {t("alertWarning.description")}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </ScrollArea>
        <DialogClose>
          <Button
            variant="outline"
            className="w-full bg-foreground text-background text-sm md:text-base"
          >
            {t("close")}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
