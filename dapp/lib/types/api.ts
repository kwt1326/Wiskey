// API response types based on the backend models

export interface User {
  id: string;
  walletAddress: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  totalRewardsEarned: number;
  totalBountiesPosted: number;
  totalAnswersGiven: number;
  totalWinningAnswers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  content: string;
  isWinner: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  responder: User;
  bounty: Bounty;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'completed' | 'cancelled';
  expiresAt?: string;
  viewCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  poster: User;
  answers: Answer[];
  winningAnswer?: Answer;
}

export interface Bounties {
  bounties: Bounty[];
  total: number;
}

export interface CreateBountyRequest {
  title: string;
  description: string;
  reward: number;
  expiresAt?: string;
  tags?: string[];
}

export interface UpdateBountyRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'completed' | 'cancelled';
  tags?: string[];
}

export interface CreateAnswerRequest {
  content: string;
  bountyId: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
}

export interface BountyQueryParams {
  sortBy?: 'newest' | 'popular' | 'high-reward' | 'few-answers';
  status?: 'open' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}