import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const USER_KEYS = {
  all: ['users'] as const,
  profile: (walletAddress: string) => [...USER_KEYS.all, 'profile', walletAddress] as const,
  byWallet: (walletAddress: string) => [...USER_KEYS.all, 'wallet', walletAddress] as const,
  list: () => [...USER_KEYS.all, 'list'] as const,
};

// Connect wallet (creates user if doesn't exist)
export function useConnectWallet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (walletAddress: string) => apiClient.connectWallet(walletAddress),
    onSuccess: (data, walletAddress) => {
      // Update the cache with the user data
      queryClient.setQueryData(USER_KEYS.profile(walletAddress), data);
      queryClient.setQueryData(USER_KEYS.byWallet(walletAddress), data);
    },
  });
}

// Get user profile
export function useUserProfile(walletAddress: string | null) {
  return useQuery({
    queryKey: USER_KEYS.profile(walletAddress || ''),
    queryFn: () => apiClient.getUserProfile(walletAddress!),
    enabled: !!walletAddress,
  });
}

// Update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      walletAddress, 
      data 
    }: {
      walletAddress: string;
      data: {
        displayName?: string;
        bio?: string;
        avatar?: string;
      };
    }) => apiClient.updateUserProfile(walletAddress, data),
    onSuccess: (data, { walletAddress }) => {
      // Update the cached user data
      queryClient.setQueryData(USER_KEYS.profile(walletAddress), data);
      queryClient.setQueryData(USER_KEYS.byWallet(walletAddress), data);
    },
  });
}

// Get user by wallet address
export function useUserByWallet(walletAddress: string | null) {
  return useQuery({
    queryKey: USER_KEYS.byWallet(walletAddress || ''),
    queryFn: () => apiClient.getUserByWallet(walletAddress!),
    enabled: !!walletAddress,
  });
}

// Get all users
export function useAllUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: () => apiClient.getAllUsers(),
  });
}