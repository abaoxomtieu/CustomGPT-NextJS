"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Book,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { setCookie, getCookie } from "@/helpers/Cookies";
import axios from "axios";
import { ApiDomain } from "@/constant";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { updateUser } from "@/services/account";

const modelOptions = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash-preview-05-20" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  contact_number: z.string().min(1, "Vui lòng nhập số điện thoại"),
  major: z.enum(["SE", "AI", "IB"], { required_error: "Chọn chuyên ngành" }),
});

const geminiSchema = z.object({
  api_key: z.string().min(1, "Nhập API key của bạn"),
  model_name: z.string().min(1, "Chọn model mà bạn muốn test"),
});

export default function ProfileClient() {
  const router = useRouter();
  const { userInfo, setUserInfo, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Profile form
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      contact_number: "",
      major: undefined,
    },
  });

  // Gemini form
  const geminiForm = useForm({
    resolver: zodResolver(geminiSchema),
    defaultValues: {
      api_key: getCookie("gemini_api_key") || "",
      model_name: getCookie("gemini_model_name") || "gemini-2.0-flash",
    },
  });

  useEffect(() => {
    if (!isLoading && !userInfo?.id) {
      router.push("/");
    }
    if (!isLoading && userInfo?.id) {
      form.reset({
        name: userInfo.name || "",
        contact_number: userInfo.contact_number || "",
        major: (userInfo.major as "SE" | "AI" | "IB") || "SE",
      });
    }
    // eslint-disable-next-line
  }, [userInfo, isLoading]);

  // Xử lý update user
  const onSubmit = async (values: any) => {
    if (!userInfo?.id) {
      toast.error("Không tìm thấy user");
      return;
    }
    setLoading(true);
    try {
      const response = await updateUser(userInfo.id, values);
      if (response.status === 200) {
        toast.success("Cập nhật thành công");
        setUserInfo({ ...userInfo, ...values });
        router.push("/");
      }
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý test Gemini API key
  const handleTestGeminiKey = async () => {
    try {
      const values = geminiForm.getValues();
      await geminiForm.trigger();
      setTesting(true);

      const formData = new FormData();
      formData.append("api_key", values.api_key);
      formData.append("model_name", values.model_name);

      const response = await axios.post(
        `${ApiDomain}/ai/test_gemini_api_key`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        toast.success("API key hợp lệ!");
        setIsApiKeyValid(true);
      }
    } catch (error: any) {
      if (error?.response?.data?.error) {
        toast.error("API key không hợp lệ");
      } else {
        toast.error("Không thể test API key");
      }
      setIsApiKeyValid(false);
    } finally {
      setTesting(false);
    }
  };

  // Lưu Gemini API Key
  const handleSaveGeminiKey = async () => {
    try {
      await geminiForm.trigger();
      const values = geminiForm.getValues();
      setLoading(true);
      setCookie("gemini_api_key", values.api_key, 100);
      setCookie("gemini_model_name", values.model_name, 100);
      toast.success("Lưu API key thành công");
      setIsSaved(true);
    } catch {
      toast.error("Vui lòng điền đầy đủ thông tin");
    } finally {
      setLoading(false);
    }
  };

  // Reset trạng thái khi đổi trường form
  const handleGeminiFormChange = () => {
    setIsApiKeyValid(false);
    setIsSaved(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-16 w-16 text-primary" />
          <span className="text-foreground">
            Đang kiểm tra thông tin đăng nhập...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 flex flex-col items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Quay lại</span>
        </Button>

        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card text-background/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl md:text-2xl text-center text-card-foreground">
              Chào mừng đến với AI FTES
            </CardTitle>
            <p className="text-sm md:text-base text-center text-muted-foreground">
              Vui lòng hoàn thiện hồ sơ để bắt đầu sử dụng.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">
                        <User className="inline mr-1" size={16} />
                        Họ và tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập họ và tên"
                          {...field}
                          className="bg-background/80 border-border/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">
                        <Phone className="inline mr-1" size={16} />
                        Số điện thoại
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập số điện thoại"
                          {...field}
                          className="bg-background/80 border-border/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">
                        <Book className="inline mr-1" size={16} />
                        Chuyên ngành
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/80 border-border/50 text-foreground">
                            <SelectValue placeholder="Chọn chuyên ngành" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SE">
                            Software Engineering
                          </SelectItem>
                          <SelectItem value="AI">
                            Artificial Intelligence
                          </SelectItem>
                          <SelectItem value="IB">
                            International Business
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật hồ sơ"
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label className="text-card-foreground">Gemini API Key</Label>
                {isApiKeyValid ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="mr-1" size={16} />
                    <span className="text-sm">API key hợp lệ</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-500">
                    <AlertCircle className="mr-1" size={16} />
                    <span className="text-sm">Chưa xác thực</span>
                  </div>
                )}
              </div>

              <Form {...geminiForm}>
                <form onChange={handleGeminiFormChange} className="space-y-4">
                  <FormField
                    control={geminiForm.control}
                    name="api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Nhập Gemini API key"
                            {...field}
                            className="bg-background/80 border-border/50 text-foreground placeholder:text-muted-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={geminiForm.control}
                    name="model_name"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-border/50 text-foreground">
                              <SelectValue placeholder="Chọn model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-foreground"
                      onClick={handleTestGeminiKey}
                      disabled={testing}
                    >
                      {testing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang kiểm tra...
                        </>
                      ) : (
                        "Kiểm tra API key"
                      )}
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSaveGeminiKey}
                      disabled={loading || !isApiKeyValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu API key"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
