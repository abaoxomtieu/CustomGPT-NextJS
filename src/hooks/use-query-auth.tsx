"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserInfo } from "@/services/account";
import { getCookie } from "@/helpers/Cookies";

export const QUERY_KEYS = {
  AUTH: {
    USER_INFO: ["auth", "userInfo"] as const,
  },
  CHATBOTS: {
    LIST: ["chatbots", "list"] as const,
    PUBLIC: ["chatbots", "public"] as const,
    DETAIL: (id: string) => ["chatbots", "detail", id] as const,
  },
  DOCUMENTS: {
    BY_BOT: (botId: string) => ["documents", "bot", botId] as const,
  },
} as const;

export function useUserInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.USER_INFO,
    queryFn: async () => {
      const token = getCookie("token");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await getUserInfo();
      return response.data;
    },
    enabled: !!getCookie("token"), // Chỉ chạy khi có token
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 10, // 10 phút
    retry: (failureCount, error: any) => {
      // Không retry nếu lỗi 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  
  const invalidateUserInfo = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.AUTH.USER_INFO,
    });
  };

  const removeUserInfo = () => {
    queryClient.removeQueries({
      queryKey: QUERY_KEYS.AUTH.USER_INFO,
    });
  };

  return {
    invalidateUserInfo,
    removeUserInfo,
  };
} 