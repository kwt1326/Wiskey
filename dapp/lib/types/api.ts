// API types based on the actual backend models

// Status enums
export enum BountyStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

export enum AnswerStatus {
  PENDING = 'pending',
  WINNER = 'winner',
}

// Base entity interface
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// User entity
export interface User extends BaseEntity {
  walletAddress: string;
}

// Bounty entity
export interface Bounty extends BaseEntity {
  title: string;
  content: string;
  rewardEth: string;
  rewardTxHash?: string;
  vaultBountyId?: string;
  views: number;
  expiresAt: string | null;
  status: BountyStatus;
  creator: User;
  answers: Answer[];
}

// Answer entity
export interface Answer extends BaseEntity {
  content: string;
  status: AnswerStatus;
  author: User;
  bounty: Bounty;
}

// BountyWinner entity
export interface BountyWinner extends BaseEntity {
  bounty: Bounty;
  answer: Answer;
  rewardPaid: boolean;
  txHash?: string;
}

// Activity types
export enum ActivityType {
  BOUNTY = 'BOUNTY',
  ANSWER = 'ANSWER',
  WIN = 'WIN',
}

export interface RecentActivity {
  type: ActivityType;
  title?: string;
  content?: string;
  rewardEth?: string;
  createdAt: string;
}

export interface MyPageStats {
  bountyCount: number;
  answerCount: number;
  totalRewardEth: string;
  winCount: number;
}

// Request DTOs
export interface CreateBountyDto {
  title: string;
  content: string;
  rewardTxHash: string;
  vaultBountyId: string;
  rewardEth: number;
  walletAddress: string;
}

export interface CreateAnswerDto {
  walletAddress: string;
  content: string;
  bountyId: number;
}

export interface CreateUserDto {
  walletAddress: string;
}

export interface SelectWinnerDto {
  bountyId: number;
  answerId: number;
}

// Query parameters
export interface BountyListQuery {
  sort?: 'latest' | 'views' | 'reward' | 'answers';
}

export interface WalletQuery {
  wallet: string;
}