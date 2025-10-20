import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/providers/ApiClientProvider';
import { SelectWinnerDto } from '@/lib/types/api';
import { BOUNTY_KEYS } from './bounties';

export const WINNER_KEYS = {
  all: ['winners'] as const,
};

// Select winner
export function useSelectWinner() {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();
  
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
