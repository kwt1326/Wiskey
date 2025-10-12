# Solve Backend API

A NestJS-based backend API for the Solve decentralized bounty platform. This API manages users (identified by wallet addresses), bounties, and answers with full CRUD operations.

## Features

- 🎯 **Bounty Management**: Create, read, update, delete bounties
- 💬 **Answer System**: Submit and manage answers to bounties
- 👤 **User Profiles**: Wallet-based user identification and profiles
- 🏆 **Winner Selection**: Bounty creators can select winning answers
- 📊 **Statistics Tracking**: User stats and leaderboards
- 🔍 **Search & Filtering**: Advanced bounty search and sorting
- 🗳️ **Voting System**: Upvote/downvote answers
- 📱 **CORS Enabled**: Ready for frontend integration

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator, class-transformer
- **Authentication**: Wallet address-based (DeFi integration ready)

## Project Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database configuration
```

### Database Setup

```bash
# Make sure PostgreSQL is running and create the database
createdb solve

# The application will automatically create tables on startup (development mode)
```

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=solve

# Application Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

```bash
# Development mode (with watch)
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at `http://localhost:3001/api`

## API Documentation

See [API.md](./API.md) for detailed API documentation including:
- All available endpoints
- Request/response examples
- Data models
- Authentication requirements
- Business rules

## Quick API Overview

### Core Endpoints

```bash
# Connect wallet (creates user if doesn't exist)
POST /api/users/connect

# Create bounty
POST /api/bounties

# Get bounties with filtering
GET /api/bounties?sortBy=newest&status=open

# Submit answer
POST /api/answers

# Select winner
POST /api/bounties/{id}/select-winner
```

### Authentication

All endpoints use wallet address authentication via the `x-wallet-address` header:

```http
x-wallet-address: 0x1234567890abcdef...
```

## Database Schema

### Entities
- **User**: Wallet-based user profiles with stats
- **Bounty**: Problem posts with rewards
- **Answer**: Solutions submitted by users

### Key Relationships
- User → Bounties (one-to-many)
- User → Answers (one-to-many)  
- Bounty → Answers (one-to-many)
- Bounty → WinningAnswer (one-to-one)

## Business Logic

### Bounty Lifecycle
1. **Create**: User posts bounty with ETH reward
2. **Answer**: Other users submit solutions
3. **Select Winner**: Bounty creator chooses best answer
4. **Complete**: Reward is distributed to winner

### User Statistics
- Total rewards earned
- Bounties posted count
- Answers given count
- Winning answers count

## Development

```bash
# Linting
pnpm run lint

# Testing
pnpm run test
pnpm run test:e2e
pnpm run test:cov

# Database migrations (if needed)
pnpm run migration:generate
pnpm run migration:run
```

## Deployment

The API is configured for easy deployment with:
- Environment-based configuration
- Production-ready database settings
- CORS configuration
- Health check endpoints

## Integration with Frontend

This API is designed to work with the Solve dApp frontend:
- Wallet address authentication matches DeFi wallet connections
- CORS enabled for local development
- RESTful endpoints for easy integration
- Comprehensive error handling

## License

This project is licensed under the MIT License.