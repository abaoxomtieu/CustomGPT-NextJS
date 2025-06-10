import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ người dùng - AI FTES",
  description: "Quản lý hồ sơ người dùng AI FTES. Cập nhật thông tin cá nhân, cài đặt API key và tùy chỉnh trải nghiệm học tập của bạn.",
  keywords: "Hồ sơ người dùng, AI FTES, Quản lý tài khoản, Cài đặt API, Tùy chỉnh AI, Thông tin cá nhân",
  openGraph: {
    title: "Hồ sơ người dùng - AI FTES",
    description: "Quản lý hồ sơ người dùng AI FTES. Cập nhật thông tin cá nhân, cài đặt API key và tùy chỉnh trải nghiệm học tập của bạn.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI FTES",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI FTES User Profile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hồ sơ người dùng - AI FTES",
    description: "Quản lý hồ sơ người dùng AI FTES. Cập nhật thông tin cá nhân, cài đặt API key và tùy chỉnh trải nghiệm học tập của bạn.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/profile',
  },
}; 