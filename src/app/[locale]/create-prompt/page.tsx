import { Suspense } from "react";
import CreatePromptClient from "./create-prompt-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Chatbot AI với Trợ Lý AI | Tích Hợp Gemini API",
  description:
    "Tạo chatbot AI thông minh với trợ lý AI, tích hợp Gemini API. Hỗ trợ tạo chatbot cho hỗ trợ khách hàng, tư vấn sản phẩm và giáo dục.",
  keywords:
    "chatbot AI, trợ lý AI, Gemini API, tạo chatbot, AI assistant, chatbot hỗ trợ khách hàng",
  openGraph: {
    title: "Tạo Chatbot AI với Trợ Lý AI | Tích Hợp Gemini API",
    description:
      "Tạo chatbot AI thông minh với trợ lý AI, tích hợp Gemini API. Hỗ trợ tạo chatbot cho hỗ trợ khách hàng, tư vấn sản phẩm và giáo dục.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tạo Chatbot AI với Trợ Lý AI | Tích Hợp Gemini API",
    description:
      "Tạo chatbot AI thông minh với trợ lý AI, tích hợp Gemini API. Hỗ trợ tạo chatbot cho hỗ trợ khách hàng, tư vấn sản phẩm và giáo dục.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Trợ Lý Tạo Chatbot AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "VND",
  },
  description:
    "Công cụ tạo chatbot AI thông minh với trợ lý AI, tích hợp Gemini API. Hỗ trợ tạo chatbot cho hỗ trợ khách hàng, tư vấn sản phẩm và giáo dục.",
  featureList: [
    "Tích hợp Gemini API",
    "Hỗ trợ tạo chatbot đa dạng",
    "Giao diện thân thiện",
    "Tư vấn AI thông minh",
  ],
};

export default function CreatePromptPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        }
      >
        <CreatePromptClient />
      </Suspense>
    </>
  );
}
