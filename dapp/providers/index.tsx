"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApiClientProvider } from './ApiClientProvider';
import { OnchainKitProviderWrapper } from "./OnchainKitProvider";

// Create optimized Query Client
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProviderWrapper>
        <ApiClientProvider>
          {children}
        </ApiClientProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </OnchainKitProviderWrapper>
    </QueryClientProvider>
  );
}