"use client";
import { Award, Home, LogOut, MessageCircle, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { LoginButton } from "@/components/login-button";
import { Button } from "@/components/ui/button";
import { deleteCookie } from "@/helpers/Cookies";
import useAppState from "@/context/state";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Danh sách chatbot",
    url: "/assistants",
    icon: MessageCircle,
  },
  {
    title: "Tạo chatbot",
    url: "/create-prompt",
    icon: MessageCircle,
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
  const { isLogin } = useAuth();
  const { setUserInfo, setIslogin } = useAppState();
  const router = useRouter();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <Image src="/logo.svg" alt="logo" width={200} height={200} />
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!isLogin && <LoginButton />}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />

        {isLogin && (
          <Button
            variant="outline"
            onClick={() => {
              deleteCookie("token");
              router.push("/");
              setUserInfo(null);
              setIslogin(false);
            }}
          >
            Đăng xuất
            <LogOut />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
