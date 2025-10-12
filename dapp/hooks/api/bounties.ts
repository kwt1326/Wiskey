import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const BOUNTY_KEYS = {
  all: ['bounties'] as const,
  lists: () => [...BOUNTY_KEYS.all, 'list'] as const,
  list: (filters?: {
    sortBy?: 'newest' | 'popular' | 'high-reward' | 'few-answers';
    status?: 'open' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
  }) => [...BOUNTY_KEYS.lists(), filters] as const,
  search: (query: string, page?: number, limit?: number) => 
    [...BOUNTY_KEYS.all, 'search', query, page, limit] as const,
  detail: (id: string) => [...BOUNTY_KEYS.all, 'detail', id] as const,
  myBounties: (walletAddress: string) => [...BOUNTY_KEYS.all, 'my-bounties', walletAddress] as const,
  myAnswers: (walletAddress: string) => [...BOUNTY_KEYS.all, 'my-answers', walletAddress] as const,
};

// Create bounty
export function useCreateBounty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      walletAddress, 
      data 
    }: {
      walletAddress: string;
      data: {
        title: string;
        description: string;
        reward: number;
        expiresAt?: string;
        tags?: string[];
      };
    }) => apiClient.createBounty(walletAddress, data),
    onSuccess: (data, { walletAddress }) => {
      // Invalidate bounty lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(walletAddress) });
    },
  });
}

// Get all bounties
export function useBounties(params?: {
  sortBy?: 'newest' | 'popular' | 'high-reward' | 'few-answers';
  status?: 'open' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: BOUNTY_KEYS.list(params),
    queryFn: () => apiClient.getAllBounties(params),
  });
}

// Search bounties
export function useSearchBounties(query: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: BOUNTY_KEYS.search(query, page, limit),
    queryFn: () => apiClient.searchBounties(query, page, limit),
    enabled: !!query.trim(),
  });
}

// Get user's bounties
export function useMyBounties(walletAddress: string | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.myBounties(walletAddress || ''),
    queryFn: () => apiClient.getMyBounties(walletAddress!),
    enabled: !!walletAddress,
  });
}

// Get bounties user has answered
export function useMyAnswers(walletAddress: string | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.myAnswers(walletAddress || ''),
    queryFn: () => apiClient.getMyAnswers(walletAddress!),
    enabled: !!walletAddress,
  });
}

// Get bounty by ID
export function useBountyById(id: string | null) {
  return useQuery({
    queryKey: BOUNTY_KEYS.detail(id || ''),
    queryFn: () => apiClient.getBountyById(id!),
    enabled: !!id,
  });
}

// Update bounty
export function useUpdateBounty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress, 
      data 
    }: {
      id: string;
      walletAddress: string;
      data: {
        title?: string;
        description?: string;
        status?: 'open' | 'completed' | 'cancelled';
        tags?: string[];
      };
    }) => apiClient.updateBounty(id, walletAddress, data),
    onSuccess: (data, { id, walletAddress }) => {
      // Update the specific bounty in cache
      queryClient.setQueryData(BOUNTY_KEYS.detail(id), data);
      // Invalidate lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(walletAddress) });
    },
  });
}

// Delete bounty
export function useDeleteBounty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress 
    }: {
      id: string;
      walletAddress: string;
    }) => apiClient.deleteBounty(id, walletAddress),
    onSuccess: (data, { id, walletAddress }) => {
      // Remove the bounty from cache
      queryClient.removeQueries({ queryKey: BOUNTY_KEYS.detail(id) });
      // Invalidate lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(walletAddress) });
    },
  });
}

// Select winner
export function useSelectWinner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bountyId, 
      walletAddress, 
      answerId 
    }: {
      bountyId: string;
      walletAddress: string;
      answerId: string;
    }) => apiClient.selectWinner(bountyId, walletAddress, answerId),
    onSuccess: (data, { bountyId, walletAddress }) => {
      // Update the specific bounty in cache
      queryClient.setQueryData(BOUNTY_KEYS.detail(bountyId), data);
      // Invalidate lists to refetch updated data
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.myBounties(walletAddress) });
    },
  });
}