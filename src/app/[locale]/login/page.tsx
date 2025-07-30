"use client";

"use client";

import { LoginButton } from "@/components/login-button";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Chào mừng đến với FTES AI
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Đăng nhập để sử dụng đầy đủ tính năng của nền tảng
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Đăng nhập với Google
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sử dụng tài khoản Google của bạn để đăng nhập
                </p>
              </div>

              <LoginButton className="w-full" />

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  Bằng cách đăng nhập, bạn đồng ý với{" "}
                  <Button
                    variant="link"
                    className="p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => router.push("/terms")}
                  >
                    Điều khoản sử dụng
                  </Button>{" "}
                  và{" "}
                  <Button
                    variant="link"
                    className="p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => router.push("/privacy")}
                  >
                    Chính sách bảo mật
                  </Button>{" "}
                  của chúng tôi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <h3 className="text-sm font-medium text-card-foreground">
                AI Thông minh
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Sử dụng công nghệ Gemini tiên tiến
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <h3 className="text-sm font-medium text-card-foreground">
                Bảo mật cao
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Dữ liệu được mã hóa và bảo vệ
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <h3 className="text-sm font-medium text-card-foreground">
                Dễ sử dụng
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Giao diện thân thiện, trực quan
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 