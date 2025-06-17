import { ApiDomain } from "@/constant";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(ApiDomain),
  title: {
    default: "AI FTES",
    template: "%s | AI FTES",
  },
  description: "AI FTES - Nền tảng AI thông minh",
  openGraph: {
    title: "AI FTES",
    description: "AI FTES - Nền tảng AI thông minh",
    url: "/",
    siteName: "AI FTES",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI FTES",
    description: "AI FTES - Nền tảng AI thông minh",
  },
}; 