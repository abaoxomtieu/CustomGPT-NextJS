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

interface ApiDocsProps {
  botId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const apiUrl = "https://ai.ftes.vn/api/ai/rag_agent_template/stream";

export default function ApiDocs({ botId, open, onOpenChange }: ApiDocsProps) {
  const currentApiKey = getCookie("gemini_api_key") || "Chưa có API key";
  const token = getCookie("token") || "your_token";
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const exampleCode = `// Ví dụ sử dụng fetch
const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \ ${getCookie("token")}\` // Lấy token từ cookie
  },
  body: (() => {
    const formData = new FormData();
    formData.append("query", "Tin nhắn của bạn ở đây");
    formData.append("bot_id", "${botId}");
    formData.append("conversation_id", "id_cuộc_hội_thoại_tùy_chọn");
    formData.append("model_name", "gemini-2.5-flash-preview-05-20");
    formData.append("api_key", "${currentApiKey}"); // API key của bạn từ cookie
    // Thêm file đính kèm nếu có
    // formData.append("attachs", file);
    return formData;
  })()
});

// Xử lý phản hồi streaming
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = new TextDecoder().decode(value);
  const lines = text.split("\\n").filter(Boolean);

  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.type === "message") {
      // Xử lý tin nhắn streaming
      console.log(data.content);
    } else if (data.type === "final") {
      // Xử lý phản hồi cuối cùng
      console.log(data.content.final_response);
    }
  }
}`;

  const curlExample = `curl -X POST '${apiUrl}' \\
  -H 'Authorization: Bearer ${token}' \\
  -F 'query=Tin nhắn của bạn ở đây' \\
  -F 'bot_id=${botId}' \\
  -F 'conversation_id=id_cuộc_hội_thoại_tùy_chọn' \\
  -F 'model_name=gemini-2.5-flash-preview-05-20' \\
  -F 'api_key=${currentApiKey}'
  # Thêm file đính kèm nếu có
  # -F 'attachs=@/path/to/your/file'`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:max-w-3xl w-full p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <DialogTitle>Hướng Dẫn Tích Hợp API</DialogTitle>
          </div>
          <DialogDescription>
            Tham khảo hướng dẫn chi tiết để tích hợp chatbot vào website/app của bạn.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Alert Info */}
            <div className="px-4">
              <Alert variant="default">
                <Info className="h-5 w-5" />
                <AlertTitle>Tích Hợp API</AlertTitle>
                <AlertDescription>
                  Sử dụng API này để tích hợp chatbot vào website hoặc ứng dụng của bạn.
                </AlertDescription>
              </Alert>
            </div>

            {/* Endpoint */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1">Điểm cuối API</div>
              <div className="bg-muted px-4 py-2 rounded-lg font-mono text-sm w-full break-all">
                {apiUrl}
              </div>
            </section>

            {/* Method */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1">Phương thức</div>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-600 border-blue-200"
              >
                POST
              </Badge>
            </section>

            {/* Headers */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1">Headers</div>
              <div className="bg-muted px-4 py-2 rounded-lg font-mono text-sm w-full break-all max-w-full">
                Authorization: Bearer{" "}
                <span
                  className="italic break-all block max-w-full overflow-x-auto whitespace-pre-wrap"
                >
                  {token}
                </span>
              </div>
            </section>

            {/* FormData */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1 flex items-center justify-between">
                <span>Dữ liệu gửi đi (FormData)</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() => handleCopy('formdata', JSON.stringify({
                    query: "Tin nhắn của bạn ở đây",
                    bot_id: botId,
                    conversation_id: "id_cuộc_hội_thoại_tùy_chọn",
                    model_name: "gemini-2.5-flash-preview-05-20",
                    api_key: currentApiKey,
                    attachs: [],
                  }, null, 2))}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'formdata' ? 'Đã copy!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-muted px-4 py-2 rounded-lg text-xs w-full overflow-x-auto break-words whitespace-pre-wrap ">
                {JSON.stringify(
                  {
                    query: "Tin nhắn của bạn ở đây",
                    bot_id: botId,
                    conversation_id: "id_cuộc_hội_thoại_tùy_chọn",
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
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1">Tham số</div>
              <div className="space-y-2">
                <div>
                  <Badge variant="outline">query</Badge>{" "}
                  <span> Tin nhắn của người dùng (chuỗi)</span>
                </div>
                <div>
                  <Badge variant="outline">bot_id</Badge>{" "}
                  <span> ID duy nhất của chatbot</span>
                </div>
                <div>
                  <Badge variant="outline">conversation_id</Badge>{" "}
                  <span> (Tùy chọn) Để duy trì ngữ cảnh hội thoại</span>
                </div>
                <div>
                  <Badge variant="outline">model_name</Badge>{" "}
                  <span>
                    {" "}
                    gemini-2.5-flash-preview-05-20 hoặc gemini-2.0-flash
                  </span>
                </div>
                <div>
                  <Badge variant="outline">api_key</Badge>{" "}
                  <span> API key của bạn (hiện tại: {currentApiKey})</span>
                </div>
                <div>
                  <Badge variant="outline">attachs</Badge>{" "}
                  <span> Mảng file đính kèm (nếu có)</span>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t my-2 px-4" />

            {/* Response Format */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1 flex items-center justify-between">
                <span>Định dạng phản hồi</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() => handleCopy('response-message', JSON.stringify({
                    type: "message",
                    content: "Nội dung tin nhắn streaming...",
                  }, null, 2))}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'response-message' ? 'Đã copy!' : 'Copy'}
                </button>
              </div>
              <div className="text-sm mb-2">
                API trả về streaming dạng Server-Sent Events (SSE). Mỗi phản hồi là một JSON:
              </div>
              <pre className="bg-muted px-4 py-2 rounded-lg text-xs w-full overflow-x-auto break-words whitespace-pre">
                {JSON.stringify(
                  {
                    type: "message",
                    content: "Nội dung tin nhắn streaming...",
                  },
                  null,
                  2
                )}
              </pre>
              <div className="text-sm mt-2 mb-2 flex items-center justify-between">
                <span>Phản hồi cuối cùng:</span>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 text-xs flex items-center gap-1"
                  onClick={() => handleCopy('response-final', JSON.stringify({
                    type: "final",
                    content: {
                      final_response: "Tin nhắn phản hồi hoàn chỉnh",
                      selected_ids: [],
                      selected_documents: [],
                    },
                  }, null, 2))}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'response-final' ? 'Đã copy!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-muted px-4 py-2 rounded-lg text-xs w-full overflow-x-auto break-words whitespace-pre">
                {JSON.stringify(
                  {
                    type: "final",
                    content: {
                      final_response: "Tin nhắn phản hồi hoàn chỉnh",
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
            <div className="border-t my-2 px-4" />

            {/* Example with Tabs */}
            <section className="mb-4 px-4">
              <div className="font-semibold text-base mb-1 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Ví dụ triển khai
              </div>
              <Tabs defaultValue="fetch" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fetch">Fetch API</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>
                <TabsContent value="fetch">
                  <div className="relative">
                    <button
                      className="absolute top-2 right-2 z-10 p-1 bg-background rounded hover:bg-gray-100 text-sm flex items-center gap-1"
                      onClick={() => handleCopy('fetch', exampleCode)}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                      {copied === 'fetch' ? 'Đã copy!' : 'Copy'}
                    </button>
                    <span className="break-all block max-w-full overflow-x-auto whitespace-pre-wrap text-pretty text-sm bg-muted p-2 rounded-lg">
                      {exampleCode}
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="curl">
                  <div className="relative">
                    <button
                      className="absolute top-2 right-2 z-10 p-1 bg-background rounded hover:bg-gray-100 text-sm flex items-center gap-1"
                      onClick={() => handleCopy('curl', curlExample)}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                      {copied === 'curl' ? 'Đã copy!' : 'Copy'}
                    </button>
                    <span className="break-all block max-w-full overflow-x-auto whitespace-pre-wrap text-pretty text-sm bg-muted p-2 rounded-lg">
                      {curlExample}
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            {/* Alert Warning */}
            <div className="px-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Lưu ý</AlertTitle>
                <AlertDescription>
                  Đảm bảo xử lý lỗi phù hợp khi tích hợp API vào hệ thống của bạn.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </ScrollArea>
        <DialogClose>
          <Button variant="outline" className="w-full bg-foreground text-background">
            Đóng
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
