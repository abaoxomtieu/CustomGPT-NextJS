// Đầu tiên, cài đặt Swiper:
// npm install swiper
// npm install @types/swiper (nếu dùng TypeScript)

"use client";

import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {
  FcReading,
  FcDataBackup,
  FcSettings,
} from "react-icons/fc";
import {
  Brain,
  ArrowRight,
  TestTube,
  Code,
  GraduationCap,
  ImageIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";

const OptimizedFeaturesSection: React.FC = () => {
  const t = useTranslations("HomePage");

  const features = [
    {
      icon: <FcReading className="text-2xl" />,
      title: t("features.create_chatbot.title"),
      description: t("features.create_chatbot.description"),
      image: "1.jpeg",
      href: "/create-prompt",
      badge: "Popular",
      features: [
        "AI-powered creation",
        "Custom personality",
        "Multi-purpose",
        "Easy config"
      ],
    },
    {
      icon: <Brain className="text-2xl text-blue-500" />,
      title: t("features.ai_combat.title"),
      description: t("features.ai_combat.description"),
      image: "2.jpeg",
      href: "/ai-combat",
      badge: "New",
      features: [
        "AI vs AI battles",
        "Strategic thinking",
        "Performance analysis",
        "Learning insights"
      ],
    },
    {
      icon: <FcDataBackup className="text-2xl" />,
      title: t("features.api_integration.title"),
      description: t("features.api_integration.description"),
      image: "3.jpeg",
      href: "/assistants",
      badge: "Developer",
      features: [
        "REST API export",
        "Easy integration",
        "Developer-friendly",
        "Real-time responses"
      ],
    },
    {
      icon: <TestTube className="text-2xl text-blue-500" />,
      title: t("features.api_testing.title"),
      description: t("features.api_testing.description"),
      image: "4.jpeg",
      href: "/api-testing",
      badge: "Pro",
      features: [
        "Auto test generation",
        "Multi-method support",
        "Smart assertions",
        "Detailed reporting"
      ],
    },
    {
      icon: <Code className="text-2xl text-green-500" />,
      title: t("features.code_grader.title"),
      description: t("features.code_grader.description"),
      image: "5.jpeg",
      href: "/code-grader",
      badge: "Education",
      features: [
        "Multi-language support",
        "Code quality analysis",
        "Structure evaluation",
        "Detailed feedback"
      ],
    },
    {
      icon: <GraduationCap className="text-2xl text-purple-500" />,
      title: t("features.assignment_grader.title"),
      description: t("features.assignment_grader.description"),
      image: "6.jpeg",
      href: "/grade-assignment",
      badge: "AI-powered",
      features: [
        "OCR text extraction",
        "Auto question detection",
        "AI grading",
        "Statistical analysis"
      ],
    },
    {
      icon: <ImageIcon className="text-2xl text-pink-500" />,
      title: t("features.image_generator.title"),
      description: t("features.image_generator.description"),
      image: "7.jpeg",
      href: "/image-gen",
      badge: "Creative",
      features: [
        "Text-to-image",
        "Image-to-image",
        "High quality output",
        "Multiple styles"
      ],
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-blue-600 rounded-full animate-ping delay-700"></div>
      </div>

      {/* Section Header */}
      <div className="text-center mb-12 opacity-0 relative z-10" data-fade>
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-60/20 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("features_title")}
          </h2>
          <p className="text-lg text-foreground">
            {t("features_subtitle")}
          </p>
        </div>
      </div>

      {/* Features Swiper */}
      <div className="relative z-10" data-fade>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="features-swiper pb-12"
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <Card className="h-full bg-background/80 backdrop-blur-sm border-blue-60/20 hover:border-blue-primary/50 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3">
                  {/* Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={`/${feature.image}`}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    {/* Badge */}
                    <Badge 
                      className="absolute top-3 right-3 bg-blue-primary/90 text-white border-0"
                      variant="secondary"
                    >
                      {feature.badge}
                    </Badge>
                  </div>

                  {/* Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-primary/10 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-foreground leading-tight">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-foreground/80 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </CardDescription>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-1.5 mb-6">
                    {feature.features?.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={feature.href || "#"} className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-primary hover:bg-blue-active text-white text-sm h-9"
                      >
                        {t("ui.try_now")}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3 border-blue-60/50 hover:bg-blue-40/20 h-9"
                    >
                      {t("ui.learn_more")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            className="swiper-button-prev-custom w-10 h-10 p-0 rounded-full border-blue-60/50 hover:bg-blue-40/20 hover:border-blue-primary/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Drag to explore features</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="swiper-button-next-custom w-10 h-10 p-0 rounded-full border-blue-60/50 hover:bg-blue-40/20 hover:border-blue-primary/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .features-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        
        .features-swiper .swiper-pagination-bullet {
          background: rgb(59 130 246 / 0.3) !important;
          width: 8px !important;
          height: 8px !important;
          margin: 0 4px !important;
        }
        
        .features-swiper .swiper-pagination-bullet-active {
          background: rgb(59 130 246) !important;
          transform: scale(1.2) !important;
        }

        .features-swiper .swiper-slide {
          height: auto !important;
          display: flex !important;
        }

        .features-swiper .swiper-slide > * {
          flex: 1 !important;
        }
      `}</style>
    </section>
  );
};

export default OptimizedFeaturesSection;