'use client';

import { useAuth } from './useAuth';
import { useBounties, useMyBounties, useAnsweredBounties } from './api/bounties';

/**
 * Simple data hook - provides clean API data without complex transformations
 * Use this for straightforward API consumption
 */
export function useSimpleData() {
  const auth = useAuth();
  
  // Simple API calls
  const allBounties = useBounties();
  const myBounties = useMyBounties(auth.userWallet);
  const myAnswers = useAnsweredBounties(auth.userWallet);

  return {
    // Auth
    auth,
    
    // Raw API data - use these directly in components
    bounties: allBounties,
    myBounties,
    myAnswers,
    
    // Helper flags
    isLoading: allBounties.isLoading || myBounties.isLoading || myAnswers.isLoading,
    hasError: !!(allBounties.error || myBounties.error || myAnswers.error),
  };
}