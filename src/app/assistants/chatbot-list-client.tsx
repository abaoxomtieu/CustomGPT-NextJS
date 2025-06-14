"use client";

import React, { useState, useEffect } from "react";
import {
  fetchChatbots,
  deleteChatbot,
  Chatbot,
  fetchPublicChatbots,
} from "../../services/chatbotService";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, Globe, MessageCircle, Plus, Trash, Home, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackToTopButton from "@/components/back-to-top";
import { cn } from "@/lib/utils";

const ChatbotListClient: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [publicChatbots, setPublicChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [publicLoading, setPublicLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbotToDelete, setChatbotToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("my-chatbots");
  const [hasLoadedMyChatbots, setHasLoadedMyChatbots] = useState(false);
  const [hasLoadedPublicChatbots, setHasLoadedPublicChatbots] = useState(false);

  const { isLogin } = useAuth();
  const router = useRouter();

  const loadChatbots = async () => {
    if (!isLogin || hasLoadedMyChatbots) return;
    
    try {
      setLoading(true);
      const data = await fetchChatbots();
      setChatbots(data);
      setHasLoadedMyChatbots(true);
    } catch (error) {
      toast.error("Lỗi khi tải chatbot");
    } finally {
      setLoading(false);
    }
  };

  const loadPublicChatbots = async () => {
    if (hasLoadedPublicChatbots) return;
    
    try {
      setPublicLoading(true);
      const data = await fetchPublicChatbots();
      setPublicChatbots(data);
      setHasLoadedPublicChatbots(true);
    } catch (error) {
      toast.error("Lỗi khi tải chatbot công khai");
    } finally {
      setPublicLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "my-chatbots" && isLogin) {
      loadChatbots();
    } else if (activeTab === "public-chatbots") {
      loadPublicChatbots();
    }
  }, [activeTab, isLogin]);

  // Load my chatbots by default when component mounts and user is logged in
  useEffect(() => {
    if (isLogin && activeTab === "my-chatbots") {
      loadChatbots();
    }
  }, [isLogin]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredChatbots =
    chatbots?.filter((bot) =>
      bot?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredPublicChatbots =
    publicChatbots?.filter((bot) =>
      bot?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateChatbot = () => {
    if (!isLogin) {
      toast.error("Vui lòng đăng nhập để tạo chatbot");
      return;
    }
    router.push("/assistants/editor");
  };

  const handleChatbotClick = (chatbot: Chatbot) => {
    router.push(`/rag-agent/${chatbot.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, botId: string) => {
    e.stopPropagation();
    setChatbotToDelete(botId);
  };

  const handleDeleteConfirm = async () => {
    if (!chatbotToDelete) return;
    try {
      await deleteChatbot(chatbotToDelete);
      toast.success("Xóa chatbot thành công");
      setChatbots(chatbots.filter((bot) => bot.id !== chatbotToDelete));
    } catch (error) {
      toast.error("Lỗi khi xóa chatbot");
    } finally {
      setChatbotToDelete(null);
    }
  };

  const renderSkeletonCards = () => {
    return Array(6)
      .fill(null)
      .map((_, index) => (
        <Card
          key={index}
          className="h-full transform hover:scale-105 transition-all duration-300 bg-card/50"
        >
          <div className="flex items-start gap-4 p-4">
            <div className="flex-shrink-0">
              <Skeleton className="size-8 md:size-10 rounded-full bg-muted/50" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-3 md:h-4 w-3/4 mb-2 bg-muted/50" />
              <Skeleton className="h-3 md:h-4 w-1/2 mb-4 bg-muted/50" />
              <div className="flex items-center gap-2 md:gap-4">
                <Skeleton className="h-6 md:h-8 w-20 md:w-24 bg-muted/50" />
                <Skeleton className="h-6 md:h-8 w-20 md:w-24 bg-muted/50" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-8 md:py-16 bg-card/50 rounded-xl shadow-sm border border-border/50">
        <div className="flex flex-col items-center justify-center">
          <Bot className="text-4xl md:text-6xl text-primary mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-card-foreground mb-2">
            Chưa có chatbot nào
          </h3>
        </div>
        <div className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto px-4">
          Tạo chatbot đầu tiên của bạn ngay bây giờ
        </div>
        <Button
          variant="outline"
          onClick={handleCreateChatbot}
          className="bg-primary text-primary-foreground border-none hover:bg-primary/90 flex justify-center w-4/5 md:w-2/3 mx-auto"
        >
          <Plus className="mr-2 size-4 md:size-5" />
          Tạo chatbot mới
        </Button>
      </div>
    );
  };

  const renderChatbotCard = (bot: Chatbot, isPublic: boolean = false) => (
    <Card
      className="hover:scale-101 transition-all duration-300 border-border/50 bg-card flex flex-col h-full"
      key={bot.id}
    >
      <CardHeader className="p-3 md:p-4">
        <CardTitle>
          <div className="text-base md:text-lg font-semibold flex items-center justify-between text-card-foreground">
            <span className="line-clamp-1">{bot.name}</span>
            <div className="flex items-center gap-1 md:gap-2">
              {!isPublic && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/20 border-none size-7 md:size-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/assistants/editor/${bot.id}`);
                  }}
                >
                  <Edit className="size-3.5 md:size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/20 border-none size-7 md:size-8"
                onClick={(e) => {
                  if (
                    window.confirm("Bạn có chắc chắn muốn xóa chatbot này?")
                  ) {
                    handleDeleteClick(e, bot.id);
                  }
                }}
              >
                <Trash className="size-3.5 md:size-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
        <CardDescription
          className={cn(
            bot.public ? "text-green-500" : "text-red-500",
            "text-xs md:text-sm font-semibold"
          )}
        >
          {bot.public ? "Công khai" : "Riêng tư"}
        </CardDescription>
        {bot.tools && bot.tools.length > 0 && (
          <CardDescription className="text-xs md:text-sm text-muted-foreground">
            Được tích hợp {bot.tools.length} tool calling.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0 flex-grow">
        <p className="line-clamp-3 text-xs md:text-sm text-muted-foreground">{bot.prompt}</p>
      </CardContent>
      <CardFooter className="p-3 md:p-4 pt-0 mt-auto">
        <Button
          variant="ghost"
          onClick={() => handleChatbotClick(bot)}
          className="w-full bg-foreground/20 text-foreground hover:bg-foreground/80 hover:text-background border-none text-xs md:text-sm h-8 md:h-9"
        >
          <MessageCircle className="mr-2 size-3.5 md:size-4" />
          Chat với chatbot
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="mx-auto w-full bg-background/50 px-4 md:px-6">
      {/* Back and Home Buttons */}
      <div className="mb-4 md:mb-8 flex items-center gap-2">
        <Button
          variant="link"
          onClick={() => router.back()}
          className="text-sm md:text-base text-muted-foreground hover:text-foreground p-0"
        >
          Quay lại
        </Button>
        <span className="text-muted-foreground">|</span>
        <Button
          variant="link"
          onClick={() => router.push("/")}
          className="text-sm md:text-base text-muted-foreground hover:text-foreground p-0 flex items-center gap-1"
        >
          <Home className="size-4 md:size-5" />
          Trang chủ
        </Button>
      </div>
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Input
          placeholder="Tìm kiếm chatbot..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-72 md:w-96 bg-card/50 border-border/50 text-sm md:text-base"
        />
        {isLogin && (
          <Button
            variant="outline"
            onClick={handleCreateChatbot}
            className="w-full sm:w-auto bg-foreground text-background border-none hover:bg-foreground/80 hover:text-background flex text-sm md:text-base"
            disabled={!isLogin}
          >
            <Plus className="mr-2 size-4 md:size-5" />
            Tạo mới
          </Button>
        )}
      </div>
      {/* Chatbot List */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="bg-background/80">
        <TabsList className="w-full bg-background/80 border-border/50">
          <TabsTrigger
            value="my-chatbots"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Chatbot của tôi
          </TabsTrigger>
          <TabsTrigger
            value="public-chatbots"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Chatbot công khai
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-chatbots" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              renderSkeletonCards()
            ) : filteredChatbots.length > 0 ? (
              filteredChatbots.map((bot) => renderChatbotCard(bot))
            ) : (
              <div className="col-span-full">{renderEmptyState()}</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="public-chatbots" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {publicLoading ? (
              renderSkeletonCards()
            ) : filteredPublicChatbots.length > 0 ? (
              filteredPublicChatbots.map((bot) => renderChatbotCard(bot, true))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-8 md:py-16 rounded-xl shadow-sm border border-border/50 bg-card/50">
                  <Globe className="text-4xl md:text-6xl text-primary mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-card-foreground mb-2">
                    Không có chatbot công khai
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto px-4">
                    Chưa có chatbot công khai nào được tạo
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default ChatbotListClient;
