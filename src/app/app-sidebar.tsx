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
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { useState } from "react";

// Menu items, chỉnh lại icon cho mục con của Chatbot
const data = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Chatbot",
    url: "/assistants",
    icon: MessageCircle,
    items: [
      {
        title: "Tạo chatbot",
        url: "/create-prompt",
        icon: Plus,
      },
      {
        title: "Danh sách chatbot",
        url: "/assistants",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Đấu trường",
    url: "/ai-combat",
    icon: Award,
  },
  {
    title: "Quản lý thông tin",
    url: "/profile",
    icon: Users,
  },
];

export function AppSidebar() {
  const { isLogin, userInfo } = useAuth();
  const { setUserInfo, setIslogin } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const { state, toggleSidebar } = useSidebar();

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check if current page should show mobile navigation
  const shouldShowMobileNav = pathname === "/" || pathname === "/profile";

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative">
        <Sidebar className="min-w-[250px] bg-background border-r h-screen">
          <SidebarContent>
            <SidebarHeader className="py-6 flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <Image src="/logo.svg" alt="logo" width={150} height={150} />
              </div>
              {userInfo && (
                <div className="flex items-center gap-2 mt-4">
                  <Image
                    src={userInfo.picture}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full w-10 h-10"
                  />
                  <p className="text-sm text-muted-foreground font-bold">
                    {userInfo.name}
                  </p>
                </div>
              )}
            </SidebarHeader>
            <SidebarGroup>
              <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
              <SidebarMenu>
                {data.map((item) =>
                  item.items ? (
                    <Collapsible
                      key={item.title}
                      className="w-full"
                      open={openItems[item.title]}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex items-center w-full px-3 py-2 gap-2 group hover:bg-sidebar-accent/60 transition rounded-2xl">
                          <item.icon className="w-5 h-5 text-muted-foreground group-data-[state=open]:text-primary transition" />
                          <span className="font-medium">{item.title}</span>
                          {openItems[item.title] ? (
                            <ChevronDown className="ml-auto w-4 h-4 transition-transform" />
                          ) : (
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-6 flex flex-col gap-1 mt-1">
                          {item.items.map((subItem) => (
                            <SidebarMenuItem key={subItem.title}>
                              <SidebarMenuButton
                                asChild
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent transition"
                              >
                                <Link href={subItem.url}>
                                  <subItem.icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-sidebar-accent/60 transition"
                      >
                        <Link href={item.url}>
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
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
          <SidebarFooter className="flex flex-col items-center gap-3 p-4">
            <ModeToggle />
            {isLogin && (
              <Button
                variant="outline"
                className="w-full flex justify-between items-center gap-2"
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
            className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 h-8 w-8 rounded-full bg-background border shadow-md hover:shadow-lg transition-all duration-200"
          >
            {state === "expanded" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="ml-4 h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </Sidebar>
      </div>

      {/* Mobile Bottom Navigation - Only show on home and profile pages */}
      {shouldShowMobileNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10 opacity-100">
          <div className="flex justify-around items-center p-2">
            {data.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            ))}
            {isLogin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteCookie("token");
                  router.push("/");
                  setUserInfo(null);
                  setIslogin(false);
                }}
                className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-xs mt-1">Đăng xuất</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
