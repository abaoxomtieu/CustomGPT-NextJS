"use client";

import React, { lazy, Suspense } from "react";
import Link from "next/link";
import {
  FcReading,
  FcDataBackup,
  FcCollaboration,
  FcVoicePresentation,
  FcGlobe,
  FcTimeline,
  FcSettings,
} from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

// Optimized styles with better performance
const styles = `
  .title-gradient {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .glass-effect {
    background: rgba(var(--card), 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(var(--border), 0.1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    will-change: transform;
  }

  .glass-effect:hover {
    border-color: rgba(var(--primary), 0.5);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .feature-card {
    background: rgba(var(--card), 0.8);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(var(--border), 0.1);
    will-change: transform;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--primary), 0.5);
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(var(--primary), 0.1);
    margin-bottom: 1.5rem;
    transition: transform 0.2s ease;
  }

  .icon-wrapper:hover {
    transform: scale(1.05);
  }

  .icon-wrapper svg {
    width: 40px;
    height: 40px;
    color: rgb(var(--primary));
  }

  .fade-in {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .feature-card,
    .glass-effect,
    .icon-wrapper,
    .fade-in {
      transition: none;
      transform: none;
    }
  }
`;

// Intersection Observer hook for fade-in animations
const useIntersectionObserver = () => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const HomeClient: React.FC = () => {
  useIntersectionObserver();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <style>{styles}</style>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 title-gradient fade-in">
            FTES
            <span className="block text-xl md:text-3xl text-foreground mt-2 md:mt-4">
              First Technology Education Services
            </span>
          </h2>
          <div className="mb-6 md:mb-8 text-sm md:text-base text-muted-foreground leading-relaxed text-justify fade-in">
            <p>
              <b>FTES</b> (First Technology Education Services) là hệ thống học
              tập thông minh ứng dụng trí tuệ nhân tạo (AI) nhằm mang đến trải
              nghiệm học tập cá nhân hóa, hiện đại và hiệu quả cho mọi đối tượng
              yêu thích công nghệ thông tin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 fade-in">
            <Link href="/assistants" className="w-full sm:w-auto">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/create-prompt" className="w-full sm:w-auto">
              <Button className="w-full border-primary text-background hover:bg-background/10 hover:text-foreground h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full">
                Tạo Chatbot
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-foreground fade-in">
          Tính năng nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            {
              icon: <FcReading className="text-2xl md:text-3xl" />,
              title: "Tạo Chatbot với AI",
              description: "Tạo chatbot thông minh với sự trợ giúp của chuyên gia AI, phục vụ cho từng nhu cầu cụ thể của người dùng."
            },
            {
              icon: <Brain className="text-2xl md:text-3xl" />,
              title: "Đấu trường AI",
              description: "Khám phá khả năng của các AI trong việc đối thoại và tranh luận, giúp hiểu sâu hơn về công nghệ AI."
            },
            {
              icon: <FcDataBackup className="text-2xl md:text-3xl" />,
              title: "API Integration",
              description: "Export chatbot thành API để tích hợp vào các trang web khác, phục vụ nhu cầu phát triển của developer."
            }
          ].map((feature, index) => (
            <article key={index} className="feature-card fade-in">
              <div className="icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Chatbot Management Section */}
      <section className="bg-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-foreground fade-in">
            Quản lý Chatbot Thông Minh
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: <FcSettings className="text-3xl md:text-4xl" />,
                title: "Quản lý Chatbot",
                description: "Dễ dàng quản lý và tổ chức các chatbot đã tạo, với khả năng chỉnh sửa và cập nhật thông tin."
              },
              {
                icon: <FcGlobe className="text-3xl md:text-4xl" />,
                title: "Public Chatbot",
                description: "Chia sẻ chatbot của bạn với cộng đồng và nhận phản hồi từ người dùng."
              },
              {
                icon: <FcVoicePresentation className="text-3xl md:text-4xl" />,
                title: "Quản lý Hội thoại",
                description: "Theo dõi và quản lý các cuộc hội thoại, phân tích tương tác và cải thiện chất lượng phản hồi."
              },
              {
                icon: <FcTimeline className="text-3xl md:text-4xl" />,
                title: "Lịch sử Chat",
                description: "Lưu trữ và truy xuất lịch sử chat, giúp theo dõi tiến trình và cải thiện trải nghiệm người dùng."
              }
            ].map((feature, index) => (
              <article key={index} className="feature-card fade-in">
                <div className="icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="glass-effect rounded-3xl p-6 md:p-16 text-center fade-in">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-foreground">
            Bắt đầu hành trình học tập thông minh
          </h2>
          <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            Khám phá ngay các công cụ AI được thiết kế đặc biệt cho việc học tập
            và phát triển kỹ năng.
          </p>
          <Link href="/assistants">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl">
              Xem Chatbot
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomeClient; 