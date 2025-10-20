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
  title: string;                  // 예: "test1"
  content: string;                // 예: "dsad"
  status: BountyStatus;
  remainingTime: string;          // 남은 시간 표시 텍스트, 예: "6일 남음"

  answerCount: number;            // 예: 0
  views: number;                  // 예: 0
  winnerCount: number;            // 예: 0

  rewardEth: string;              // 소수 정밀도 보존을 위해 string, 예: "0.00100000"
  totalRewardEth: string;         // 예: "0.00100000"
  vaultBountyId: string | null;
  expiresAt: string | null;
}

// Bounty detail
export interface BountyDetail {
  id: number;                                   // 예: 104
  createdAt: string;                            // ISO 문자열, 예: "2025-10-18T21:40:25.714Z"
  updatedAt: string;                            // ISO 문자열, 예: "2025-10-18T22:30:17.187Z"
  title: string;                                // 예: "test1"
  content: string;                              // 예: "dsad"
  rewardEth: string;                            // 정밀도 보존 위해 string, 예: "0.00100000"
  rewardTxHash: string;                         // 예: "0x377f...e4ec"
  vaultBountyId: string;                        // 예: "5cc5...20ec"
  views: number;                                // 예: 2
  expiresAt: string;                            // ISO 문자열, 예: "2025-10-26T06:40:25.705Z"
  status: BountyStatus;                 // 현재는 "open"만 확인됨
  creator: User;                       // 작성자 정보
  answers: Answer[];                      // 답변 목록 (현재는 빈 배열)
  remainingTime: string;                        // 예: "6일 남음"
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
  status: string;
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
  rewardEth: string;
}

export interface CreateAnswerDto {
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