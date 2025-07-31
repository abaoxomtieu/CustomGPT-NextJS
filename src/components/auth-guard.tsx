"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/login-button";
import { Lock, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoginPrompt?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = "/",
  showLoginPrompt = true,
}) => {
  const { isLogin, isLoading } = useAuth();
  const router = useRouter();
  // const t = useTranslations("auth");

  useEffect(() => {
    // Nếu không loading và chưa đăng nhập, redirect về trang chủ
    if (!isLoading && !isLogin && !showLoginPrompt) {
      router.push(redirectTo);
    }
  }, [isLogin, isLoading, router, redirectTo, showLoginPrompt]);

  // Hiển thị loading skeleton khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background/80 via-blue-primary/5 to-background/95 py-4 px-2 w-full">
        <div className="container mx-auto">
          <Card className="mb-6 border-blue-60/20">
            <CardHeader className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-blue-60/20">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập và showLoginPrompt = true, hiển thị trang yêu cầu đăng nhập
  if (!isLogin && showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background/80 via-blue-primary/5 to-background/95 flex items-center justify-center py-4 px-2">
        <Card className="w-full max-w-md border-blue-60/20 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-primary/10 to-blue-60/20 rounded-full flex items-center justify-center border border-blue-primary/20">
              <Lock className="w-8 h-8 text-blue-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-primary to-blue-active bg-clip-text text-transparent">
                Yêu cầu đăng nhập
              </h1>
              <p className="text-muted-foreground">
                Bạn cần đăng nhập để truy cập trang này
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Truy cập bị hạn chế</p>
                <p>
                  Trang này chỉ dành cho người dùng đã đăng nhập. Vui lòng đăng
                  nhập để tiếp tục.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={"/login"}
                className="w-full bg-blue-primary hover:bg-blue-active text-white flex items-center justify-center gap-2 rounded-md"
              >
                Đi đến trang đăng nhập
              </Link>
              <Button
                variant="outline"
                onClick={() => router.push(redirectTo)}
                className="w-full border-blue-60/30 hover:border-blue-primary/50 hover:bg-blue-primary/5"
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nếu chưa đăng nhập và showLoginPrompt = false, không render gì (sẽ redirect)
  if (!isLogin && !showLoginPrompt) {
    return null;
  }

  // Nếu đã đăng nhập, render children
  return <>{children}</>;
};

export default AuthGuard;
