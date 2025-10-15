// Simple API client for the backend
import {
  Bounty,
  Answer,
  User,
  BountyWinner,
  MyPageStats,
  RecentActivity,
  CreateBountyDto,
  CreateAnswerDto,
  CreateUserDto,
  SelectWinnerDto,
  BountyListQuery,
  WalletQuery,
} from './types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Bounty endpoints
  async createBounty(data: CreateBountyDto): Promise<Bounty> {
    return this.request<Bounty>('/bounties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listBounties(params?: BountyListQuery): Promise<Bounty[]> {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    
    const query = searchParams.toString();
    return this.request<Bounty[]>(`/bounties${query ? `?${query}` : ''}`);
  }

  async getBountyDetail(id: number): Promise<Bounty> {
    return this.request<Bounty>(`/bounties/${id}`);
  }

  async getMyBounties(wallet: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/bounties/mine/list?wallet=${wallet}`);
  }

  async getAnsweredBounties(wallet: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/bounties/answered/list?wallet=${wallet}`);
  }

  // Answer endpoints
  async createAnswer(data: CreateAnswerDto): Promise<Answer> {
    return this.request<Answer>('/answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User endpoints
  async connectWallet(data: CreateUserDto): Promise<User> {
    return this.request<User>('/user/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(wallet: string): Promise<User> {
    return this.request<User>(`/user/me?wallet=${wallet}`);
  }

  // MyPage endpoints
  async getMyPageStats(wallet: string): Promise<MyPageStats> {
    return this.request<MyPageStats>(`/mypage/stats?wallet=${wallet}`);
  }

  async getRecentActivities(wallet: string): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>(`/mypage/activities?wallet=${wallet}`);
  }

  // Winner endpoints
  async selectWinner(data: SelectWinnerDto): Promise<BountyWinner> {
    return this.request<BountyWinner>('/winners/select', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payReward(id: number): Promise<BountyWinner> {
    return this.request<BountyWinner>(`/winners/${id}/reward`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);