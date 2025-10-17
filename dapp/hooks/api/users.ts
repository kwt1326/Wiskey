import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient, useWalletState } from '@/providers/ApiClientProvider';
import { CreateUserDto } from '@/lib/types/api';

export const USER_KEYS = {
  all: ['users'] as const,
  profile: (wallet: string) => [...USER_KEYS.all, 'profile', wallet] as const,
};

export const MYPAGE_KEYS = {
  all: ['mypage'] as const,
  stats: (wallet: string) => [...MYPAGE_KEYS.all, 'stats', wallet] as const,
  activities: (wallet: string) => [...MYPAGE_KEYS.all, 'activities', wallet] as const,
};

// Connect wallet (creates user if doesn't exist)
export function useConnectWallet() {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDto) => apiClient.connectWallet(data),
    onSuccess: (data, variables) => {
      // Update the cache with the user data
      queryClient.setQueryData(USER_KEYS.profile(variables.walletAddress), data);
    },
  });
}

// Get user profile
export function useUserProfile() {
  const apiClient = useApiClient();
  const { isConnected, walletAddress } = useWalletState();
  
  return useQuery({
    queryKey: USER_KEYS.profile(walletAddress || ''),
    queryFn: () => apiClient.getUserProfile(),
    enabled: isConnected && !!walletAddress,
  });
}

// Get user stats
export function useMyPageStats() {
  const apiClient = useApiClient();
  const { isConnected, walletAddress } = useWalletState();
  
  return useQuery({
    queryKey: MYPAGE_KEYS.stats(walletAddress || ''),
    queryFn: () => apiClient.getMyPageStats(),
    enabled: isConnected && !!walletAddress,
  });
}

// Get recent activities
export function useRecentActivities() {
  const apiClient = useApiClient();
  const { isConnected, walletAddress } = useWalletState();
  
  return useQuery({
    queryKey: MYPAGE_KEYS.activities(walletAddress || ''),
    queryFn: () => apiClient.getRecentActivities(),
    enabled: isConnected && !!walletAddress,
  });
}