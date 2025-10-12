import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BOUNTY_KEYS } from './bounties';

export const ANSWER_KEYS = {
  all: ['answers'] as const,
  lists: () => [...ANSWER_KEYS.all, 'list'] as const,
  list: () => [...ANSWER_KEYS.lists()] as const,
  byBounty: (bountyId: string) => [...ANSWER_KEYS.all, 'bounty', bountyId] as const,
  myAnswers: (walletAddress: string) => [...ANSWER_KEYS.all, 'my-answers', walletAddress] as const,
  detail: (id: string) => [...ANSWER_KEYS.all, 'detail', id] as const,
};

// Create answer
export function useCreateAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      walletAddress, 
      data 
    }: {
      walletAddress: string;
      data: {
        content: string;
        bountyId: string;
      };
    }) => apiClient.createAnswer(walletAddress, data),
    onSuccess: (data, { walletAddress, data: { bountyId } }) => {
      // Invalidate answers for this bounty
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.byBounty(bountyId) });
      // Invalidate user's answers
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.myAnswers(walletAddress) });
      // Invalidate bounty details to update answer count
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.detail(bountyId) });
      // Invalidate bounty lists to update answer counts
      queryClient.invalidateQueries({ queryKey: BOUNTY_KEYS.lists() });
    },
  });
}

// Get all answers
export function useAllAnswers() {
  return useQuery({
    queryKey: ANSWER_KEYS.list(),
    queryFn: () => apiClient.getAllAnswers(),
  });
}

// Get answers for a specific bounty
export function useAnswersForBounty(bountyId: string | null) {
  return useQuery({
    queryKey: ANSWER_KEYS.byBounty(bountyId || ''),
    queryFn: () => apiClient.getAnswersForBounty(bountyId!),
    enabled: !!bountyId,
  });
}

// Get user's answers
export function useUserAnswers(walletAddress: string | null) {
  return useQuery({
    queryKey: ANSWER_KEYS.myAnswers(walletAddress || ''),
    queryFn: () => apiClient.getUserAnswers(walletAddress!),
    enabled: !!walletAddress,
  });
}

// Get answer by ID
export function useAnswerById(id: string | null) {
  return useQuery({
    queryKey: ANSWER_KEYS.detail(id || ''),
    queryFn: () => apiClient.getAnswerById(id!),
    enabled: !!id,
  });
}

// Update answer
export function useUpdateAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress, 
      content 
    }: {
      id: string;
      walletAddress: string;
      content: string;
    }) => apiClient.updateAnswer(id, walletAddress, content),
    onSuccess: (data, { id, walletAddress }) => {
      // Update the specific answer in cache
      queryClient.setQueryData(ANSWER_KEYS.detail(id), data);
      // Invalidate user's answers
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.myAnswers(walletAddress) });
      // Invalidate all answers lists
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.lists() });
      
      // If we have the bounty ID from the updated answer, invalidate its answers
      if (data && 'bountyId' in data) {
        queryClient.invalidateQueries({ 
          queryKey: ANSWER_KEYS.byBounty(data.bountyId as string) 
        });
      }
    },
  });
}

// Delete answer
export function useDeleteAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress 
    }: {
      id: string;
      walletAddress: string;
    }) => apiClient.deleteAnswer(id, walletAddress),
    onSuccess: (data, { id, walletAddress }) => {
      // Remove the answer from cache
      queryClient.removeQueries({ queryKey: ANSWER_KEYS.detail(id) });
      // Invalidate user's answers
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.myAnswers(walletAddress) });
      // Invalidate all answers lists
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.lists() });
    },
  });
}

// Upvote answer
export function useUpvoteAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress 
    }: {
      id: string;
      walletAddress: string;
    }) => apiClient.upvoteAnswer(id, walletAddress),
    onSuccess: (data, { id }) => {
      // Update the specific answer in cache
      queryClient.setQueryData(ANSWER_KEYS.detail(id), data);
      // Invalidate answers lists to refetch updated vote counts
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.lists() });
      
      // If we have the bounty ID from the updated answer, invalidate its answers
      if (data && 'bountyId' in data) {
        queryClient.invalidateQueries({ 
          queryKey: ANSWER_KEYS.byBounty(data.bountyId as string) 
        });
      }
    },
  });
}

// Downvote answer
export function useDownvoteAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      walletAddress 
    }: {
      id: string;
      walletAddress: string;
    }) => apiClient.downvoteAnswer(id, walletAddress),
    onSuccess: (data, { id }) => {
      // Update the specific answer in cache
      queryClient.setQueryData(ANSWER_KEYS.detail(id), data);
      // Invalidate answers lists to refetch updated vote counts
      queryClient.invalidateQueries({ queryKey: ANSWER_KEYS.lists() });
      
      // If we have the bounty ID from the updated answer, invalidate its answers
      if (data && 'bountyId' in data) {
        queryClient.invalidateQueries({ 
          queryKey: ANSWER_KEYS.byBounty(data.bountyId as string) 
        });
      }
    },
  });
}