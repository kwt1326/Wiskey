# React Query Integration Guide

This document explains how the backend API has been integrated with the dapp using React Query.

## Overview

The integration includes:
- 📡 **API Client**: Type-safe HTTP client for backend communication
- 🔄 **React Query Hooks**: Custom hooks for data fetching and mutations
- 📝 **TypeScript Types**: Strongly typed API responses
- 🎯 **Smart Caching**: Automatic cache invalidation and updates
- ⚡ **Optimistic Updates**: Instant UI feedback with server sync

## File Structure

```
dapp/
├── lib/
│   ├── api-client.ts          # HTTP client with all API endpoints
│   ├── react-query.tsx        # React Query provider setup
│   └── types/
│       └── api.ts             # TypeScript interfaces for API responses
├── hooks/
│   └── api/
│       ├── users.ts           # User-related React Query hooks
│       ├── bounties.ts        # Bounty-related React Query hooks
│       └── answers.ts         # Answer-related React Query hooks
├── components/
│   ├── appStateWithAPI.tsx    # Updated app state using React Query
│   └── examples/
│       └── BountyListWithAPI.tsx  # Example component using the API
└── .env.local.example         # Environment variables template
```

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# OnchainKit API Key (from Coinbase Developer Platform)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# Project name (optional)
NEXT_PUBLIC_PROJECT_NAME=Solve
```

### 2. Provider Setup

The React Query provider is already integrated in `app/rootProvider.tsx`:

```tsx
import { ReactQueryProvider } from "@/lib/react-query";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <OnchainKitProvider>
        {children}
      </OnchainKitProvider>
    </ReactQueryProvider>
  );
}
```

## Usage Examples

### Fetching Data

```tsx
import { useBounties } from '@/hooks/api/bounties';

function BountyList() {
  const { data: bounties, isLoading, error } = useBounties({
    sortBy: 'newest',
    status: 'open',
    limit: 10
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {bounties?.map(bounty => (
        <div key={bounty.id}>{bounty.title}</div>
      ))}
    </div>
  );
}
```

### Creating Data

```tsx
import { useCreateBounty } from '@/hooks/api/bounties';
import { useAccount } from 'wagmi';

function CreateBountyForm() {
  const { address } = useAccount();
  const createBounty = useCreateBounty();

  const handleSubmit = async (data) => {
    if (!address) return;
    
    try {
      await createBounty.mutateAsync({
        walletAddress: address,
        data: {
          title: data.title,
          description: data.description,
          reward: data.reward,
          tags: data.tags
        }
      });
      // Success! The bounty list will automatically update
    } catch (error) {
      console.error('Failed to create bounty:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createBounty.isPending}
      >
        {createBounty.isPending ? 'Creating...' : 'Create Bounty'}
      </button>
    </form>
  );
}
```

### Using the Updated App State

Replace the old `AppStateProvider` with the new API-integrated version:

```tsx
// Old way (using mock data)
import { AppStateProvider } from '@/components/appState';

// New way (using real API)
import { AppStateProvider } from '@/components/appStateWithAPI';

function Layout({ children }) {
  return (
    <AppStateProvider>
      {children}
    </AppStateProvider>
  );
}
```

## Available Hooks

### User Hooks

```tsx
import { 
  useConnectWallet,
  useUserProfile,
  useUpdateUserProfile,
  useUserByWallet,
  useAllUsers 
} from '@/hooks/api/users';
```

### Bounty Hooks

```tsx
import { 
  useCreateBounty,
  useBounties,
  useSearchBounties,
  useMyBounties,
  useMyAnswers,
  useBountyById,
  useUpdateBounty,
  useDeleteBounty,
  useSelectWinner 
} from '@/hooks/api/bounties';
```

### Answer Hooks

```tsx
import { 
  useCreateAnswer,
  useAllAnswers,
  useAnswersForBounty,
  useUserAnswers,
  useAnswerById,
  useUpdateAnswer,
  useDeleteAnswer,
  useUpvoteAnswer,
  useDownvoteAnswer 
} from '@/hooks/api/answers';
```

## Key Features

### Automatic Cache Management

React Query automatically handles:
- **Smart Caching**: Data is cached and reused across components
- **Background Updates**: Stale data is refetched in the background
- **Cache Invalidation**: Related data is updated when mutations occur

### Error Handling

```tsx
const { data, isLoading, error, refetch } = useBounties();

if (error) {
  return (
    <div>
      Error: {error.message}
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Loading States

```tsx
const createBounty = useCreateBounty();

return (
  <button disabled={createBounty.isPending}>
    {createBounty.isPending ? 'Creating...' : 'Create Bounty'}
  </button>
);
```

### Optimistic Updates

When you create a bounty, the UI updates immediately while the request is being processed in the background. If the request fails, the UI automatically reverts.

## Migration from Mock Data

To migrate existing components:

1. **Replace mock data imports** with React Query hooks
2. **Update state management** to use server state
3. **Add loading and error states** for better UX
4. **Remove local state** that's now managed by the server

### Before (Mock Data)

```tsx
import { useAppState } from '@/components/appState';

function Component() {
  const { bounties, addBounty } = useAppState();
  
  return (
    <div>
      {bounties.map(bounty => <div key={bounty.id}>{bounty.title}</div>)}
    </div>
  );
}
```

### After (API Integration)

```tsx
import { useBounties, useCreateBounty } from '@/hooks/api/bounties';

function Component() {
  const { data: bounties = [], isLoading } = useBounties();
  const createBounty = useCreateBounty();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {bounties.map(bounty => <div key={bounty.id}>{bounty.title}</div>)}
    </div>
  );
}
```

## Development Tools

React Query DevTools are included in development mode for debugging queries and cache state.

## Next Steps

1. **Update existing components** to use the new API hooks
2. **Test the integration** with the backend server running
3. **Add error boundaries** for better error handling
4. **Implement offline support** if needed
5. **Add loading skeletons** for better UX

For more information, see the [React Query documentation](https://tanstack.com/query/latest).