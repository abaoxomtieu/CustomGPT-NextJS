"use client";
import {
  Award,
  Home,
  LogOut,
  MessageCircle,
  Users,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Languages,
  Code,
  TestTube,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { LoginButton } from "@/components/login-button";
import { Button } from "@/components/ui/button";
import { deleteCookie } from "@/helpers/Cookies";
import useAppState from "@/context/state";
import { useRouter, usePathname, useParams } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Menu items, chỉnh lại icon cho mục con của Chatbot

export function AppSidebar() {
  const { locale } = useParams();
  const { isLogin, userInfo } = useAuth();
  const { setUserInfo, setIslogin } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const { state, toggleSidebar } = useSidebar();
  const t = useTranslations("sidebar");
  const data = [
    {
      title: t("home"),
      url: "/",
      icon: Home,
    },
    {
      title: t("chatbot"),
      url: "/assistants",
      icon: MessageCircle,
      items: [
        {
          title: t("create_chatbot"),
          url: "/assistants/editor",
          icon: Plus,
        },
        {
          title: t("chatbot_list"),
          url: "/assistants",
          icon: MessageCircle,
        },
      ],
    },
    {
      title: t("ai_combat"),
      url: "/ai-combat",
      icon: Award,
    },
    {
      title: t("code_evaluation"),
      url: "/code-grader",
      icon: Code,
      items: [
        {
          title: t("code_grader"),
          url: "/code-grader",
          icon: Code,
        },
        {
          title: t("api_testing"),
          url: "/api-testing",
          icon: TestTube,
        },
      ],
    },
    {
      title: t("profile"),
      url: "/profile",
      icon: Users,
    },
  ];
  // Check if current page should hide sidebar
  const shouldHideSidebar =
    pathname.startsWith("/assistants/editor") ||
    pathname.startsWith("/rag-agent") ||
    pathname.startsWith(`/${locale}/assistants/editor`) ||
    pathname.startsWith(`/${locale}/rag-agent`);

  // If we should hide the sidebar, return null
  if (shouldHideSidebar) {
    return null;
  }

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check if current page should show mobile navigation
  const shouldShowMobileNav =
    pathname === `/${locale}` || pathname === `/${locale}/profile`;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative">
        <Sidebar className="min-w-[250px] bg-gradient-to-b from-background/95 via-background/90 to-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r h-screen shadow-lg">
          <SidebarContent>
            <SidebarHeader className="py-6 flex flex-col justify-center items-center bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex items-center gap-2 justify-center">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={150}
                  height={150}
                  className="hover:scale-105 transition-transform duration-300 rounded-4xl"
                />
              </div>
              {userInfo && (
                <div className="flex items-center gap-3 mt-4 p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200">
                  <div className="relative w-10 h-10">
                    <Image
                      src={userInfo.picture || "/default-avatar.svg"}
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
                  <p className="text-sm font-medium text-foreground">
                    {userInfo.name}
                  </p>
                </div>
              )}
            </SidebarHeader>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-primary/70 px-3">
                Sidebar
              </SidebarGroupLabel>
              <SidebarMenu>
                <ul className="flex w-full min-w-0 flex-col gap-1.5 p-2">
                  {data
                    .filter((item) => {
                      if (!isLogin) {
                        return (
                          item.title === "Home" || item.title === "Chatbot"
                        );
                      }
                      return true;
                    })
                    .map((item) =>
                      item.items ? (
                        <SidebarMenuItem key={item.title}>
                          <Collapsible
                            className="w-full"
                            open={openItems[item.title]}
                            onOpenChange={() => toggleItem(item.title)}
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="flex items-center w-full px-3 py-2.5 gap-2 group hover:bg-primary/10 transition-all duration-200 rounded-xl">
                                <item.icon className="w-5 h-5 text-primary/70 group-data-[state=open]:text-primary transition-colors duration-200" />
                                <span className="font-medium text-primary/80 group-hover:text-primary transition-colors duration-200">
                                  {item.title}
                                </span>
                                {openItems[item.title] ? (
                                  <ChevronDown className="ml-auto w-4 h-4 transition-transform duration-200 text-primary/50" />
                                ) : (
                                  <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 text-primary/50" />
                                )}
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <ul className="ml-6 flex flex-col gap-1 mt-1">
                                {item.items.map((subItem) => (
                                  <SidebarMenuItem key={subItem.title}>
                                    <SidebarMenuButton
                                      asChild
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                                    >
                                      <Link
                                        href={subItem.url}
                                        className="flex items-center gap-2 w-full"
                                      >
                                        <subItem.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors duration-200" />
                                        <span className="text-sm text-primary/70 group-hover:text-primary transition-colors duration-200">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      ) : (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all duration-200"
                          >
                            <Link
                              href={item.url}
                              className="flex items-center gap-2 w-full"
                            >
                              <item.icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                              <span className="font-medium text-primary/80 group-hover:text-primary transition-colors duration-200">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                </ul>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              {!isLogin && (
                <SidebarGroupLabel>
                  <LoginButton />
                </SidebarGroupLabel>
              )}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="flex flex-col items-center gap-3 p-4 border-t border-primary/10 bg-gradient-to-t from-primary/5 to-transparent">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center gap-2 hover:bg-primary/10 transition-colors duration-200 border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    <span>{t("language.title")}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/en${pathname.replace(/^\/[a-z]{2}/, "")}`)
                  }
                  className={locale === "en" ? "bg-primary/10" : ""}
                >
                  {t("language.en")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/vi${pathname.replace(/^\/[a-z]{2}/, "")}`)
                  }
                  className={locale === "vi" ? "bg-primary/10" : ""}
                >
                  {t("language.vi")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isLogin && (
              <Button
                variant="outline"
                className="w-full flex justify-between items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 border-primary/20"
                onClick={() => {
                  deleteCookie("token");
                  router.push("/");
                  setUserInfo(null);
                  setIslogin(false);
                }}
              >
                Đăng xuất
                <LogOut className="w-4 h-4 ml-1" />
              </Button>
            )}
          </SidebarFooter>

          {/* Custom Sidebar Trigger positioned at center right border */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 h-8 w-8 rounded-full bg-background border-primary/20 shadow-md hover:shadow-lg hover:bg-primary/10 transition-all duration-200"
          >
            {state === "expanded" ? (
              <ChevronLeft className="h-4 w-4 text-primary/70" />
            ) : (
              <ChevronRight className="ml-4 h-4 w-4 text-primary/70" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </Sidebar>
      </div>

      {/* Mobile Bottom Navigation - Only show on home and profile pages */}
      {shouldShowMobileNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-primary/10 z-10 shadow-lg">
          <div className="flex justify-around items-center p-2">
            {data
              .filter((item) => {
                if (!isLogin) {
                  return item.title === "Home" || item.title === "Chatbot";
                }
                return true;
              })
              .map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex flex-col items-center p-2 text-primary/70 hover:text-primary transition-colors duration-200"
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.title}</span>
                </Link>
              ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex flex-col items-center p-2 text-primary/70 hover:text-primary transition-colors duration-200"
                >
                  <Languages className="w-6 h-6" />
                  <span className="text-xs mt-1">{t("language.title")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/en${pathname.replace(/^\/[a-z]{2}/, "")}`)
                  }
                  className={locale === "en" ? "bg-primary/10" : ""}
                >
                  {t("language.en")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/vi${pathname.replace(/^\/[a-z]{2}/, "")}`)
                  }
                  className={locale === "vi" ? "bg-primary/10" : ""}
                >
                  {t("language.vi")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isLogin ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteCookie("token");
                  router.push("/");
                  setUserInfo(null);
                  setIslogin(false);
                }}
                className="flex flex-col items-center p-2 text-primary/70 hover:text-destructive transition-colors duration-200"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-xs mt-1">Đăng xuất</span>
              </Button>
            ) : (
              <div className="flex flex-col items-center p-2">
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
