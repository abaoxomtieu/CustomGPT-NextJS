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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <style>{styles}</style>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 title-gradient fade-in">
            {t("title")}
            <span className="block text-xl md:text-3xl text-foreground mt-2 md:mt-4">
              {t("subtitle")}
            </span>
          </h2>
          <div className="mb-6 md:mb-8 text-sm md:text-base text-muted-foreground leading-relaxed text-justify fade-in">
            <p>
              {t("description")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 fade-in">
            <Link href="/assistants" className="w-full sm:w-auto">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl">
                {t("start_now")}
              </Button>
            </Link>
            <Link href="/create-prompt" className="w-full sm:w-auto">
              <Button className="w-full border-primary text-background hover:bg-background/10 hover:text-foreground h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full">
                {t("create_chatbot")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-foreground fade-in">
          {t("features_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            {
              icon: <FcReading className="text-2xl md:text-3xl" />,
              title: t("features.create_chatbot.title"),
              description: t("features.create_chatbot.description")
            },
            {
              icon: <Brain className="text-2xl md:text-3xl" />,
              title: t("features.ai_combat.title"),
              description: t("features.ai_combat.description")
            },
            {
              icon: <FcDataBackup className="text-2xl md:text-3xl" />,
              title: t("features.api_integration.title"),
              description: t("features.api_integration.description")
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
            {t("management_title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: <FcSettings className="text-3xl md:text-4xl" />,
                title: t("management.manage.title"),
                description: t("management.manage.description")
              },
              {
                icon: <FcGlobe className="text-3xl md:text-4xl" />,
                title: t("management.public.title"),
                description: t("management.public.description")
              },
              {
                icon: <FcVoicePresentation className="text-3xl md:text-4xl" />,
                title: t("management.conversation.title"),
                description: t("management.conversation.description")
              },
              {
                icon: <FcTimeline className="text-3xl md:text-4xl" />,
                title: t("management.history.title"),
                description: t("management.history.description")
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
            {t("cta.title")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <Link href="/assistants">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg transition-all duration-200 rounded-full shadow-lg hover:shadow-xl">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomeClient; 