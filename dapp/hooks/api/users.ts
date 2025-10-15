import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  
  return useMutation({
    mutationFn: (data: CreateUserDto) => apiClient.connectWallet(data),
    onSuccess: (data, variables) => {
      // Update the cache with the user data
      queryClient.setQueryData(USER_KEYS.profile(variables.walletAddress), data);
    },
  });
}

// Get user profile
export function useUserProfile(wallet: string | null) {
  return useQuery({
    queryKey: USER_KEYS.profile(wallet || ''),
    queryFn: () => apiClient.getUserProfile(wallet!),
    enabled: !!wallet,
  });
}

// Get user stats
export function useMyPageStats(wallet: string | null) {
  return useQuery({
    queryKey: MYPAGE_KEYS.stats(wallet || ''),
    queryFn: () => apiClient.getMyPageStats(wallet!),
    enabled: !!wallet,
  });
}

// Get recent activities
export function useRecentActivities(wallet: string | null) {
  return useQuery({
    queryKey: MYPAGE_KEYS.activities(wallet || ''),
    queryFn: () => apiClient.getRecentActivities(wallet!),
    enabled: !!wallet,
  });
}