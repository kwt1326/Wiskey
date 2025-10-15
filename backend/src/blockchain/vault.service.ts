import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const VAULT_ABI = [
  // 최소한 distribute 함수만 정의
  'function distribute(uint256 bountyId, address winner) external returns (bool)',
];

export class VaultService {
  private static provider = new ethers.JsonRpcProvider(
    process.env.ETH_PROVIDER_URL,
  );
  private static wallet = new ethers.Wallet(
    process.env.ETH_PRIVATE_KEY!,
    this.provider,
  );
  private static contract = new ethers.Contract(
    process.env.VAULT_CONTRACT_ADDRESS!,
    VAULT_ABI,
    this.wallet,
  );

  static async distributeReward(bountyId: number, winnerAddress: string) {
    const tx = await this.contract.distribute(bountyId, winnerAddress);
    const receipt = await tx.wait();
    return receipt;
  }
}
