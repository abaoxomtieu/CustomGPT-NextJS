"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDocuments } from "@/services/documentService";
import { QUERY_KEYS } from "./use-query-auth";

export function useDocuments(botId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS.BY_BOT(botId || ""),
    queryFn: () => fetchDocuments(botId!),
    enabled: !!botId,
    staleTime: 1000 * 60 * 3, // 3 phút
    gcTime: 1000 * 60 * 10, // 10 phút
  });
}

export function useInvalidateDocuments() {
  const queryClient = useQueryClient();
  
  const invalidateByBot = (botId: string) => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.DOCUMENTS.BY_BOT(botId),
    });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["documents"],
    });
  };

  return {
    invalidateByBot,
    invalidateAll,
  };
} 