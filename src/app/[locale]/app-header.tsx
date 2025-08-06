"use client";
import {
  Award,
  Home,
  LogOut,
  MessageCircle,
  Users,
  Plus,
  ChevronDown,
  Languages,
  Code,
  TestTube,
  Sun,
  Moon,
  ImageIcon,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { LoginButton } from "@/components/login-button";
import { Button } from "@/components/ui/button";
import { deleteCookie } from "@/helpers/Cookies";
import useAppState from "@/context/state";
import { useRouter, usePathname, useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppHeader() {
  const { locale } = useParams();
  const { isLogin, userInfo } = useAuth();
  const { setUserInfo, setIslogin } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations("sidebar");
  const isMobile = useIsMobile();

  const data = [
    {
      title: t("home"),
      url: "/",
      icon: Home,
    },
    {
      title: "AI",
      url: "#",
      icon: Sparkles,
      items: [
        {
          title: t("chatbot_list"),
          url: "/assistants",
          icon: MessageCircle,
        },
        {
          title: t("create_chatbot"),
          url: "/assistants/editor",
          icon: Plus,
        },
        {
          title: t("prompt_optimization"),
          url: "/prompt-optimization",
          icon: Sparkles,
        },
        {
          title: t("ai_combat"),
          url: "/ai-combat",
          icon: Award,
        },
      ],
    },
    {
      title: t("image_generation"),
      url: "/image-gen",
      icon: ImageIcon,
    },
    {
      title: t("code_evaluation"),
      url: "#",
      icon: Code,
      items: [
        {
          title: t("code_grader"),
          url: "/code-grader",
          icon: Code,
        },
        {
          title: t("grade_assignment"),
          url: "/grade-assignment",
          icon: Award,
        },
        {
          title: t("api_testing"),
          url: "/api-testing",
          icon: TestTube,
        },
      ],
    },
  ];

  // Check if current page should hide header
  const shouldHideHeader =
    pathname.startsWith("/assistants/editor") ||
    pathname.startsWith("/rag-agent") ||
    pathname.startsWith(`/${locale}/assistants/editor`) ||
    pathname.startsWith(`/${locale}/rag-agent`);

  // If we should hide the header, return null
  if (shouldHideHeader) {
    return null;
  }

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "vi" : "en";
    const newPath = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, "")}`;
    router.push(newPath);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("light"); // Default to light if system
    }
  };

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/");
    setUserInfo(null);
    setIslogin(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background/95 via-background/90 to-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Responsive sizing */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="border-2 border-primary/20 rounded-lg p-2 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
              <Image
                src="/logo.svg"
                alt="logo"
                width={100}
                height={32}
                className="hover:scale-105 transition-transform duration-300 lg:w-[120px] lg:h-[40px]"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {data
              .filter((item) => {
                if (!isLogin) {
                  return (
                    item.title === t("home") ||
                    item.title === "AI" ||
                    item.title === t("image_generation")
                  );
                }
                if (
                  isMobile &&
                  item.title === t("code_evaluation")
                ) {
                  return false;
                }
                return true;
              })
              .map((item) =>
                item.items ? (
                  <DropdownMenu key={item.title}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200 px-3 py-2"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="bg-background/95 backdrop-blur-sm border-primary/20 min-w-[200px]"
                    >
                      {item.items
                        .filter((subItem) =>
                          isMobile && subItem.title === t("create_chatbot")
                            ? false
                            : true
                        )
                        .map((subItem) => (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <Link
                              href={subItem.url}
                              className="flex items-center gap-2 w-full cursor-pointer px-3 py-2"
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.title}
                    href={item.url}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                )
              )}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* User Info with Dropdown */}
            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 hover:bg-primary/10 transition-colors duration-200 px-3 py-2"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={userInfo.picture}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="rounded-full object-cover ring-2 ring-primary/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-avatar.svg";
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {userInfo.name}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 backdrop-blur-sm border-primary/20 min-w-[160px]"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full cursor-pointer px-3 py-2"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{t("profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full cursor-pointer px-3 py-2 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginButton />
            )}

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-primary/10 transition-colors duration-200 border-primary/20 px-2"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hover:bg-primary/10 transition-colors duration-200 border-primary/20 px-3 gap-2"
            >
              <span className="text-lg">
                {locale === "en" ? "🇻🇳" : "🇺🇸"}
              </span>
              <span className="text-xs font-medium">
                {locale === "en" ? "VI" : "EN"}
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* User Avatar for Mobile (if logged in) */}
            {userInfo && (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={userInfo.picture}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-2 ring-primary/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-avatar.svg";
                  }}
                />
              </div>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 flex-shrink-0"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-sm"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 justify-center">
                    <div className="border-2 border-primary/20 rounded-lg p-2">
                      <Image
                        src="/logo.svg"
                        alt="logo"
                        width={100}
                        height={30}
                      />
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* User Info */}
                  {userInfo && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="relative w-10 h-10">
                        <Image
                          src={userInfo.picture}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-full object-cover ring-2 ring-primary/20"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-avatar.svg";
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {userInfo.name}
                      </span>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="space-y-2">
                    {data
                      .filter((item) => {
                        if (!isLogin) {
                          return (
                            item.title === t("home") ||
                            item.title === "AI" ||
                            item.title === t("image_generation")
                          );
                        }
                        return true;
                      })
                      .map((item) =>
                        item.items ? (
                          <DropdownMenu key={item.title}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-primary/10"
                              >
                                <item.icon className="w-4 h-4" />
                                {item.title}
                                <ChevronDown className="w-4 h-4 ml-auto" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-56 bg-background/95 backdrop-blur-sm border-primary/20"
                            >
                              {item.items.map((subItem) => (
                                <DropdownMenuItem key={subItem.title} asChild>
                                  <Link
                                    href={subItem.url}
                                    className="flex items-center gap-2 w-full cursor-pointer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    {subItem.title}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Link
                            key={item.title}
                            href={item.url}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                          </Link>
                        )
                      )}
                  </nav>

                  {/* Controls */}
                  <div className="space-y-2 pt-4 border-t border-primary/10">
                    {/* User Profile Link (Mobile) */}
                    {isLogin && (
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{t("profile")}</span>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      onClick={toggleTheme}
                      className="w-full justify-start gap-2 hover:bg-primary/10 border-primary/20"
                    >
                      {theme === "dark" ? (
                        <Moon className="w-4 h-4" />
                      ) : (
                        <Sun className="w-4 h-4" />
                      )}
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={toggleLanguage}
                      className="w-full justify-start gap-2 hover:bg-primary/10 border-primary/20"
                    >
                      <span className="text-lg">
                        {locale === "en" ? "🇻🇳" : "🇺🇸"}
                      </span>
                      <span className="text-sm">
                        {locale === "en" ? "Tiếng Việt" : "English"}
                      </span>
                    </Button>

                    {isLogin ? (
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive border-primary/20"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </Button>
                    ) : (
                      <div className="w-full">
                        <LoginButton />
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
