// Re-export API types for component use
export type { 
  Bounty, 
  Answer, 
  User, 
  BountyWinner,
  MyPageStats,
  RecentActivity,
  CreateBountyDto,
  CreateAnswerDto,
  SelectWinnerDto 
} from '@/lib/types/api';

// Additional component-specific types
export interface AppState {
  isWalletConnected: boolean;
  userWallet: string | null;
  bounties: Bounty[];
  showConnectModal: boolean;
}
