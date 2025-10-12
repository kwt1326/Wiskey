'use client';

import { useAuth } from './useAuth';
import { useBounties, useMyBounties, useMyAnswers } from './api/bounties';

/**
 * Centralized app data hook
 * Provides all commonly needed data in one place
 */
export function useAppData() {
  const auth = useAuth();
  
  // Main bounties list
  const bounties = useBounties({
    sortBy: 'newest',
    status: 'open',
    limit: 20
  });
  
  // User-specific data (only when authenticated)
  const myBounties = useMyBounties(auth.userWallet);
  const myAnswers = useMyAnswers(auth.userWallet);

  return {
    // Authentication
    auth,
    
    // Main data
    bounties: {
      data: bounties.data || [],
      isLoading: bounties.isLoading,
      error: bounties.error,
      refetch: bounties.refetch
    },
    
    // User data
    myBounties: {
      data: myBounties.data || [],
      isLoading: myBounties.isLoading,
      error: myBounties.error,
      refetch: myBounties.refetch
    },
    
    myAnswers: {
      data: myAnswers.data || [],
      isLoading: myAnswers.isLoading,
      error: myAnswers.error,
      refetch: myAnswers.refetch
    },
    
    // Convenience flags
    isLoading: bounties.isLoading || myBounties.isLoading || myAnswers.isLoading,
    hasError: !!(bounties.error || myBounties.error || myAnswers.error),
  };
}