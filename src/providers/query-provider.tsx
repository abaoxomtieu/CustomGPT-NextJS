"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian cache data (5 phút)
            staleTime: 1000 * 60 * 5,
            // Thời gian giữ cache khi không có observer (10 phút)
            gcTime: 1000 * 60 * 10,
            // Retry 1 lần khi failed
            retry: 1,
            // Không refetch khi window focus
            refetchOnWindowFocus: false,
            // Không refetch khi reconnect
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
} 