# MultiTokenBountyVault Smart Contract

A secure, multi-token bounty management system built on Ethereum that supports both ETH and ERC20 tokens with customizable reward distribution ratios.

## Overview

The `MultiTokenBountyVault` is a smart contract that enables:
- **Multi-token support**: Accepts both ETH and ERC20 tokens (USDC, BNB, etc.)
- **Flexible reward distribution**: Customizable percentage splits between solvers and operators
- **Secure fund management**: Built with OpenZeppelin v5 security patterns
- **Owner-controlled distribution**: Only contract owner can trigger reward distribution

## Features

- 🔒 **Security**: Built with OpenZeppelin's ReentrancyGuard and Ownable patterns
- 💰 **Multi-token**: Supports ETH and any ERC20 token
- 📊 **Dynamic ratios**: Configurable solver/operator reward percentages
- 🎯 **Bounty management**: Each bounty has a unique ID and tracking
- ⚡ **Gas optimized**: Efficient storage and execution patterns

## Architecture

### Core Components

1. **MultiTokenBountyVault.sol**: Main contract handling deposits and distributions
2. **ERC20Mock.sol**: Mock ERC20 token for testing purposes
3. **Test suite**: Comprehensive Foundry tests for all functionality
4. **Deployment scripts**: Hardhat Ignition modules for automated deployment

### Contract Structure

```solidity
struct Bounty {
    TokenType tokenType;      // ETH or ERC20
    address tokenAddress;     // Token contract address (0x0 for ETH)
    uint256 totalAmount;      // Total deposited amount
    address depositor;        // Who deposited the bounty
    address solver;           // Who solved the bounty (set on distribution)
    uint8 solverShare;        // Solver's percentage (0-100)
    uint8 operatorShare;      // Operator's percentage (0-100)
    bool distributed;         // Whether bounty has been distributed
}
```

## Installation

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd contract

# Install dependencies
pnpm install

# Compile contracts
forge build
# or
npx hardhat build
```

## Usage

### Deploying the Contract

#### Using Hardhat (Recommended)

1. Set up environment variables:
```bash
# Set your private key
npx hardhat keystore set SEPOLIA_PRIVATE_KEY

# Set RPC URL (optional, uses default if not set)
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
```

2. Deploy to Sepolia:
```bash
npx hardhat ignition deploy --network sepolia ignition/modules/MultiTokenBountyVault.ts --parameters '{"operatorAddress": "0xYourOperatorAddress", "ownerAddress": "0xYourOwnerAddress"}'
```

3. Deploy locally:
```bash
npx hardhat ignition deploy ignition/modules/MultiTokenBountyVault.ts --parameters '{"operatorAddress": "0xYourOperatorAddress", "ownerAddress": "0xYourOwnerAddress"}'
```

#### Using Foundry

```bash
# Deploy to local network
forge create src/MultiTokenBountyVault.sol:MultiTokenBountyVault \
  --constructor-args "0xOperatorAddress" "0xOwnerAddress"

# Deploy to Sepolia
forge create src/MultiTokenBountyVault.sol:MultiTokenBountyVault \
  --constructor-args "0xOperatorAddress" "0xOwnerAddress" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Interacting with the Contract

#### Depositing ETH Bounty

```solidity
// Deposit 1 ETH with 90% to solver, 10% to operator
vault.depositETH{value: 1 ether}(
    bountyId,    // Unique bounty identifier
    90,          // Solver share percentage
    10           // Operator share percentage
);
```

#### Depositing ERC20 Bounty

```solidity
// First approve the vault to spend your tokens
IERC20(tokenAddress).approve(vaultAddress, amount);

// Then deposit
vault.depositToken(
    bountyId,        // Unique bounty identifier
    tokenAddress,    // ERC20 token contract address
    amount,          // Amount to deposit
    95,              // Solver share percentage
    5                // Operator share percentage
);
```

#### Distributing Rewards (Owner Only)

```solidity
// Distribute bounty to solver
vault.distribute(bountyId, solverAddress);
```

## Testing

### Run All Tests

```bash
# Using Foundry (recommended)
forge test

# Using Hardhat
npx hardhat test

# Run specific test types
npx hardhat test solidity  # Foundry tests
npx hardhat test mocha     # TypeScript tests
```

### Test Coverage

```bash
# Generate coverage report
forge coverage

# Detailed coverage with LCOV
forge coverage --report lcov
```

### Gas Optimization

```bash
# Generate gas snapshots
forge snapshot

# Compare gas usage
forge snapshot --diff
```

## Development Tools

### Supported Networks

- **Local**: Hardhat Network, Anvil
- **Testnets**: Sepolia
- **Mainnets**: Ethereum, Optimism (configurable)

### Available Scripts

```bash
# Build contracts
npm run build

# Deploy to Sepolia
npm run deploy-sepolia

# Format code
forge fmt

# Lint Solidity
forge check

# Run local node
anvil
```

## Security Considerations

### Implemented Protections

- **Reentrancy Guard**: Prevents reentrancy attacks on deposits and distributions
- **Access Control**: Only owner can distribute rewards
- **Input Validation**: Comprehensive parameter validation
- **Safe Transfers**: Uses OpenZeppelin's safe transfer patterns

### Audit Checklist

- ✅ Reentrancy protection
- ✅ Integer overflow protection (Solidity 0.8+)
- ✅ Access control implementation
- ✅ Event emission for transparency
- ✅ Proper error handling
- ✅ Gas optimization

## Smart Contract Details

### Constructor Parameters

```solidity
constructor(address _operator, address _initialOwner)
```

- `_operator`: Address that receives operator share of bounties
- `_initialOwner`: Address that owns the contract and can distribute bounties

### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `depositETH()` | Public | Deposit ETH bounty with custom ratios |
| `depositToken()` | Public | Deposit ERC20 token bounty |
| `distribute()` | Owner Only | Distribute bounty to solver |
| `setOperator()` | Owner Only | Update operator address |

### Events

```solidity
event Deposited(uint256 indexed bountyId, TokenType tokenType, address tokenAddress, address indexed depositor, uint256 amount, uint8 solverShare, uint8 operatorShare);

event Distributed(uint256 indexed bountyId, address indexed solver, uint256 solverAmount, uint256 operatorAmount);
```

## Configuration

### Foundry Configuration (`foundry.toml`)

```toml
[profile.default]
src = "src"
out = "out" 
libs = ["node_modules", "lib"]
test = "test"
solc_version = "0.8.24"
```

### Hardhat Configuration

- **Solidity Version**: 0.8.28
- **Optimizer**: Enabled in production profile (200 runs)
- **Networks**: Sepolia testnet, OP mainnet simulation
- **Plugins**: Hardhat Toolbox, Ignition, Verify

## Dependencies

### Production Dependencies
- `@openzeppelin/contracts@^5.4.0`: Security and utility contracts

### Development Dependencies
- `hardhat@^3.0.6`: Development environment
- `forge-std@v1.9.4`: Foundry testing utilities
- `ethers@^6.14.0`: Ethereum library
- `typescript@~5.8.0`: TypeScript support

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For questions and support:
- Create an issue in the GitHub repository
- Review the test files for usage examples
- Check Hardhat and Foundry documentation for tooling questions