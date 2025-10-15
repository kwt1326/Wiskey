import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SelectWinnerDto } from '@/lib/types/api';
import { BOUNTY_KEYS } from './bounties';

export const WINNER_KEYS = {
  all: ['winners'] as const,
};

// Select winner
export function useSelectWinner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SelectWinnerDto) => apiClient.selectWinner(data),
    onSuccess: (data, variables) => {
      // Invalidate bounty detail to update winner status
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.detail(variables.bountyId) });
      // Invalidate bounty lists to update status
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
    },
  });
}

// Pay reward
export function usePayReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.payReward(id),
    onSuccess: (data) => {
      // Invalidate bounty detail to update payment status
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.detail(data.bounty.id) });
      // Invalidate bounty lists to update status
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
    },
  });
}