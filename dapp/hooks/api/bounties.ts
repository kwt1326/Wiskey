import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  
  return useMutation({
    mutationFn: (data: CreateBountyDto) => apiClient.createBounty(data),
    onSuccess: (data, variables) => {
      // Invalidate bounty lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(variables.walletAddress) });
    },
  });
}

// Get all bounties
export function useBounties(params?: BountyListQuery) {
  return useQuery({
    queryKey: BOUNTY_KEYS.list(params),
    queryFn: () => apiClient.listBounties(params),
  });
}

// Get bounty by ID
export function useBountyById(id: number | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.detail(id || 0),
    queryFn: () => apiClient.getBountyDetail(id!),
    enabled: !!id,
  });
}

// Get user's bounties
export function useMyBounties(wallet: string | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.myBounties(wallet || ''),
    queryFn: () => apiClient.getMyBounties(wallet!),
    enabled: !!wallet,
  });
}

// Get bounties user has answered
export function useAnsweredBounties(wallet: string | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.answeredBounties(wallet || ''),
    queryFn: () => apiClient.getAnsweredBounties(wallet!),
    enabled: !!wallet,
  });
}