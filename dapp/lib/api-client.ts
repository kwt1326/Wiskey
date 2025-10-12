// API client configuration for the backend
import { 
  User, 
  Bounty, 
  Answer, 
  CreateBountyRequest, 
  UpdateBountyRequest, 
  CreateAnswerRequest, 
  UpdateUserRequest,
  BountyQueryParams, 
  Bounties
} from './types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    walletAddress?: string
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (walletAddress) {
      headers['x-wallet-address'] = walletAddress;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // User endpoints
  async connectWallet(walletAddress: string): Promise<User> {
    return this.makeRequest<User>('/users/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getUserProfile(walletAddress: string): Promise<User> {
    return this.makeRequest<User>('/users/profile', {
      method: 'GET',
    }, walletAddress);
  }

  async updateUserProfile(walletAddress: string, data: UpdateUserRequest): Promise<User> {
    return this.makeRequest<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, walletAddress);
  }

  async getUserByWallet(walletAddress: string): Promise<User> {
    return this.makeRequest<User>(`/users/wallet/${walletAddress}`, {
      method: 'GET',
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.makeRequest<User[]>('/users', {
      method: 'GET',
    });
  }

  // Bounty endpoints
  async createBounty(walletAddress: string, data: CreateBountyRequest): Promise<Bounty> {
    return this.makeRequest<Bounty>('/bounties', {
      method: 'POST',
      body: JSON.stringify(data),
    }, walletAddress);
  }

  async getAllBounties(params?: BountyQueryParams): Promise<Bounties> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/bounties?${queryString}` : '/bounties';
    
    return this.makeRequest<Bounties>(endpoint, {
      method: 'GET',
    });
  }

  async searchBounties(query: string, page?: number, limit?: number): Promise<Bounty[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    
    return this.makeRequest<Bounty[]>(`/bounties/search?${searchParams.toString()}`, {
      method: 'GET',
    });
  }

  async getMyBounties(walletAddress: string): Promise<Bounty[]> {
    return this.makeRequest<Bounty[]>('/bounties/my-bounties', {
      method: 'GET',
    }, walletAddress);
  }

  async getMyAnswers(walletAddress: string): Promise<Bounty[]> {
    return this.makeRequest<Bounty[]>('/bounties/my-answers', {
      method: 'GET',
    }, walletAddress);
  }

  async getBountyById(id: string): Promise<Bounty> {
    return this.makeRequest<Bounty>(`/bounties/${id}`, {
      method: 'GET',
    });
  }

  async updateBounty(id: string, walletAddress: string, data: UpdateBountyRequest): Promise<Bounty> {
    return this.makeRequest<Bounty>(`/bounties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, walletAddress);
  }

  async deleteBounty(id: string, walletAddress: string): Promise<void> {
    return this.makeRequest<void>(`/bounties/${id}`, {
      method: 'DELETE',
    }, walletAddress);
  }

  async selectWinner(bountyId: string, walletAddress: string, answerId: string): Promise<Bounty> {
    return this.makeRequest<Bounty>(`/bounties/${bountyId}/select-winner`, {
      method: 'POST',
      body: JSON.stringify({ answerId }),
    }, walletAddress);
  }

  // Answer endpoints
  async createAnswer(walletAddress: string, data: CreateAnswerRequest): Promise<Answer> {
    return this.makeRequest<Answer>('/answers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, walletAddress);
  }

  async getAllAnswers(): Promise<Answer[]> {
    return this.makeRequest<Answer[]>('/answers', {
      method: 'GET',
    });
  }

  async getAnswersForBounty(bountyId: string): Promise<Answer[]> {
    return this.makeRequest<Answer[]>(`/answers/bounty/${bountyId}`, {
      method: 'GET',
    });
  }

  async getUserAnswers(walletAddress: string): Promise<Answer[]> {
    return this.makeRequest<Answer[]>('/answers/my-answers', {
      method: 'GET',
    }, walletAddress);
  }

  async getAnswerById(id: string): Promise<Answer> {
    return this.makeRequest<Answer>(`/answers/${id}`, {
      method: 'GET',
    });
  }

  async updateAnswer(id: string, walletAddress: string, content: string): Promise<Answer> {
    return this.makeRequest<Answer>(`/answers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }, walletAddress);
  }

  async deleteAnswer(id: string, walletAddress: string): Promise<void> {
    return this.makeRequest<void>(`/answers/${id}`, {
      method: 'DELETE',
    }, walletAddress);
  }

  async upvoteAnswer(id: string, walletAddress: string): Promise<Answer> {
    return this.makeRequest<Answer>(`/answers/${id}/upvote`, {
      method: 'POST',
    }, walletAddress);
  }

  async downvoteAnswer(id: string, walletAddress: string): Promise<Answer> {
    return this.makeRequest<Answer>(`/answers/${id}/downvote`, {
      method: 'POST',
    }, walletAddress);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);