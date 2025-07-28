"use client";

import React, { lazy, Suspense } from "react";
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
import { Brain, ArrowRight, Sparkles, Zap, Users, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

// Intersection Observer hook for fade-in animations
const useIntersectionObserver = () => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll("[data-fade]")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

// Parallax Scrolling hook
const useParallaxScrolling = () => {
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll("[data-parallax]");

      parallaxElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const speed = parseFloat(
          htmlElement.getAttribute("data-speed") || "0.5"
        );
        const yPos = -(scrolled * speed);
        htmlElement.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};

const HomeClient: React.FC = () => {
  useIntersectionObserver();
  useParallaxScrolling();
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Enhanced Hero Section with Parallax */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_25%_25%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(var(--primary),0.05)_0%,transparent_50%)] min-h-screen flex items-center">
        {/* Parallax Background Elements */}
        <div
          className="absolute inset-0 opacity-20"
          data-parallax
          data-speed="0.3"
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-primary/15 rounded-full blur-lg" />
        </div>

        <div
          className="absolute inset-0 opacity-10"
          data-parallax
          data-speed="0.6"
        >
          <div className="absolute top-60 right-10 w-40 h-40 bg-primary/8 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-1/3 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1
                  className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent opacity-0"
                  data-fade
                >
                  {t("title")}
                </h1>
                <h2
                  className="text-xl md:text-4xl text-foreground font-bold opacity-0"
                  data-fade
                >
                  {t("subtitle")}
                </h2>
                <p
                  className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto opacity-0"
                  data-fade
                >
                  {t("description")}
                </p>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-6 justify-center opacity-0"
                data-fade
              >
                <Link href="/assistants" className="group">
                  <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl transition-all duration-200 rounded-full shadow-lg hover:shadow-xl">
                    {t("start_now")}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/create-prompt">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl transition-all duration-200 rounded-full border-2"
                  >
                    {t("create_chatbot")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Zigzag Layout */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16 opacity-0" data-fade>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("features_title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những tính năng mạnh mẽ giúp bạn tạo ra những trải nghiệm
            AI tuyệt vời
          </p>
        </div>

        <div className="space-y-20">
          {[
            {
              icon: <FcReading className="text-4xl" />,
              title: t("features.create_chatbot.title"),
              description: t("features.create_chatbot.description"),
              direction: "left",
              image: "1.jpeg",
            },
            {
              icon: <Brain className="text-4xl" />,
              title: t("features.ai_combat.title"),
              description: t("features.ai_combat.description"),
              direction: "right",
              image: "2.jpeg",
            },
            {
              icon: <FcDataBackup className="text-4xl" />,
              title: t("features.api_integration.title"),
              description: t("features.api_integration.description"),
              direction: "left",
              image: "3.jpeg",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`ml-20 grid lg:grid-cols-2 gap-12 items-center opacity-0 ${
                feature.direction === "right" ? "lg:grid-flow-col-dense" : ""
              }`}
              data-fade
            >
              {/* Content */}
              <div
                className={`space-y-6 ${
                  feature.direction === "left"
                    ? "-translate-x-5 lg:translate-x-0"
                    : "translate-x-5 lg:translate-x-0"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <Button variant="outline" className="group">
                  Tìm hiểu thêm
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Image */}
              <div
                className={`${
                  feature.direction === "right" ? "lg:order-first" : ""
                }`}
              >
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                  <Image
                    src={`/${feature.image}`}
                    alt={`Feature ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Management Section with Bento Grid */}
      <section className="bg-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 opacity-0" data-fade>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t("management_title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quản lý và tối ưu hóa chatbot của bạn với bộ công cụ toàn diện
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Featured Card */}
            <div
              className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-card/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-border/10 hover:border-primary/50 hover:shadow-xl transition-all duration-200 opacity-0 relative overflow-hidden"
              data-fade
            >
              <div className="space-y-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10">
                  <FcSettings className="text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("management.manage.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("management.manage.description")}
                </p>
                <Button className="mt-4">
                  Bắt đầu quản lý
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Regular Cards */}
            {[
              {
                icon: <FcGlobe className="text-3xl" />,
                title: t("management.public.title"),
                description: t("management.public.description"),
              },
              {
                icon: <FcVoicePresentation className="text-3xl" />,
                title: t("management.conversation.title"),
                description: t("management.conversation.description"),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-border/10 hover:border-primary/50 hover:shadow-xl transition-all duration-200 opacity-0"
                data-fade
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="relative">
          <div
            className="bg-card/80 backdrop-blur-md rounded-3xl p-8 md:p-16 shadow-lg border border-border/10 hover:border-primary/50 hover:shadow-xl transition-all duration-200 opacity-0"
            data-fade
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                  {t("cta.title")}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t("cta.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/assistants">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl group">
                      {t("cta.button")}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-12 px-8 text-lg rounded-full"
                  >
                    Xem demo
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                  <Image
                    src="/5.jpeg"
                    alt="CTA Image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full animate-[float_6s_ease-in-out_infinite]" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full animate-[float_6s_ease-in-out_infinite_-2s]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeClient;
