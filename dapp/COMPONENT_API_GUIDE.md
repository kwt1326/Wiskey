# Component API Usage Guide

This guide shows you how to easily call APIs from any component in your dapp.

## 🚀 Quick Start

### 1. Import the hooks you need

```tsx
import { 
  useBounties,           // Get all bounties
  useCreateBounty,       // Create a new bounty
  useBountyById,         // Get specific bounty
  useMyBounties,         // Get user's bounties
  useCreateAnswer,       // Create an answer
  useAuth               // Authentication state
} from '@/hooks';

import { useApi } from '@/components/providers/ApiProvider';
```

### 2. Use them in your component

```tsx
function MyComponent() {
  // Fetch data
  const { data: bounties, isLoading, error } = useBounties();
  
  // Create data
  const createBounty = useCreateBounty();
  
  // Check auth
  const auth = useAuth();
  
  // Use preloaded data (no extra API calls)
  const { bounties: preloadedBounties } = useApi();
  
  return <div>Your component JSX</div>;
}
```

## 📋 Available Hooks

### Authentication
```tsx
const auth = useAuth();
// ✅ auth.isAuthenticated - boolean
// ✅ auth.userWallet - wallet address
// ✅ auth.userProfile - user profile data
// ✅ auth.isLoadingProfile - loading state
// ✅ auth.connectWallet(address) - connect function
```

### Bounties
```tsx
// Get all bounties
const { data, isLoading, error } = useBounties({
  sortBy: 'newest' | 'popular' | 'high-reward' | 'few-answers',
  status: 'open' | 'completed' | 'cancelled',
  limit: 10
});

// Get specific bounty
const { data: bounty } = useBountyById('bounty-id');

// Get user's bounties
const { data: myBounties } = useMyBounties(walletAddress);

// Search bounties
const { data: results } = useSearchBounties('search query');

// Create bounty
const createBounty = useCreateBounty();
await createBounty.mutateAsync({
  walletAddress: 'user-wallet',
  data: {
    title: 'My Problem',
    description: 'Help me solve this',
    reward: 1.0,
    tags: ['react', 'javascript']
  }
});
```

### Answers
```tsx
// Get answers for a bounty
const { data: answers } = useAnswersForBounty('bounty-id');

// Create answer
const createAnswer = useCreateAnswer();
await createAnswer.mutateAsync({
  walletAddress: 'user-wallet',
  data: {
    content: 'Here is my solution...',
    bountyId: 'bounty-id'
  }
});

// Vote on answers
const upvote = useUpvoteAnswer();
const downvote = useDownvoteAnswer();
```

## 🎯 Common Patterns

### Pattern 1: Simple Data Display
```tsx
function BountyList() {
  const { data: bounties = [], isLoading, error } = useBounties();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {bounties.map(bounty => (
        <div key={bounty.id}>{bounty.title}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Form Submission
```tsx
function CreateForm() {
  const auth = useAuth();
  const createBounty = useCreateBounty();
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.userWallet) return;

    try {
      await createBounty.mutateAsync({
        walletAddress: auth.userWallet,
        data: formData
      });
      // Success! Data will automatically refresh
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createBounty.isPending}>
        {createBounty.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Pattern 3: Authentication Guard
```tsx
function ProtectedComponent() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <div>Please connect your wallet</div>;
  }

  return <div>Protected content</div>;
}
```

### Pattern 4: Using Preloaded Data
```tsx
function Dashboard() {
  // These are preloaded - no extra API calls!
  const { bounties, myBounties, auth } = useApi();

  return (
    <div>
      <p>Total bounties: {bounties.data.length}</p>
      <p>My bounties: {myBounties.data.length}</p>
      <p>Wallet: {auth.userWallet}</p>
    </div>
  );
}
```

## 🔧 Advanced Usage

### Higher-Order Components

For components that need authentication:
```tsx
import { withAuth } from '@/components/hoc/withAuth';

const MyComponent = withAuth(({ auth }) => {
  // Component automatically gets auth prop
  // Shows connection screen if not authenticated
  return <div>Hello {auth.userWallet}</div>;
});
```

For components that need data loading states:
```tsx
import { withData } from '@/components/hoc/withData';

const MyComponent = withData(
  ({ data }) => <div>{data}</div>,
  (props) => useBounties() // data selector
);
```

### Using Templates

Use pre-built components:
```tsx
import { 
  BountyListComponent,
  BountyComponent, 
  MyBountiesComponent 
} from '@/components/templates';

function MyPage() {
  return (
    <div>
      <BountyListComponent 
        onBountyClick={(id) => router.push(`/bounty/${id}`)}
        onCreateClick={() => router.push('/create')}
      />
    </div>
  );
}
```

## 🎨 Loading & Error States

Every hook provides loading and error states:
```tsx
const { data, isLoading, error, refetch } = useBounties();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;

return <DataDisplay data={data} />;
```

## 🔄 Real-time Updates

Data automatically updates when:
- ✅ You create/update/delete items
- ✅ Other components modify the same data
- ✅ Background refetch happens
- ✅ You focus back to the tab

No manual refresh needed!

## 📱 Examples by Component Type

### Page Components
```tsx
// pages/bounties/page.tsx
import { BountyListComponent } from '@/components/templates';

export default function BountiesPage() {
  return <BountyListComponent />;
}
```

### Modal Components
```tsx
function CreateBountyModal({ isOpen, onClose }) {
  const createBounty = useCreateBounty();
  
  const handleSubmit = async (data) => {
    await createBounty.mutateAsync(data);
    onClose(); // Close modal on success
  };
  
  return (
    <Modal isOpen={isOpen}>
      <CreateBountyForm onSubmit={handleSubmit} />
    </Modal>
  );
}
```

### Widget Components
```tsx
function BountyStats() {
  const { data: bounties } = useBounties();
  const openBounties = bounties.filter(b => b.status === 'open');
  
  return (
    <div className="stats">
      <div>{openBounties.length} Open Bounties</div>
      <div>{bounties.length} Total Bounties</div>
    </div>
  );
}
```

## 🚨 Important Notes

1. **Always handle loading states** - Users should see feedback
2. **Handle errors gracefully** - Provide retry options
3. **Use TypeScript** - All APIs are fully typed
4. **Check authentication** - Guard protected actions
5. **Use the preloaded data** - Available via `useApi()` for common data

## 📝 Complete Example

```tsx
'use client';

import React, { useState } from 'react';
import { useBounties, useCreateAnswer, useAuth } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function BountyPage({ params }: { params: { id: string } }) {
  const auth = useAuth();
  const { data: bounties = [] } = useBounties();
  const createAnswer = useCreateAnswer();
  const [answerText, setAnswerText] = useState('');

  const bounty = bounties.find(b => b.id === params.id);

  const handleSubmitAnswer = async () => {
    if (!auth.userWallet || !answerText.trim()) return;

    try {
      await createAnswer.mutateAsync({
        walletAddress: auth.userWallet,
        data: {
          content: answerText,
          bountyId: params.id
        }
      });
      setAnswerText('');
    } catch (error) {
      alert('Failed to submit answer');
    }
  };

  if (!bounty) return <div>Bounty not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-4">{bounty.title}</h1>
          <p className="mb-4">{bounty.description}</p>
          <p className="text-lg font-semibold">Reward: {bounty.reward} ETH</p>
        </CardContent>
      </Card>

      {auth.isAuthenticated && bounty.status === 'open' && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Submit Answer</h2>
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Share your solution..."
              className="mb-4"
            />
            <Button 
              onClick={handleSubmitAnswer}
              disabled={createAnswer.isPending || !answerText.trim()}
            >
              {createAnswer.isPending ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

That's it! You can now easily call any API from any component. 🎉