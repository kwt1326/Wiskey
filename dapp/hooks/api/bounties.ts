import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient, useWalletState } from '@/providers/ApiClientProvider';
import { CreateBountyDto, BountyListQuery } from '@/lib/types/api';

export const BOUNTY_KEYS = {
  all: ['bounties'] as const,
  lists: () => [...BOUNTY_KEYS.all, 'list'] as const,
  list: (params?: BountyListQuery) => [...BOUNTY_KEYS.lists(), params] as const,
  detail: (id: number) => [...BOUNTY_KEYS.all, 'detail', id] as const,
  myBounties: (wallet: string) => [...BOUNTY_KEYS.all, 'my-bounties', wallet] as const,
  answeredBounties: (wallet: string) => [...BOUNTY_KEYS.all, 'answered-bounties', wallet] as const,
};

// Create bounty
export function useCreateBounty() {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();
  const { walletAddress } = useWalletState();
  
  return useMutation({
    mutationFn: (data: CreateBountyDto) => apiClient.createBounty(data),
    onSuccess: () => {
      // Invalidate bounty lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(walletAddress) });
      }
    },
  });
}

// Get all bounties
export function useBounties(params?: BountyListQuery) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: BOUNTY_KEYS.list(params),
    queryFn: () => apiClient.listBounties(params),
  });
}

// Get bounty by ID
export function useBountyById(id: number | null) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: BOUNTY_KEYS.detail(id || 0),
    queryFn: () => apiClient.getBountyDetail(id!),
    enabled: !!id,
  });
}

// Get user's bounties
export function useMyBounties() {
  const apiClient = useApiClient();
  const { isConnected, walletAddress } = useWalletState();
  
  return useQuery({
    queryKey: BOUNTY_KEYS.myBounties(walletAddress || ''),
    queryFn: () => apiClient.getMyBounties(),
    enabled: isConnected && !!walletAddress,
  });
}

// Get bounties user has answered
export function useAnsweredBounties() {
  const apiClient = useApiClient();
  const { isConnected, walletAddress } = useWalletState();
  
  return useQuery({
    queryKey: BOUNTY_KEYS.answeredBounties(walletAddress || ''),
    queryFn: () => apiClient.getAnsweredBounties(),
    enabled: isConnected && !!walletAddress,
  });
}