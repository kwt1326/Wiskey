'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useUserProfile, useConnectWallet } from './api/users';
import { useEffect, useCallback } from 'react';

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
      const lowerAddress = walletAddress.toLowerCase();
      await connectWalletMutation.mutateAsync({ walletAddress: lowerAddress });
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
