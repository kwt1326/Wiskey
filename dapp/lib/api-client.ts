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
  BountyDetail,
} from './types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private walletAddress: string | null = null;

  // Define routes that require wallet authentication (matching backend)
  private readonly authenticatedRoutes = [
    'POST /bounties',
    'GET /bounties/mine/list',
    'GET /bounties/answered/list',
    'GET /user/me',
    'POST /answers',
    'GET /mypage/stats',
    'GET /mypage/activities',
    'POST /winners/select',
    'PATCH /winners',
  ];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setWalletAddress(address: string | null) {
    this.walletAddress = address ? address.toLowerCase() : null;
  }

  private requiresAuthentication(method: string, endpoint: string): boolean {
    const route = `${method} ${endpoint}`;
    return this.authenticatedRoutes.some((authRoute) => {
      // For PATCH /winners routes, we need to match the pattern since it includes dynamic IDs
      if (authRoute === 'PATCH /winners' && route.startsWith('PATCH /winners/')) {
        return true;
      }
      // Exact match for other routes
      return route === authRoute;
    });
  }

  private validateWalletAddress(method: string, endpoint: string): void {
    if (this.requiresAuthentication(method, endpoint) && !this.walletAddress) {
      throw new Error('Wallet address is required for this operation. Please connect your wallet first.');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const method = options.method || 'GET';
    
    // Validate wallet address before making the request
    this.validateWalletAddress(method, endpoint);
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, any> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add wallet address to headers if available
    if (this.walletAddress) {
      headers['x-wallet-address'] = this.walletAddress;
    }

    const config: RequestInit = {
      headers,
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

  async getBountyDetail(id: number): Promise<BountyDetail> {
    return this.request<BountyDetail>(`/bounties/${id}`);
  }

  async getMyBounties(): Promise<Bounty[]> {
    return this.request<Bounty[]>('/bounties/mine/list');
  }

  async getAnsweredBounties(): Promise<Bounty[]> {
    return this.request<Bounty[]>('/bounties/answered/list');
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

  async getUserProfile(): Promise<User> {
    return this.request<User>('/user/me');
  }

  // MyPage endpoints
  async getMyPageStats(): Promise<MyPageStats> {
    return this.request<MyPageStats>('/mypage/stats');
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/mypage/activities');
  }

  // Winner endpoints
  async selectWinner(data: SelectWinnerDto): Promise<BountyWinner> {
    return this.request<BountyWinner>('/winners/select', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
