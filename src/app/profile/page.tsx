import { Metadata } from "next";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
  title: "Hồ sơ người dùng - AI FTES",
  description:
    "Quản lý thông tin cá nhân và cấu hình API của bạn. Cập nhật hồ sơ, thiết lập API key và chọn model AI phù hợp.",
  keywords:
    "Hồ sơ người dùng, Quản lý thông tin, API key, Gemini API, AI FTES, Cấu hình AI",
  openGraph: {
    title: "Hồ sơ người dùng - AI FTES",
    description:
      "Quản lý thông tin cá nhân và cấu hình API của bạn. Cập nhật hồ sơ, thiết lập API key và chọn model AI phù hợp.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hồ sơ người dùng - AI FTES",
    description:
      "Quản lý thông tin cá nhân và cấu hình API của bạn. Cập nhật hồ sơ, thiết lập API key và chọn model AI phù hợp.",
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
    canonical: "https://ai.ftes.vn/profile",
  },
};

export default function ProfilePage() {
  return (
    <main>
      <h1 className="sr-only">Hồ sơ người dùng - AI FTES</h1>
      <ProfileClient />
    </main>
  );
}
