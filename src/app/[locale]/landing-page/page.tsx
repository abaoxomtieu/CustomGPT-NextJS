"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  TestTube, 
  GraduationCap, 
  ImageIcon, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import ParticlesBackground from "../../../components/back-ground";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features, 
  href 
}: {
  icon: any;
  title: string;
  description: string;
  features: string[];
  href: string;
}) => (
  <Card className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-2 hover:border-blue-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardHeader className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-primary/10 group-hover:bg-blue-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-blue-primary" />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </div>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardHeader>
    <CardContent className="relative">
      <div className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
      <Link href={href}>
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-blue-primary group-hover:text-white transition-colors"
        >
          Try Now <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-background to-muted/20 border">
    <div className="text-3xl font-bold text-blue-primary mb-2">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default function LandingPage() {
  const t = useTranslations("landingPage");

  const features = [
    {
      icon: TestTube,
      title: t("features.apiTesting.title"),
      description: t("features.apiTesting.description"),
      features: t("features.apiTesting.features").split(","),
      href: "/api-testing"
    },
    {
      icon: Code,
      title: t("features.codeGrader.title"),
      description: t("features.codeGrader.description"),
      features: t("features.codeGrader.features").split(","),
      href: "/code-grader"
    },
    {
      icon: GraduationCap,
      title: t("features.gradeAssignment.title"),
      description: t("features.gradeAssignment.description"),
      features: t("features.gradeAssignment.features").split(","),
      href: "/grade-assignment"
    },
    {
      icon: ImageIcon,
      title: t("features.imageGeneration.title"),
      description: t("features.imageGeneration.description"),
      features: t("features.imageGeneration.features").split(","),
      href: "/image-gen"
    }
  ];

  const languages = t("technologies.languages.list").split(",");
  const frameworks = t("technologies.frameworks.list").split(",");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-blue-primary/5">
      {/* Particles Background */}
      <ParticlesBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("hero.trustedBy")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-primary via-purple-600 to-blue-primary bg-clip-text text-transparent mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              {t("hero.subtitle")}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-blue-primary hover:bg-blue-primary/90">
                  <Zap className="w-5 h-5 mr-2" />
                  {t("hero.getStarted")}
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
                {t("hero.learnMore")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number={t("stats.testCases.number")} label={t("stats.testCases.label")} />
            <StatCard number={t("stats.codeFiles.number")} label={t("stats.codeFiles.label")} />
            <StatCard number={t("stats.assignments.number")} label={t("stats.assignments.label")} />
            <StatCard number={t("stats.images.number")} label={t("stats.images.label")} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative z-10 py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("technologies.title")}</h2>
            <p className="text-xl text-muted-foreground">
              {t("technologies.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">{t("technologies.languages.title")}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {languages.map((lang, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                    {lang.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">{t("technologies.frameworks.title")}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {frameworks.map((framework, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                    {framework.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-blue-primary/10 via-purple-500/10 to-blue-primary/10 rounded-3xl p-12 border">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("cta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-blue-primary hover:bg-blue-primary/90">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t("cta.primaryButton")}
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
                <Users className="w-5 h-5 mr-2" />
                {t("cta.secondaryButton")}
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-2">Rated 5/5 by developers and educators</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}