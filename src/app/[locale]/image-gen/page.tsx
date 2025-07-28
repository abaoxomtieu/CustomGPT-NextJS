import { Metadata } from "next";
import ImageGenClient from "./image-gen-client";
import { Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Image Generation",
  description: "Generate images using AI with text prompts and optional image inputs",
};

export default function ImageGenPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background/80 to-background/95 py-4 px-2 w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_25%_25%,rgba(var(--primary),0.08)_0%,transparent_60%),radial-gradient(circle_at_75%_75%,rgba(var(--primary),0.04)_0%,transparent_60%)] mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6 px-4 py-6 md:py-8">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#a21caf] to-[#2563eb] bg-clip-text text-transparent animate-fade-in">
              Tạo ảnh AI từ văn bản
            </h1>
            <p className="text-base md:text-lg text-muted-foreground animate-fade-in">
              Nhập mô tả hoặc tải ảnh tham chiếu để AI tạo ra hình ảnh sáng tạo, độc đáo cho bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in">
              <Link href="/">
                <Button variant="outline" className="h-10 px-6 text-base rounded-full">
                  Trang chủ
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden group shadow-xl">
              <ImageIcon className="h-12 w-12 md:h-20 md:w-20 text-primary/70" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>
      {/* Image Generation Client Section */}
      <section>
        <ImageGenClient />
      </section>
    </main>
  );
} 