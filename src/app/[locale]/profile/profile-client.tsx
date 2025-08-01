"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Settings,
  Key,
  UserCircle,
  Home,
  ChevronRight,
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
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
  const t = useTranslations("profile");
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    const initializeProfile = async () => {
      if (!isLoading) {
        if (!userInfo?.id) {
          router.push("/");
        } else {
          form.reset({
            name: userInfo.name || "",
            contact_number: userInfo.contact_number || "",
            major: (userInfo.major as "SE" | "AI" | "IB") || "SE",
          });
        }
        setInitialLoading(false);
      }
    };
    
    initializeProfile();
    // eslint-disable-next-line
  }, [userInfo, isLoading]);

  // Xử lý update user
  const onSubmit = async (values: any) => {
    if (!userInfo?.id) {
      toast.error(t("errors.userNotFound"));
      return;
    }
    setLoading(true);
    try {
      const response = await updateUser(userInfo.id, values);
      if (response.status === 200) {
        toast.success(t("errors.saveSuccess"));
        setUserInfo({ ...userInfo, ...values });
        router.push("/");
      }
    } catch (err: any) {
      toast.error(t("errors.updateError"));
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
        toast.success(t("gemini.status.valid"));
        setIsApiKeyValid(true);
      }
    } catch (error: any) {
      if (error?.response?.data?.error) {
        toast.error(t("errors.invalidKey"));
      } else {
        toast.error(t("errors.testError"));
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
      toast.success(t("errors.saveSuccess"));
      setIsSaved(true);
    } catch {
      toast.error(t("errors.saveError"));
    } finally {
      setLoading(false);
    }
  };

  // Reset trạng thái khi đổi trường form
  const handleGeminiFormChange = () => {
    setIsApiKeyValid(false);
    setIsSaved(false);
  };

  if (isLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className={`animate-spin text-primary ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
          <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
            {isLoading ? t("loading.checking") : t("loading.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background relative overflow-hidden ${isMobile ? 'p-2' : 'p-4 sm:p-6'}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 bg-blue-primary/5 rounded-full blur-3xl animate-pulse ${isMobile ? 'w-32 h-32' : 'w-64 h-64'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 bg-blue-60/5 rounded-full blur-3xl animate-pulse delay-1000 ${isMobile ? 'w-48 h-48' : 'w-96 h-96'}`}></div>
      </div>
      
      <div className={`container mx-auto relative z-10 flex flex-col ${isMobile ? 'max-w-full px-2 py-4' : 'max-w-4xl py-8 items-center justify-center min-h-screen'}`}>
        {/* Hero Header Section */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-primary/8 via-blue-60/5 to-transparent border border-blue-60/20 shadow-lg backdrop-blur-sm animate-fade-in w-full ${isMobile ? 'mb-4' : 'mb-8 max-w-2xl'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-primary/5 via-transparent to-blue-active/5"></div>
          <div className={`relative ${isMobile ? 'p-4' : 'p-6 md:p-8'}`}>
            {/* Mobile Sidebar Trigger */}
            {isMobile && (
              <div className="flex items-center gap-3 mb-4">
                <SidebarTrigger className="flex items-center justify-center w-8 h-8 rounded-lg border border-border" />
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Link 
                    href="/" 
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    <Home className="w-3 h-3 mr-1" />
                    Trang chủ
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-medium">Hồ sơ</span>
                </nav>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`flex items-center mb-4 ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  <div className={`rounded-xl bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border border-blue-primary/20 ${isMobile ? 'p-2' : 'p-3'}`}>
                    <UserCircle className={`text-blue-primary ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                  </div>
                  <div>
                    <h1 className={`font-bold bg-gradient-to-r from-blue-primary to-blue-active bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                      User Profile
                    </h1>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
                      {isMobile ? "Quản lý tài khoản & API" : "Manage your account settings and API configurations"}
                    </p>
                  </div>
                </div>
                
                <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'}`}>
                  <div className={`flex items-center rounded-full bg-blue-primary/10 border border-blue-primary/20 ${isMobile ? 'gap-1 px-2 py-1' : 'gap-2 px-3 py-1.5'}`}>
                    <Settings className={`text-blue-primary ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                    <span className={`font-medium text-blue-primary ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {isMobile ? "Cài đặt" : "Account Settings"}
                    </span>
                  </div>
                  <div className={`flex items-center rounded-full bg-blue-60/10 border border-blue-60/20 ${isMobile ? 'gap-1 px-2 py-1' : 'gap-2 px-3 py-1.5'}`}>
                    <Key className={`text-blue-60 ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                    <span className={`font-medium text-blue-60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {isMobile ? "API" : "API Management"}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isMobile && (
                <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border-2 border-dashed border-blue-primary/30">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-primary/20 animate-ping"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-primary to-blue-active flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Back Button - only show on desktop */}
            {!isMobile && (
              <div className="mt-6 pt-4 border-t border-blue-60/10">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-blue-primary hover:bg-blue-primary/5 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("back")}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

      <div className={`w-full ${isMobile ? '' : 'max-w-2xl'}`}>

        <Card className="glass-card border-blue-60/20 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-100">
          <style jsx>{`
            .glass-card {
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .glass-card:hover {
              transform: translateY(-2px);
            }
            @media (max-width: 768px) {
              .glass-card:hover {
                transform: none;
              }
            }
          `}</style>
          <CardHeader className={`border-b border-blue-60/10 space-y-2 ${isMobile ? 'p-4' : ''}`}>
            <div className={`flex items-center justify-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <div className={`rounded-lg bg-blue-primary/10 text-blue-primary ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <CardTitle className={`font-bold text-card-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {t("title")}
              </CardTitle>
            </div>
            <p className={`text-muted-foreground text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {t("subtitle")}
            </p>
          </CardHeader>
          <CardContent className={`space-y-8 ${isMobile ? 'p-4' : 'p-6'}`}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-card-foreground ${isMobile ? 'text-sm' : ''}`}>
                        <User className={`inline mr-1 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                        {t("form.name.label")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.name.placeholder")}
                          {...field}
                          className={`bg-card/50 border-blue-60/30 hover:border-blue-primary/50 focus:border-blue-primary text-foreground placeholder:text-muted-foreground transition-colors duration-200 ${isMobile ? 'h-11 text-base' : ''}`}
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
                      <FormLabel className={`text-card-foreground ${isMobile ? 'text-sm' : ''}`}>
                        <Phone className={`inline mr-1 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                        {t("form.phone.label")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.phone.placeholder")}
                          {...field}
                          type="tel"
                          className={`bg-card/50 border-blue-60/30 hover:border-blue-primary/50 focus:border-blue-primary text-foreground placeholder:text-muted-foreground transition-colors duration-200 ${isMobile ? 'h-11 text-base' : ''}`}
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
                      <FormLabel className={`text-card-foreground ${isMobile ? 'text-sm' : ''}`}>
                        <Book className={`inline mr-1 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                        {t("form.major.label")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={`bg-background/80 border-border/50 text-foreground ${isMobile ? 'h-11' : ''}`}>
                            <SelectValue placeholder={t("form.major.placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SE">
                            {t("form.major.options.SE")}
                          </SelectItem>
                          <SelectItem value="AI">
                            {t("form.major.options.AI")}
                          </SelectItem>
                          <SelectItem value="IB">
                            {t("form.major.options.IB")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-blue-primary to-blue-active hover:from-blue-active hover:to-blue-primary shadow-md hover:shadow-lg transition-all duration-300 touch-manipulation ${isMobile ? 'h-11 text-base' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className={`mr-2 animate-spin ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                      {t("form.submit.loading")}
                    </>
                  ) : (
                    t("form.submit.text")
                  )}
                </Button>
              </form>
            </Form>

            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-2'}`}>
                <Label className={`text-card-foreground ${isMobile ? 'text-sm font-medium' : ''}`}>{t("gemini.title")}</Label>
                {isApiKeyValid ? (
                  <div className={`flex items-center text-green-500 ${isMobile ? 'text-sm' : ''}`}>
                    <CheckCircle className={`mr-1 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                    <span className="text-sm">{t("gemini.status.valid")}</span>
                  </div>
                ) : (
                  <div className={`flex items-center text-yellow-500 ${isMobile ? 'text-sm' : ''}`}>
                    <AlertCircle className={`mr-1 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                    <span className="text-sm">{t("gemini.status.invalid")}</span>
                  </div>
                )}
              </div>

              <Form {...geminiForm}>
                <form onChange={handleGeminiFormChange} className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                  <FormField
                    control={geminiForm.control}
                    name="api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("gemini.form.apiKey.placeholder")}
                            {...field}
                            type="password"
                            className={`bg-card/50 border-blue-60/30 hover:border-blue-primary/50 focus:border-blue-primary text-foreground placeholder:text-muted-foreground transition-colors duration-200 ${isMobile ? 'h-11 text-base' : ''}`}
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
                            <SelectTrigger className={`bg-card/50 border-blue-60/30 hover:border-blue-primary/50 focus:border-blue-primary text-foreground transition-colors duration-200 ${isMobile ? 'h-11' : ''}`}>
                              <SelectValue placeholder={t("gemini.form.model.placeholder")} />
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

                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-2'}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className={`text-foreground touch-manipulation ${isMobile ? 'w-full h-11 text-base' : 'flex-1'}`}
                      onClick={handleTestGeminiKey}
                      disabled={testing}
                    >
                      {testing ? (
                        <>
                          <Loader2 className={`mr-2 animate-spin ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                          {t("gemini.form.test.loading")}
                        </>
                      ) : (
                        t("gemini.form.test.text")
                      )}
                    </Button>
                    <Button
                      type="button"
                      className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg transition-all duration-300 touch-manipulation ${isMobile ? 'w-full h-11 text-base' : 'flex-1'}`}
                      onClick={handleSaveGeminiKey}
                      disabled={loading || !isApiKeyValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className={`mr-2 animate-spin ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                          {t("gemini.form.save.loading")}
                        </>
                      ) : (
                        t("gemini.form.save.text")
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
    </div>
  );
}
