'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useUserProfile, useConnectWallet } from './api/users';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/lib/types/api';

/**
 * Unified authentication hook
 * Handles wallet connection and user profile management
 */
export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  const [user, setUser] = useState<User | undefined>(undefined);
  
  // Get user profile when wallet is connected
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useUserProfile();
  
  // Connect wallet mutation
  const connectWalletMutation = useConnectWallet();

  const connectWallet = useCallback(async (walletAddress: string) => {
    try {
      if (user) return;

      const connectedUser = await connectWalletMutation.mutateAsync({ walletAddress });
      setUser(connectedUser)
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWalletMutation]);

  const disconnectWallet = () => disconnect();

  // Auto-connect wallet when address is available
  useEffect(() => {
    if (!user && address && !userProfile && !isLoadingProfile && !profileError) {
      connectWallet(address);
    }
  }, [user, address, userProfile, isLoadingProfile, profileError, connectWallet]);

  return {
    // Wallet state
    userWallet: address || null,
    isConnected,
    isConnecting,
    
    // User state
    user: user || userProfile,
    userProfile,
    isLoadingProfile,
    isAuthenticated: isConnected && !!(user || userProfile),
    
    // Actions
    connectWallet,
    disconnectWallet,
    
    // Errors
    authError: profileError || connectWalletMutation.error,
  };
}
