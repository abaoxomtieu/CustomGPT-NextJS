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
          className="h-full transform hover:scale-105 transition-all duration-300 bg-background"
        >
          <div className="flex items-start gap-4 p-4">
            <div className="flex-shrink-0">
              <Skeleton className="size-10 rounded-full" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-16 bg-background rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <Bot className="text-6xl text-foreground mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Chưa có chatbot nào
          </h3>
        </div>
        <div className="text-gray-600 mb-6 max-w-md mx-auto">
          Tạo chatbot đầu tiên của bạn ngay bây giờ
        </div>
        <Button
          variant="outline"
          onClick={handleCreateChatbot}
          className="bg-foreground text-background border-none flex justify-center w-2/3 mx-auto"
        >
          <Plus />
          Tạo chatbot mới
        </Button>
      </div>
    );
  };

  const renderChatbotCard = (bot: Chatbot, isPublic: boolean = false) => (
    <Card
      className="bg-background hover:scale-105 transition-all duration-300"
      key={bot.id}
    >
      <CardHeader>
        <CardTitle>
          <div className="text-lg font-semibold flex items-center justify-between">
            {bot.name}
            <div className="flex items-center gap-2">
              <Button
                className="bg-ground text-foreground border-1 hover:bg-foreground/10"
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
          <CardDescription>
            Được tích hợp {bot.tools.length} tool calling.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="overflow-hidden">
        <p className="line-clamp-3">{bot.prompt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => handleChatbotClick(bot)}>
          <MessageCircle />
          Chat với chatbot
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="mx-auto w-full">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="link"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          Quay lại
        </Button>
      </div>
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Input
          placeholder="Tìm kiếm chatbot..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-96"
        />
        {isLogin && (
          <Button
            variant="outline"
            onClick={handleCreateChatbot}
            className="bg-foreground text-background border-none flex"
          >
            <Plus />
            Tạo mới
          </Button>
        )}
      </div>
      {/* Chatbot List */}
      <Tabs defaultValue="my-chatbots" className="bg-background">
        <TabsList>
          <TabsTrigger value="my-chatbots">Chatbot của tôi</TabsTrigger>
          <TabsTrigger value="public-chatbots">Chatbot công khai</TabsTrigger>
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
                <div className="text-center rounded-xl shadow-sm border border-gray-100">
                  <Globe className="text-6xl text-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Không có chatbot công khai
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
