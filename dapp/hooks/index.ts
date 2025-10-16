// 🚀 Clean hooks for the Solve3 dapp
// Simple, readable API integration

// 🎯 Main hooks (use these for most cases)
export { useAuth } from './useAuth';
export { useAppData } from './useAppData';
export { useSimpleData } from './useSimpleData';

// 🔧 Specific API hooks (for targeted usage)
export * from './api/users';
export * from './api/bounties';
export * from './api/answers';
export * from './api/winners';

// ⚡ React Query utilities
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';