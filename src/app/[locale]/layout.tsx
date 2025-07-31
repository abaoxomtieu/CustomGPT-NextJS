import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "./app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AI FTES - Nền tảng AI thông minh",
    template: "%s | AI FTES",
  },
  description:
    "Nền tảng AI FTES cung cấp các giải pháp trí tuệ nhân tạo tiên tiến, chatbot thông minh và công cụ AI đa dạng cho mọi nhu cầu.",
  keywords: [
    "AI FTES",
    "trí tuệ nhân tạo",
    "chatbot AI",
    "AI platform",
    "machine learning",
    "AI tools",
    "artificial intelligence",
    "AI Vietnam",
  ],
  authors: [{ name: "AI FTES Team" }],
  creator: "AI FTES",
  publisher: "AI FTES",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://ai.ftes.vn",
    siteName: "AI FTES",
    title: "AI FTES - Nền tảng AI thông minh",
    description:
      "Nền tảng AI FTES cung cấp các giải pháp trí tuệ nhân tạo tiên tiến, chatbot thông minh và công cụ AI đa dạng cho mọi nhu cầu.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "AI FTES - Nền tảng AI thông minh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI FTES - Nền tảng AI thông minh",
    description:
      "Nền tảng AI FTES cung cấp các giải pháp trí tuệ nhân tạo tiên tiến, chatbot thông minh và công cụ AI đa dạng cho mọi nhu cầu.",
    images: ["/logo.svg"],
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
    canonical: "https://ai.ftes.vn",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <NextIntlClientProvider>
          <QueryProvider>
            <GoogleOAuthProvider clientId="486285301849-fjcp1e941fdrhkpj0ufjom8mqu8r0chv.apps.googleusercontent.com">
              <SidebarProvider defaultOpen={true}>
                <Toaster />
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  <AppSidebar />
                  <SidebarInset>
                    <div className="w-full">{children}</div>
                  </SidebarInset>
                </ThemeProvider>
              </SidebarProvider>
            </GoogleOAuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
