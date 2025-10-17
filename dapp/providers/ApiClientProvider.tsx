'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { apiClient } from '@/lib/api-client';

interface ApiClientContextValue {
  apiClient: typeof apiClient;
  walletAddress: string | undefined;
  isConnected: boolean;
}

const ApiClientContext = createContext<ApiClientContextValue | null>(null);

interface ApiClientProviderProps {
  children: ReactNode;
}

export function ApiClientProvider({ children }: ApiClientProviderProps) {
  const { address, isConnected } = useAccount();

  // Automatically sync wallet address with API client
  useEffect(() => {
    apiClient.setWalletAddress(address || null);
  }, [address]);

  const value = {
    apiClient,
    walletAddress: address,
    isConnected,
  };

  return (
    <ApiClientContext.Provider value={value}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient() {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context.apiClient;
}

export function useWalletState() {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useWalletState must be used within an ApiClientProvider');
  }
  return {
    walletAddress: context.walletAddress,
    isConnected: context.isConnected,
  };
}