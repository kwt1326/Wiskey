import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient, useWalletState } from '@/providers/ApiClientProvider';
import { CreateAnswerDto } from '@/lib/types/api';
import { BOUNTY_KEYS } from './bounties';

export const ANSWER_KEYS = {
  all: ['answers'] as const,
};

// Create answer
export function useCreateAnswer() {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();
  const { walletAddress } = useWalletState();
  
  return useMutation({
    mutationFn: (data: CreateAnswerDto) => apiClient.createAnswer(data),
    onSuccess: (_, variables) => {
      // Invalidate bounty detail to update answer list
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.detail(variables.bountyId) });
      // Invalidate bounty lists to update answer counts
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
      // Invalidate user's answered bounties
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.answeredBounties(walletAddress) });
      }
    },
  });
}