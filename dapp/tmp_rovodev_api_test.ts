// Temporary test file to verify API client compilation
import { apiClient } from './lib/api-client';
import { CreateBountyDto, CreateAnswerDto, CreateUserDto, SelectWinnerDto } from './lib/types/api';

// Test type checking
const testBounty: CreateBountyDto = {
  title: 'Test Bounty',
  content: 'Test content',
  rewardTxHash: '0x123',
  vaultBountyId: 'vault-123',
  rewardEth: 1.0,
  walletAddress: '0xabc123',
};

const testAnswer: CreateAnswerDto = {
  walletAddress: '0xabc123',
  content: 'Test answer',
  bountyId: 1,
};

const testUser: CreateUserDto = {
  walletAddress: '0xabc123',
};

const testWinner: SelectWinnerDto = {
  bountyId: 1,
  answerId: 1,
};

// Test API client methods exist
async function testApiMethods() {
  // These won't actually run, just testing compilation
  if (false) {
    await apiClient.createBounty(testBounty);
    await apiClient.listBounties();
    await apiClient.getBountyDetail(1);
    await apiClient.getMyBounties('0xabc');
    await apiClient.getAnsweredBounties('0xabc');
    await apiClient.createAnswer(testAnswer);
    await apiClient.connectWallet(testUser);
    await apiClient.getUserProfile('0xabc');
    await apiClient.getMyPageStats('0xabc');
    await apiClient.getRecentActivities('0xabc');
    await apiClient.selectWinner(testWinner);
    await apiClient.payReward(1);
  }
}

console.log('API client test compiled successfully');