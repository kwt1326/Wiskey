# Wiskey - Decentralized Bounty Platform

Wiskey is a comprehensive decentralized bounty platform that enables users to post problems, offer cryptocurrency rewards, and receive solutions from the community. The platform combines blockchain technology with a modern web interface to create a trustless system for incentivizing problem-solving.

## 🏗️ Architecture Overview

The Wiskey platform consists of three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│    Backend      │◄──►│  Smart Contract │
│   (Next.js)     │    │   (NestJS)      │    │   (Solidity)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                        │                        │
       │                        │                        │
   User Interface          API & Database         Blockchain Layer
```

---

## 📱 Frontend (dapp/)

**Technology Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OnchainKit

### Core Features
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Wallet Integration**: Seamless Web3 wallet connection using OnchainKit and Wagmi
- **Bounty Management**: Create, browse, and manage cryptocurrency-backed bounties
- **Real-time Updates**: Dynamic content updates using React Query
- **Theme Support**: Light/dark mode with Next.js themes

### Key Components
- **Home Page**: Browse active bounties with filtering and curation options
- **Post Problem**: Create new bounties with ETH/ERC20 token rewards
- **Problem Detail**: View bounty details, submit answers, and track progress
- **My Bounties**: Manage personal bounties and track earnings
- **Profile**: User dashboard with activity statistics

### Technical Highlights
- Built with React 19 functional components and hooks
- Comprehensive UI component library using Radix UI primitives
- Blockchain interaction through ethers.js and Wagmi
- Type-safe API communication with custom hooks
- Mobile-optimized navigation and responsive design

### Development Commands
```bash
cd dapp/
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run TypeScript and code linting
```

---

## 🔧 Backend (backend/)

**Technology Stack:** NestJS, TypeScript, PostgreSQL, TypeORM, Ethers.js

### Core Features
- **RESTful API**: Comprehensive API for bounty and user management
- **Blockchain Integration**: Monitor and verify on-chain transactions
- **Database Management**: PostgreSQL with TypeORM for data persistence
- **Wallet Authentication**: Middleware for wallet-based user authentication
- **Background Processing**: Queue-based transaction monitoring

### API Modules
- **Users**: Wallet-based user registration and profile management
- **Bounties**: CRUD operations for bounty lifecycle management
- **Answers**: Solution submission and management system
- **Winners**: Bounty completion and reward distribution tracking

### Database Schema
```
Users ──┐
        ├── Bounties ──┐
        │              ├── Answers
        │              └── BountyWinners
        └── Answers
```

### Key Services
- **Vault Service**: Interface with smart contract for deposits and distributions
- **Nonce Manager**: Handle blockchain transaction ordering
- **Vault Logger**: Monitor and log blockchain events

### Development Commands
```bash
cd backend/
pnpm install
pnpm run start:dev   # Start development server with hot reload
pnpm run build       # Build for production
pnpm run test        # Run unit tests
pnpm run test:e2e    # Run end-to-end tests
```

---

## ⛓️ Smart Contract (contract/)

**Technology Stack:** Solidity ^0.8.24, Hardhat, Foundry, OpenZeppelin

### Core Features
- **Multi-Token Support**: Handle both ETH and ERC20 tokens (USDC, BNB, etc.)
- **Secure Vault System**: ReentrancyGuard and access control mechanisms
- **Dynamic Distribution**: Configurable reward splits between solvers and operators
- **String-Based Bounty IDs**: External string IDs mapped to internal bytes32 hashes

### Smart Contract Architecture
```solidity
contract MultiTokenBountyVault is ReentrancyGuard, Ownable {
    enum TokenType { ETH, ERC20 }
    
    struct Bounty {
        TokenType tokenType;
        address tokenAddress;
        uint256 totalAmount;
        address depositor;
        address solver;
        uint8 solverShare;
        uint8 operatorShare;
        bool distributed;
    }
}
```

### Key Functions
- **depositETH**: Deposit ETH rewards for bounties
- **depositERC20**: Deposit ERC20 token rewards
- **distributeBounty**: Distribute rewards between solver and operator
- **withdrawUnclaimed**: Recover unclaimed bounty funds

### Security Features
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Access Control**: Owner-based permissions for critical operations
- **Input Validation**: Comprehensive parameter validation
- **Event Logging**: Detailed event emission for transparency

### Development Commands
```bash
cd contract/
npm install
npm run build                           # Compile contracts
npm test                               # Run Foundry tests
npm run deploy:hh:local                # Deploy to local network
npm run deploy:hh:baseSepolia          # Deploy to Base Sepolia testnet
```

### Supported Networks
- **Local Development**: Hardhat local network
- **Base Sepolia**: Testnet deployment for testing
- **Base Mainnet**: Production deployment (configurable)

---

## 🚀 Deployment

### Production Deployment (Render.com)
The platform is configured for deployment on Render.com with the following services:

**Frontend Service:**
- Static site deployment from `dapp/` directory
- Build command: `pnpm install --no-frozen-lockfile && pnpm run build`
- Serves the Next.js application as static files

**Backend Service:**
- Node.js runtime deployment from `backend/` directory
- Build command: `pnpm install --no-frozen-lockfile && pnpm run build`
- Start command: `pnpm run start:prod`
- Health check endpoint: `/api/health`

### Environment Configuration
Each component requires specific environment variables:

**Backend (.env):**
```
DATABASE_URL=postgresql://...
BLOCKCHAIN_RPC_URL=https://...
CONTRACT_ADDRESS=0x...
OPERATOR_PRIVATE_KEY=0x...
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.wiskey.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453
```

---

## 🔄 Development Workflow

### 1. Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd wiskey

# Start all services
cd backend && pnpm install && pnpm run start:dev &
cd ../dapp && npm install && npm run dev &
cd ../contract && npm install && npx hardhat node
```

### 2. Smart Contract Development
```bash
cd contract/
# Compile contracts
npm run build

# Run tests
forge test

# Deploy to local network
npm run deploy:hh:local
```

### 3. Integration Testing
```bash
# Test complete flow
cd contract/
npm run test:flow
```

### 4. Code Quality
```bash
# Backend linting
cd backend && pnpm run lint

# Frontend linting
cd dapp && npm run lint

# Contract testing
cd contract && forge test
```

---

## 🔒 Security Considerations

### Smart Contract Security
- **Audited Dependencies**: Uses OpenZeppelin battle-tested contracts
- **Reentrancy Protection**: ReentrancyGuard on all external calls
- **Access Control**: Ownable pattern for administrative functions
- **Input Validation**: Comprehensive parameter checking

### Backend Security
- **Wallet Authentication**: Cryptographic signature verification
- **Database Security**: Parameterized queries via TypeORM
- **Rate Limiting**: Built-in NestJS throttling mechanisms
- **Environment Isolation**: Secure environment variable management

### Frontend Security
- **CSP Headers**: Content Security Policy implementation
- **Wallet Integration**: Secure Web3 provider connections
- **Type Safety**: Full TypeScript coverage for runtime safety

---

## 📊 Platform Flow

### 1. Bounty Creation
1. User connects wallet through frontend
2. User creates bounty with title, description, and reward amount
3. Frontend initiates smart contract deposit transaction
4. Backend stores bounty metadata in database
5. Transaction hash links on-chain and off-chain data

### 2. Solution Submission
1. Solvers browse available bounties
2. Submit answers through the platform
3. Bounty creator reviews submissions
4. Creator selects winning solution

### 3. Reward Distribution
1. Creator initiates distribution through frontend
2. Smart contract validates bounty state
3. Rewards distributed according to configured split
4. Platform operator receives commission
5. Transaction events update database

---

## 🛠️ Technology Stack Summary

| Component | Primary Technologies | Purpose |
|-----------|---------------------|---------|
| **Frontend** | Next.js, React, TypeScript, OnchainKit | User interface and Web3 integration |
| **Backend** | NestJS, PostgreSQL, TypeORM, Ethers.js | API services and blockchain monitoring |
| **Contract** | Solidity, Hardhat, Foundry, OpenZeppelin | Decentralized reward escrow system |

---

## 📚 Additional Resources

- **Frontend Guidelines**: See `dapp/AGENTS.md` for detailed development practices
- **Backend API**: Swagger documentation available at `/api/docs` when running
- **Smart Contract**: Detailed documentation in `contract/README.md`
- **Deployment**: Configuration in `render.yaml` for production deployment

## 🤝 Contributing

1. Follow the coding standards outlined in each component's documentation
2. Ensure all tests pass before submitting PRs
3. Include proper TypeScript types for all new code
4. Update documentation for significant changes
5. Test smart contract changes thoroughly on testnet before mainnet deployment

---

*Built with ❤️ for the decentralized future*