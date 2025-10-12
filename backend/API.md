# Solve API Documentation

## Overview
This is the backend API for Solve, a decentralized bounty platform where users can post problems and receive answers in exchange for ETH rewards. Users are identified by their wallet addresses (DeFi wallet connection).

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require the wallet address to be passed in the `x-wallet-address` header for user identification.

## API Endpoints

### Users

#### Connect Wallet / Get or Create User
```http
POST /users/connect
Content-Type: application/json

{
  "walletAddress": "0x1234567890abcdef..."
}
```

#### Get User Profile
```http
GET /users/profile
x-wallet-address: 0x1234567890abcdef...
```

#### Update User Profile
```http
PATCH /users/profile
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "displayName": "John Doe",
  "bio": "Blockchain developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Get User by Wallet Address
```http
GET /users/wallet/{walletAddress}
```

#### Get All Users
```http
GET /users
```

### Bounties

#### Create Bounty
```http
POST /bounties
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "title": "How to implement NFT staking?",
  "description": "Looking for detailed guide on NFT staking mechanisms...",
  "reward": 0.05,
  "expiresAt": "2024-02-01T00:00:00Z",
  "tags": ["nft", "staking", "solidity"]
}
```

#### Get All Bounties
```http
GET /bounties?sortBy=newest&status=open&page=1&limit=20
```

Query parameters:
- `sortBy`: `newest` | `popular` | `high-reward` | `few-answers`
- `status`: `open` | `completed` | `cancelled`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Search Bounties
```http
GET /bounties/search?q=NFT&page=1&limit=20
```

#### Get User's Posted Bounties
```http
GET /bounties/my-bounties
x-wallet-address: 0x1234567890abcdef...
```

#### Get Bounties User Has Answered
```http
GET /bounties/my-answers
x-wallet-address: 0x1234567890abcdef...
```

#### Get Bounty by ID
```http
GET /bounties/{id}
```

#### Update Bounty
```http
PATCH /bounties/{id}
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "open",
  "tags": ["updated", "tags"]
}
```

#### Delete Bounty
```http
DELETE /bounties/{id}
x-wallet-address: 0x1234567890abcdef...
```

#### Select Winner
```http
POST /bounties/{id}/select-winner
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "answerId": "answer-uuid"
}
```

### Answers

#### Create Answer
```http
POST /answers
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "content": "Here's how to implement NFT staking...",
  "bountyId": "bounty-uuid"
}
```

#### Get All Answers
```http
GET /answers
```

#### Get Answers for Bounty
```http
GET /answers/bounty/{bountyId}
```

#### Get User's Answers
```http
GET /answers/my-answers
x-wallet-address: 0x1234567890abcdef...
```

#### Get Answer by ID
```http
GET /answers/{id}
```

#### Update Answer
```http
PATCH /answers/{id}
x-wallet-address: 0x1234567890abcdef...
Content-Type: application/json

{
  "content": "Updated answer content..."
}
```

#### Delete Answer
```http
DELETE /answers/{id}
x-wallet-address: 0x1234567890abcdef...
```

#### Upvote Answer
```http
POST /answers/{id}/upvote
x-wallet-address: 0x1234567890abcdef...
```

#### Downvote Answer
```http
POST /answers/{id}/downvote
x-wallet-address: 0x1234567890abcdef...
```

## Data Models

### User
```typescript
{
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
  createdAt: Date;
  updatedAt: Date;
}
```

### Bounty
```typescript
{
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'completed' | 'cancelled';
  expiresAt?: Date;
  viewCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  poster: User;
  answers: Answer[];
  winningAnswer?: Answer;
}
```

### Answer
```typescript
{
  id: string;
  content: string;
  isWinner: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  responder: User;
  bounty: Bounty;
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Wallet address required",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only update your own bounties",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Bounty not found",
  "error": "Not Found"
}
```

## Business Rules

1. **User Creation**: Users are automatically created when connecting a wallet for the first time
2. **Bounty Ownership**: Only bounty creators can update/delete their bounties
3. **Answer Restrictions**: 
   - Users cannot answer their own bounties
   - Users can only submit one answer per bounty
   - Answers cannot be submitted to closed bounties
4. **Winner Selection**: Only bounty creators can select winners
5. **Voting**: Users cannot vote on their own answers
6. **Statistics**: User stats are automatically updated when actions are performed