// 🚀 Ergonomic hooks for the Solve3 dapp
// Everything you need to build amazing bounty experiences

// 🎯 High-level hooks (use these for most cases)
export { useAuth } from './useAuth';
export { useAppData } from './useAppData';

// 🔧 Specific API hooks (for advanced usage)
export * from './api/users';
export * from './api/bounties';
export * from './api/answers';

// ⚡ React Query utilities
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';