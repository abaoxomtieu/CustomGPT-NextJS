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
import {
  Brain,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Target,
  TestTube,
  Code,
  GraduationCap,
  ImageIcon,
  CheckCircle,
  Star,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import ParticlesBackground from "../../components/back-ground";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Mobile Controls Component
  const MobileControls = () => {
    if (!isMobile) return null;

    return (
      <div className="fixed top-4 right-4 z-50 flex gap-2 md:hidden">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm border-blue-primary/20 hover:border-blue-primary/50 shadow-lg"
            >
              <Globe className="w-4 h-4 mr-2" />
              {locale.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-blue-primary/20">
            <DropdownMenuItem
              onClick={() => switchLanguage("en")}
              className="hover:bg-blue-primary/10"
            >
              <span className="mr-2">🇺🇸</span>
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLanguage("vi")}
              className="hover:bg-blue-primary/10"
            >
              <span className="mr-2">🇻🇳</span>
              Tiếng Việt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-background/80 backdrop-blur-sm border-blue-primary/20 hover:border-blue-primary/50 shadow-lg"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-primary/35 to-background/95">
      {/* Mobile Controls - Only visible on mobile */}
      <MobileControls />
      
      {/* Enhanced Hero Section with Parallax and Particles */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Particles Background */}
        <ParticlesBackground />

        {/* Parallax Background Elements - Reduced opacity for better particles visibility */}
        <div
          className="absolute inset-0 opacity-5 z-2"
          data-parallax
          data-speed="0.3"
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-primary/3 rounded-full blur-2xl" />
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-primary/8 rounded-full blur-lg" />
        </div>

        <div
          className="absolute inset-0 opacity-3 z-2"
          data-parallax
          data-speed="0.6"
        >
          <div className="absolute top-60 right-10 w-40 h-40 bg-primary/4 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-1/3 w-60 h-60 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent opacity-0"
                  data-fade
                >
                  {t("title")}
                </h1>
                <h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground font-bold opacity-0"
                  data-fade
                >
                  {t("subtitle")}
                </h2>
                <p
                  className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed max-w-3xl mx-auto opacity-0"
                  data-fade
                >
                  {t("description")} Platform tích hợp đầy đủ các công cụ AI
                  tiên tiến: API Testing tự động, Code Grader thông minh,
                  Assignment Grader với OCR, và AI Image Generator - tất cả
                  trong một nền tảng thống nhất.
                </p>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-6 justify-center opacity-0"
                data-fade
              >
                <Link href="/assistants" className="group">
                  <Button className="w-full sm:w-auto bg-blue-primary text-background hover:bg-blue-active h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl border-0">
                    {t("start_now")}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/create-prompt">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg transition-all duration-200 rounded-full border-2"
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
      <section className="container mx-auto px-4 py-12 md:py-20 relative">
        {/* Subtle particles for other sections */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 right-10 w-1 h-1 bg-blue-600 rounded-full animate-ping delay-700"></div>
        </div>

        <div className="text-center mb-16 opacity-0 relative z-10" data-fade>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-60/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("features_title")}
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Khám phá những tính năng mạnh mẽ và công cụ AI tiên tiến giúp bạn
              tạo ra những trải nghiệm tuyệt vời trong phát triển phần mềm và
              giáo dục
            </p>
          </div>
        </div>

        <div className="space-y-20 relative z-10">
          {[
            {
              icon: <FcReading className="text-4xl" />,
              title: t("features.create_chatbot.title"),
              description: t("features.create_chatbot.description"),
              direction: "left",
              image: "1.jpeg",
              href: "/create-prompt",
              features: [
                "AI-powered chatbot creation",
                "Custom personality design",
                "Multi-purpose assistants",
                "Easy configuration",
              ],
            },
            {
              icon: <Brain className="text-4xl" />,
              title: t("features.ai_combat.title"),
              description: t("features.ai_combat.description"),
              direction: "right",
              image: "2.jpeg",
              href: "/ai-combat",
              features: [
                "AI vs AI battles",
                "Strategic thinking",
                "Performance analysis",
                "Learning insights",
              ],
            },
            {
              icon: <FcDataBackup className="text-4xl" />,
              title: t("features.api_integration.title"),
              description: t("features.api_integration.description"),
              direction: "left",
              image: "3.jpeg",
              href: "/assistants",
              features: [
                "REST API export",
                "Easy integration",
                "Developer-friendly",
                "Real-time responses",
              ],
            },
            {
              icon: <TestTube className="text-4xl text-blue-500" />,
              title: "Smart API Testing",
              description:
                "AI-powered REST API test case generation and validation. Automatically create comprehensive test suites with intelligent assertions and detailed reporting.",
              direction: "right",
              image: "4.jpeg",
              href: "/api-testing",
              features: [
                "Auto test case generation",
                "Multi-method support",
                "Smart assertions",
                "Detailed reporting",
              ],
            },
            {
              icon: <Code className="text-4xl text-green-500" />,
              title: "Intelligent Code Grader",
              description:
                "Advanced AI evaluation for code quality, structure, and best practices across multiple programming languages with detailed feedback.",
              direction: "left",
              image: "5.jpeg",
              href: "/code-grader",
              features: [
                "Multi-language support",
                "Code quality analysis",
                "Structure evaluation",
                "Detailed feedback",
              ],
            },
            {
              icon: <GraduationCap className="text-4xl text-purple-500" />,
              title: "Assignment Grader",
              description:
                "Automated grading system with OCR text extraction and AI-powered answer evaluation for educational assignments.",
              direction: "right",
              image: "6.jpeg",
              href: "/grade-assignment",
              features: [
                "OCR text extraction",
                "Auto question detection",
                "AI-powered grading and anwering",
                "Statistical analysis",
              ],
            },
            {
              icon: <ImageIcon className="text-4xl text-pink-500" />,
              title: "AI Image Creator",
              description:
                "Generate stunning images from text prompts or transform existing images with advanced AI technology and multiple artistic styles.",
              direction: "left",
              image: "7.jpeg",
              href: "/image-gen",
              features: [
                "Text-to-image",
                "Image-to-image",
                "High quality output",
                "Multiple styles",
              ],
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center opacity-0 px-4 sm:px-6 lg:px-0 ${
                feature.direction === "right" ? "lg:grid-flow-col-dense" : ""
              }`}
              data-fade
            >
              {/* Content */}
              <div
                className={`space-y-6 ${
                  // Mobile: alternate left/right positioning based on index
                  index % 2 === 0
                    ? "translate-x-0 sm:translate-x-3"
                    : "translate-x-0 sm:-translate-x-3"
                } ${
                  // Desktop: follow feature direction
                  feature.direction === "left"
                    ? "lg:translate-x-0"
                    : "lg:translate-x-0"
                }`}
              >
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-60/20 hover:border-blue-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 hover:scale-105">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-lg text-foreground leading-relaxed mt-4">
                    {feature.description}
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {feature.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Link href={feature.href || "#"}>
                      <Button className="bg-blue-primary hover:bg-blue-active text-white">
                        Try Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="group">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
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
      <section className="py-12 md:py-20 relative">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden ">
          <div className="absolute top-16 left-16 w-3 h-3 bg-blue-400/50 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-blue-500/50 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-blue-300/50 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 opacity-0" data-fade>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("management_title")}
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Quản lý và tối ưu hóa chatbot của bạn với bộ công cụ toàn diện
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Featured Card */}
            <div
              className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-card/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-blue-60/20 hover:border-blue-primary/50 hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              data-fade
            >
              <div className="space-y-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-primary/10">
                  <FcSettings className="text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("management.manage.title")}
                </h3>
                <p className="text-foreground">
                  {t("management.manage.description")}
                </p>
                <Button className="sm:w-auto bg-blue-primary text-background hover:bg-blue-active h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl border-0">
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
                className="bg-card/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-blue-60/20 hover:border-blue-primary/50 hover:shadow-xl transition-all duration-200 opacity-0"
                data-fade
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-primary/10">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative">
        {/* Floating particles for CTA */}
        <div className="absolute inset-0 overflow-hidden opacity-25">
          <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/60 rounded-full animate-float"></div>
          <div className="absolute top-40 right-16 w-2 h-2 bg-blue-500/60 rounded-full animate-float delay-300"></div>
          <div className="absolute bottom-40 left-1/3 w-3 h-3 bg-blue-300/60 rounded-full animate-float delay-700"></div>
          <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-blue-600/60 rounded-full animate-float delay-1000"></div>
        </div>

        <div className="relative z-10">
          <div
            className="bg-card/80 backdrop-blur-md rounded-3xl p-8 md:p-16 shadow-lg border border-blue-60/20 hover:border-blue-primary/50 hover:shadow-xl transition-all duration-200 opacity-0"
            data-fade
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                  {t("cta.title")}
                </h2>
                <p className="text-lg text-foreground mb-8 leading-relaxed">
                  {t("cta.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/assistants">
                    <Button className="bg-blue-primary text-white hover:bg-blue-active h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl group border-0">
                      {t("cta.button")}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-12 px-8 text-lg rounded-full border-blue-60 text-blue-primary hover:bg-blue-40/20 hover:border-blue-primary"
                  >
                    Xem demo
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                  <Image
                    src="/cta.jpeg"
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
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-primary/20 to-blue-60/30 rounded-full animate-[float_6s_ease-in-out_infinite]" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-60/40 to-blue-40/30 rounded-full animate-[float_6s_ease-in-out_infinite_-2s]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeClient;
