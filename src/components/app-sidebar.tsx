"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      color: "text-violet-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      color: "text-pink-700",
    },
  ];

  return (
    <Sidebar className={className}>
      <SidebarHeader className="flex items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Your Logo</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === route.href}
                  tooltip={route.label}
                >
                  <Link href={route.href}>
                    <route.icon className={cn("h-4 w-4", route.color)} />
                    <span>{route.label}</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <Separator className="my-4" />
          <div className="space-y-4">
            <h4 className="px-3 text-sm font-medium">Settings</h4>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/profile"}
                  tooltip="Profile"
                >
                  <Link href="/profile">
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
