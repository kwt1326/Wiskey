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
  const { disconnect: disconnectWallet } = useDisconnect();
  
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useUserProfile();
  
  const connectWalletMutation = useConnectWallet();

  const connectWallet = useCallback(async (walletAddress: string) => {
    try {
      await connectWalletMutation.mutateAsync({ walletAddress });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWalletMutation]);

  // Auto-connect wallet when address is available
  useEffect(() => {
    if (address && isConnected) {
      connectWallet(address);
    }
  }, [address, isConnected]);

  return {
    // Wallet state
    userWallet: address || null,
    isConnected,
    isConnecting,
    
    // User state
    userProfile,
    isLoadingProfile,
    isAuthenticated: isConnected && !!userProfile,
    
    // Actions
    connectWallet,
    disconnectWallet,
    
    // Errors
    authError: profileError || connectWalletMutation.error,
  };
}
