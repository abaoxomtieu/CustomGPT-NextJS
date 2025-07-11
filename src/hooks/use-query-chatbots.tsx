"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChatbots, fetchPublicChatbots, fetchChatbotDetail } from "@/services/chatbotService";
import { QUERY_KEYS } from "./use-query-auth";

export function useChatbots() {
  return useQuery({
    queryKey: QUERY_KEYS.CHATBOTS.LIST,
    queryFn: fetchChatbots,
    staleTime: 1000 * 60 * 3, // 3 phút
    gcTime: 1000 * 60 * 10, // 10 phút
  });
}

export function usePublicChatbots() {
  return useQuery({
    queryKey: QUERY_KEYS.CHATBOTS.PUBLIC,
    queryFn: fetchPublicChatbots,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 15, // 15 phút
  });
}

export function useChatbotDetail(botId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.CHATBOTS.DETAIL(botId || ""),
    queryFn: () => fetchChatbotDetail(botId!),
    enabled: !!botId,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 10, // 10 phút
  });
}

export function useInvalidateChatbots() {
  const queryClient = useQueryClient();
  
  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CHATBOTS.LIST,
    });
  };

  const invalidatePublic = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CHATBOTS.PUBLIC,
    });
  };

  const invalidateDetail = (botId: string) => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CHATBOTS.DETAIL(botId),
    });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["chatbots"],
    });
  };

  return {
    invalidateList,
    invalidatePublic,
    invalidateDetail,
    invalidateAll,
  };
} 