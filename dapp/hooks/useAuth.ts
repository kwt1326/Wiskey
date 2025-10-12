'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useUserProfile, useConnectWallet } from './api/users';
import { useEffect } from 'react';

/**
 * Unified authentication hook
 * Handles wallet connection and user profile management
 */
export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Get user profile when wallet is connected
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useUserProfile(address);
  
  // Connect wallet mutation
  const connectWalletMutation = useConnectWallet();

  const connectWallet = async (walletAddress: string) => {
    try {
      await connectWalletMutation.mutateAsync({ walletAddress });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  // Auto-connect wallet when address is available
  useEffect(() => {
    if (address && !userProfile && !isLoadingProfile) {
      connectWallet(address);
    }
  }, [address, userProfile, isLoadingProfile]);

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