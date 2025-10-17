// 🚀 Clean hooks for the Solve3 dapp
// Simple, readable API integration

// 🎯 Main auth hook
export { useAuth } from './useAuth';

// 🔧 Specific API hooks (use these for targeted data fetching)
export * from './api/users';
export * from './api/bounties';
export * from './api/answers';
export * from './api/winners';

// ⚡ React Query utilities
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';