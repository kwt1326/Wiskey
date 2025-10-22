/**
 * Enhanced Vault Service with Comprehensive Logging
 *
 * Integrates the VaultLoggerService for detailed logging of distribute operations
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { VaultLoggerService } from './vault-logger.service';
import { NonceManagerService } from './nonce-manager.service';
import contract from './contracts/MultiTokenBountyVault.json';

interface DistributeResult {
  success: boolean;
  txHash?: string;
  solverAmount?: string;
  operatorAmount?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
}

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name);
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private vaultContract: ethers.Contract;
  private vaultAddress: string;

  constructor(
    private readonly vaultLogger: VaultLoggerService,
    private readonly nonceManager: NonceManagerService,
  ) {
    this.initializeProvider();
  }

  async onModuleInit() {
    await this.initializeLogging();
  }

  private initializeProvider(): void {
    const rpcUrl = process.env.ETH_PROVIDER_URL || 'http://127.0.0.1:8545';
    const privateKey = process.env.ETH_PRIVATE_KEY;
    this.vaultAddress = process.env.VAULT_CONTRACT_ADDRESS || '';

    if (!privateKey) {
      throw new Error('ETH_PRIVATE_KEY environment variable is required');
    }
    if (!this.vaultAddress) {
      throw new Error(
        'VAULT_CONTRACT_ADDRESS environment variable is required',
      );
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.loadVaultContract();
  }

  private loadVaultContract(): void {
    this.vaultContract = new ethers.Contract(
      this.vaultAddress,
      contract.abi,
      this.wallet,
    );
  }

  private async initializeLogging(): Promise<void> {
    try {
      this.vaultLogger.setProvider(this.provider);
      this.vaultLogger.setVaultAddress(this.vaultAddress);

      const code = await this.provider.getCode(this.vaultAddress);
      let operatorAddress: string;

      if (code === '0x') {
        operatorAddress = process.env.OPERATOR_ADDRESS || this.wallet.address;
      } else {
        try {
          operatorAddress = await this.vaultContract.operator();
        } catch {
          operatorAddress = this.wallet.address;
        }
      }

      this.vaultLogger.setOperatorAddress(operatorAddress);

      const network = await this.provider.getNetwork();
      await this.vaultLogger.initializeSession(Number(network.chainId));
    } catch (error) {
      this.logger.error('❌ initializeLogging failed', {
        error: String(error),
      });
      const fallbackOperator =
        process.env.OPERATOR_ADDRESS || this.wallet.address;
      this.vaultLogger.setOperatorAddress(fallbackOperator);
    }
  }

  /**
   * Distribute bounty with comprehensive logging
   */
  async distributeWithLogging(
    bountyId: string,
    solverAddress: string,
  ): Promise<DistributeResult> {
    try {
      // 🚀 Start distribution
      this.vaultLogger.logDistributionStart({
        bountyId,
        solverAddress,
        ownerAddress: this.wallet.address,
      });

      // 🔍 Validate preconditions
      const validation =
        await this.vaultLogger.validateDistributionPreconditions(
          bountyId,
          solverAddress,
        );

      if (!validation.valid) {
        const errorMsg = `Validation failed: ${validation.errors.join(', ')}`;
        this.vaultLogger.logDistributionError(
          new Error(errorMsg),
          bountyId,
          solverAddress,
        );
        return { success: false, error: errorMsg };
      }

      // 💰 Capture state and execute transaction
      const [bountyState] = await Promise.all([
        this.vaultLogger.logBountyState(bountyId),
        this.vaultLogger.captureBalanceSnapshot(
          'Before Distribution',
          solverAddress,
        ),
      ]);

      if (!bountyState) throw new Error('Failed to get bounty state');

      const distribution = this.vaultLogger.calculateDistribution(bountyState);

      // 📤 Execute transaction with nonce management
      const ownerNonce = await this.nonceManager.getNextNonce(
        this.provider,
        this.wallet.address,
      );

      const txPromise = this.vaultContract.distribute(bountyId, solverAddress, {
        nonce: ownerNonce,
      });

      this.nonceManager.registerPendingTransaction(
        this.wallet.address,
        ownerNonce,
        txPromise,
      );

      const tx = await txPromise;
      this.vaultLogger.logTransactionSent(tx.hash, {
        to: this.vaultAddress,
        from: this.wallet.address,
        nonce: tx.nonce,
      });

      // ⏳ Wait for confirmation and capture final state
      const receipt = await tx.wait();
      if (!receipt) throw new Error('Transaction receipt is null');

      this.vaultLogger.logTransactionMined(receipt, bountyId);

      await Promise.all([
        this.vaultLogger.captureBalanceSnapshot(
          'After Distribution',
          solverAddress,
        ),
        this.vaultLogger.logBountyState(bountyId),
      ]);

      // 📊 Prepare result
      const result: DistributeResult = {
        success: true,
        txHash: receipt.hash,
        solverAmount: ethers.formatEther(distribution.solverAmount),
        operatorAmount: ethers.formatEther(distribution.operatorAmount),
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber,
      };

      this.vaultLogger.logDistributionSuccess({
        txHash: receipt.hash,
        bountyId,
        solverAddress,
        solverAmount:
          result.solverAmount + (distribution.isETH ? ' ETH' : ' tokens'),
        operatorAmount:
          result.operatorAmount + (distribution.isETH ? ' ETH' : ' tokens'),
      });

      return result;
    } catch (error) {
      // ❌ Log comprehensive error details
      this.vaultLogger.logDistributionError(error, bountyId, solverAddress);

      this.logger.error('❌ Distribution failed', {
        bountyId,
        solverAddress,
        error: String(error),
      });

      // Handle nonce errors with retry
      if (this.isNonceError(error)) {
        try {
          await this.nonceManager.resetNonce(
            this.provider,
            this.wallet.address,
          );
          return this.distributeWithLogging(bountyId, solverAddress);
        } catch (retryError) {
          return {
            success: false,
            error: `Nonce error retry failed: ${String(retryError)}`,
          };
        }
      }

      return {
        success: false,
        error: String(error),
      };
    }
  }

  async getBountyInfo(bountyId: string): Promise<any> {
    return await this.vaultLogger.logBountyState(bountyId);
  }

  async canDistribute(
    bountyId: string,
    solverAddress: string,
  ): Promise<{
    canDistribute: boolean;
    reasons: string[];
  }> {
    try {
      const validation =
        await this.vaultLogger.validateDistributionPreconditions(
          bountyId,
          solverAddress,
        );
      return {
        canDistribute: validation.valid,
        reasons: validation.errors,
      };
    } catch (error) {
      return {
        canDistribute: false,
        reasons: [String(error)],
      };
    }
  }

  async getVaultMetrics(): Promise<{
    vaultBalance: string;
    operatorAddress: string;
    blockNumber: number;
    networkName: string;
  }> {
    const [vaultBalance, operatorAddress, blockNumber, network] =
      await Promise.all([
        this.provider.getBalance(this.vaultAddress),
        this.vaultContract.operator(),
        this.provider.getBlockNumber(),
        this.provider.getNetwork(),
      ]);

    return {
      vaultBalance: ethers.formatEther(vaultBalance),
      operatorAddress,
      blockNumber,
      networkName: network.name,
    };
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    details: Record<string, any>;
  }> {
    try {
      const [blockNumber, operatorAddress, walletBalance, vaultBalance] =
        await Promise.all([
          this.provider.getBlockNumber(),
          this.vaultContract.operator(),
          this.provider.getBalance(this.wallet.address),
          this.provider.getBalance(this.vaultAddress),
        ]);

      return {
        healthy: true,
        details: {
          provider: { connected: true, blockNumber },
          vault: { accessible: true, operator: operatorAddress },
          wallet: {
            address: this.wallet.address,
            balance: ethers.formatEther(walletBalance),
          },
          vaultBalance: ethers.formatEther(vaultBalance),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) },
      };
    }
  }

  /**
   * Check if error is nonce-related
   */
  private isNonceError(error: any): boolean {
    const errorStr = String(error).toLowerCase();
    return (
      errorStr.includes('nonce too low') ||
      errorStr.includes('nonce too high') ||
      errorStr.includes('nonce has already been used') ||
      errorStr.includes('replacement transaction underpriced') ||
      errorStr.includes('already known')
    );
  }

  /**
   * Get nonce status for debugging
   */
  async getNonceStatus(): Promise<{
    walletAddress: string;
    blockchainNonce: number;
    cachedNonce?: number;
    pendingTxCount: number;
    pendingNonces: number[];
  }> {
    const walletAddress = this.wallet.address;
    const blockchainNonce = await this.provider.getTransactionCount(
      walletAddress,
      'pending',
    );
    const managerStatus = this.nonceManager.getNonceStatus(walletAddress);

    return {
      walletAddress,
      blockchainNonce,
      ...managerStatus,
    };
  }
}
