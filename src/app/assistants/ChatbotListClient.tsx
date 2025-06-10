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
import { Bot, Globe, MessageCircle, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackToTopButton from "@/components/back-to-top";
import { cn } from "@/lib/utils";

const ChatbotListClient: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [publicChatbots, setPublicChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publicLoading, setPublicLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbotToDelete, setChatbotToDelete] = useState<string | null>(null);

  const { isLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadPublicChatbots = async () => {
      try {
        setPublicLoading(true);
        const data = await fetchPublicChatbots();
        setPublicChatbots(data);
      } catch (error) {
        toast.error("Lỗi khi tải chatbot công khai");
      } finally {
        setPublicLoading(false);
      }
    };

    const loadChatbots = async () => {
      if (isLogin) {
        try {
          setLoading(true);
          const data = await fetchChatbots();
          setChatbots(data);
        } catch (error) {
          toast.error("Lỗi khi tải chatbot");
        } finally {
          setLoading(false);
        }
      }
    };

    loadPublicChatbots();
    loadChatbots();
  }, [isLogin]);

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
    router.push("/create-prompt");
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
              <Skeleton className="size-10 rounded-full bg-muted/50" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2 bg-muted/50" />
              <Skeleton className="h-4 w-1/2 mb-4 bg-muted/50" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-24 bg-muted/50" />
                <Skeleton className="h-8 w-24 bg-muted/50" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-16 bg-card/50 rounded-xl shadow-sm border border-border/50">
        <div className="flex flex-col items-center justify-center">
          <Bot className="text-6xl text-primary mb-4" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            Chưa có chatbot nào
          </h3>
        </div>
        <div className="text-muted-foreground mb-6 max-w-md mx-auto">
          Tạo chatbot đầu tiên của bạn ngay bây giờ
        </div>
        <Button
          variant="outline"
          onClick={handleCreateChatbot}
          className="bg-primary text-primary-foreground border-none hover:bg-primary/90 flex justify-center w-2/3 mx-auto"
        >
          <Plus className="mr-2" />
          Tạo chatbot mới
        </Button>
      </div>
    );
  };

  const renderChatbotCard = (bot: Chatbot, isPublic: boolean = false) => (
    <Card
      className="hover:scale-101 transition-all duration-300 border-border/50 bg-card"
      key={bot.id}
    >
      <CardHeader>
        <CardTitle>
          <div className="text-lg font-semibold flex items-center justify-between text-card-foreground">
            {bot.name}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hover:bg-destructive/20 border-none"
                onClick={(e) => {
                  if (
                    window.confirm("Bạn có chắc chắn muốn xóa chatbot này?")
                  ) {
                    handleDeleteClick(e, bot.id);
                  }
                }}
              >
                <Trash />
              </Button>
            </div>
          </div>
        </CardTitle>
        <CardDescription
          className={cn(
            bot.public ? "text-green-500" : "text-red-500",
            "text-sm font-semibold"
          )}
        >
          {bot.public ? "Công khai" : "Riêng tư"}
        </CardDescription>
        {bot.tools && bot.tools.length > 0 && (
          <CardDescription className="text-muted-foreground">
            Được tích hợp {bot.tools.length} tool calling.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="overflow-hidden">
        <p className="line-clamp-3 text-muted-foreground">{bot.prompt}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          onClick={() => handleChatbotClick(bot)}
          className="bg-foreground/20 text-foreground hover:bg-foreground/80 hover:text-background border-none"
        >
          <MessageCircle className="mr-2" />
          Chat với chatbot
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="mx-auto w-full bg-background/50">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="link"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          Quay lại
        </Button>
      </div>
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Input
          placeholder="Tìm kiếm chatbot..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-96 bg-card/50 border-border/50"
        />
        {isLogin && (
          <Button
            variant="outline"
            onClick={handleCreateChatbot}
            className="bg-background text-foreground border-none hover:bg-primary/90 flex"
            disabled={!isLogin}
          >
            <Plus className="mr-2" />
            Tạo mới
          </Button>
        )}
      </div>
      {/* Chatbot List */}
      <Tabs defaultValue="my-chatbots" className="bg-background/80">
        <TabsList className="bg-background/80 border-border/50">
          <TabsTrigger
            value="my-chatbots"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Chatbot của tôi
          </TabsTrigger>
          <TabsTrigger
            value="public-chatbots"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Chatbot công khai
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-chatbots">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              renderSkeletonCards()
            ) : filteredChatbots.length > 0 ? (
              filteredChatbots.map((bot) => renderChatbotCard(bot))
            ) : (
              <div className="col-span-full">{renderEmptyState()}</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="public-chatbots">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicLoading ? (
              renderSkeletonCards()
            ) : filteredPublicChatbots.length > 0 ? (
              filteredPublicChatbots.map((bot) => renderChatbotCard(bot, true))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-16 rounded-xl shadow-sm border border-border/50 bg-card/50">
                  <Globe className="text-6xl text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Không có chatbot công khai
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
