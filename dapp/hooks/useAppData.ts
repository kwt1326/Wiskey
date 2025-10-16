'use client';

import { useAuth } from './useAuth';
import { useBounties, useMyBounties, useAnsweredBounties } from './api/bounties';
import { transformBountyForComponent } from '@/lib/utils/data-transforms';

/**
 * Centralized app data hook
 * Provides all commonly needed data in one place
 */
export function useAppData() {
  const auth = useAuth();
  
  // Main bounties list - simple fetch all bounties
  const bounties = useBounties();
  
  // User-specific data (only when authenticated)
  const myBounties = useMyBounties(auth.userWallet);
  const myAnswers = useAnsweredBounties(auth.userWallet);

  // Transform API data for component use
  const transformedBounties = bounties.data?.map(transformBountyForComponent) || [];
  const transformedMyBounties = myBounties.data?.map(transformBountyForComponent) || [];
  const transformedMyAnswers = myAnswers.data?.map(transformBountyForComponent) || [];

  return {
    // Authentication
    auth,
    
    // Main data
    bounties: {
      data: transformedBounties,
      isLoading: bounties.isLoading,
      error: bounties.error,
      refetch: bounties.refetch
    },
    
    // User data
    myBounties: {
      data: transformedMyBounties,
      isLoading: myBounties.isLoading,
      error: myBounties.error,
      refetch: myBounties.refetch
    },
    
    myAnswers: {
      data: transformedMyAnswers,
      isLoading: myAnswers.isLoading,
      error: myAnswers.error,
      refetch: myAnswers.refetch
    },
    
    // Convenience flags
    isLoading: bounties.isLoading || myBounties.isLoading || myAnswers.isLoading,
    hasError: !!(bounties.error || myBounties.error || myAnswers.error),
  };
}