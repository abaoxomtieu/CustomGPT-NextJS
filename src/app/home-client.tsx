"use client";

import React from "react";
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

// Animation styles
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .animate-slide-in {
    animation: slideIn 0.5s ease-out forwards;
  }

  .blue-gradient {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-foreground) 100%);
  }

  .title-gradient {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .glass-effect {
    background: var(--card);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .glass-effect:hover {
    border-color: var(--primary);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .hover-lift {
    transition: transform 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-5px);
  }

  .feature-card {
    background: var(--card);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid var(--border);
  }

  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: var(--primary);
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--primary/10);
    margin-bottom: 1.5rem;
  }

  .icon-wrapper svg {
    width: 40px;
    height: 40px;
    color: var(--primary);
  }
`;

const HomeClient: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <style>{styles}</style>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 title-gradient animate-slide-in">
            FTES
            <span className="block text-3xl text-foreground mt-4">
              First Technology Education Services
            </span>
          </h2>
          <div className="mb-8 text-base text-muted-foreground leading-relaxed text-justify">
            <p>
              <b>FTES</b> (First Technology Education Services) là hệ thống học
              tập thông minh ứng dụng trí tuệ nhân tạo (AI) nhằm mang đến trải
              nghiệm học tập cá nhân hóa, hiện đại và hiệu quả cho mọi đối tượng
              yêu thích công nghệ thông tin. Nền tảng cung cấp các khóa học từ
              cơ bản đến nâng cao, hỗ trợ người học phát triển kỹ năng, tư duy
              sáng tạo và khả năng ứng dụng công nghệ vào thực tiễn.
            </p>
            <p className="mt-3">
              Ngoài ra, FTES còn cho phép người dùng dễ dàng tạo chatbot AI phục
              vụ nhiều mục đích khác nhau, tham gia đấu trường AI để khám phá và
              tranh luận cùng các mô hình trí tuệ nhân tạo, cũng như tích hợp
              API chatbot vào website, ứng dụng của riêng mình. Đội ngũ FTES
              luôn hướng tới việc hỗ trợ giáo viên, học sinh và các nhà phát
              triển tiếp cận công nghệ mới một cách an toàn, hiệu quả và sáng
              tạo.
            </p>
          </div>
          <p
            className="text-xl text-muted-foreground mb-12 leading-relaxed animate-slide-in"
            style={{ animationDelay: "0.2s" }}
          >
            Hệ thống học tập thông minh được tích hợp AI, cung cấp các khóa học
            từ cơ bản đến nâng cao cho những người đam mê công nghệ thông tin.
          </p>
          <div
            className="space-x-6 animate-slide-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/assistants">
              <Button className="bg-foreground text-background hover:bg-foreground/80 h-14 px-10 text-lg transition-all duration-300 rounded-full">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/create-prompt">
              <Button className="border-foreground text-background hover:bg-foreground/10 h-14 px-10 text-lg transition-all duration-300 rounded-full">
                Tạo Chatbot
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Với công nghệ AI được tích hợp, FTES mong muốn hỗ trợ phát triển
              kỹ năng và tối ưu hóa quá trình học tập, hướng đến việc cá nhân
              hóa học tập theo năng lực và định hướng của người học.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <article className="feature-card">
            <div className="icon-wrapper">
              <FcReading className="text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Tạo Chatbot với AI
            </h3>
            <p className="text-muted-foreground">
              Tạo chatbot thông minh với sự trợ giúp của chuyên gia AI, phục vụ
              cho từng nhu cầu cụ thể của người dùng.
            </p>
          </article>
          <article className="feature-card">
            <div className="icon-wrapper">
              <Brain className="text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Đấu trường AI
            </h3>
            <p className="text-muted-foreground">
              Khám phá khả năng của các AI trong việc đối thoại và tranh luận,
              giúp hiểu sâu hơn về công nghệ AI.
            </p>
          </article>
          <article className="feature-card">
            <div className="icon-wrapper">
              <FcDataBackup className="text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              API Integration
            </h3>
            <p className="text-muted-foreground">
              Export chatbot thành API để tích hợp vào các trang web khác, phục
              vụ nhu cầu phát triển của developer.
            </p>
          </article>
        </div>
      </section>

      {/* Chatbot Management Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Quản lý Chatbot Thông Minh
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <article className="feature-card">
              <div className="icon-wrapper animate-float">
                <FcSettings className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Quản lý Chatbot
              </h3>
              <p className="text-muted-foreground">
                Dễ dàng quản lý và tổ chức các chatbot đã tạo, với khả năng
                chỉnh sửa và cập nhật thông tin.
              </p>
            </article>
            <article className="feature-card">
              <div className="icon-wrapper">
                <FcGlobe className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Public Chatbot
              </h3>
              <p className="text-muted-foreground">
                Chia sẻ chatbot của bạn với cộng đồng và nhận phản hồi từ người
                dùng.
              </p>
            </article>
            <article className="feature-card">
              <div className="icon-wrapper">
                <FcVoicePresentation className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Quản lý Hội thoại
              </h3>
              <p className="text-muted-foreground">
                Theo dõi và quản lý các cuộc hội thoại, phân tích tương tác và
                cải thiện chất lượng phản hồi.
              </p>
            </article>
            <article className="feature-card">
              <div className="icon-wrapper">
                <FcTimeline className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Lịch sử Chat
              </h3>
              <p className="text-muted-foreground">
                Lưu trữ và truy xuất lịch sử chat, giúp theo dõi tiến trình và
                cải thiện trải nghiệm người dùng.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* AI Combat Arena Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Đấu Trường AI
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground text-center mb-8">
              Khám phá khả năng của các AI trong việc đối thoại và tranh luận
            </p>
            <Link href="/rag-agent" className="flex justify-center">
              <Button className="bg-foreground text-background hover:bg-foreground/80 h-14 px-10 text-lg transition-all duration-300 rounded-full">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
            <div className="icon-wrapper mb-8 animate-pulse">
              <FcCollaboration className="text-6xl" />
            </div>
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Đào tạo chuyên sâu
            </h2>
            <p className="text-xl mb-12 leading-relaxed text-muted-foreground">
              FTES tổ chức các buổi tập huấn chuyên đề AI cho đội ngũ giáo viên
              tại các trường THPT/THCS, góp phần nâng cao chất lượng giảng dạy
              và cải thiện trải nghiệm học tập cho học sinh trong kỷ nguyên số.
            </p>
            <Link
              href="https://www.facebook.com/profile.php?id=61576822237399"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg transition-all duration-300 rounded-full">
                Liên hệ tư vấn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-effect rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-bold mb-8 text-foreground">
            Bắt đầu hành trình học tập thông minh
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Khám phá ngay các công cụ AI được thiết kế đặc biệt cho việc học tập
            và phát triển kỹ năng.
          </p>
          <Link href="/assistants">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg transition-all duration-300 rounded-full">
              Xem Chatbot
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomeClient; 