/**
 * Backend Vault Logging Service for distribute operations
 *
 * Provides comprehensive logging for blockchain transactions,
 * balance tracking, and state changes in the backend.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import contract from './contracts/MultiTokenBountyVault.json';

interface BountyState {
  key: string;
  tokenType: bigint;
  tokenAddress: string;
  totalAmount: bigint;
  depositor: string;
  solver: string;
  solverShare: bigint;
  operatorShare: bigint;
  distributed: boolean;
}

interface BalanceSnapshot {
  timestamp: number;
  solver: string;
  operator: string;
  vault: string;
  solverBalance: string;
  operatorBalance: string;
  vaultBalance: string;
}

interface DistributionCalculation {
  totalAmount: bigint;
  solverShare: bigint;
  operatorShare: bigint;
  solverAmount: bigint;
  operatorAmount: bigint;
  isETH: boolean;
  tokenAddress: string;
}

@Injectable()
export class VaultLoggerService {
  private readonly logger = new Logger(VaultLoggerService.name);
  private provider: ethers.Provider | null = null;
  private vaultAddress: string = '';
  private operatorAddress: string = '';
  private iface: ethers.Interface;

  constructor() {
    this.loadContractInterface();
  }

  private loadContractInterface(): void {
    try {
      this.iface = new ethers.Interface(contract.abi);
    } catch (error) {
      this.logger.error('❌ Failed to load contract interface', error);
      throw new Error(
        'Cannot initialize vault logger without contract interface',
      );
    }
  }

  setProvider(provider: ethers.Provider): void {
    this.provider = provider;
    this.logger.log('📡 Provider set for vault logger');
  }

  setVaultAddress(address: string): void {
    this.vaultAddress = address;
    this.logger.log(`🏦 Vault address set: ${address}`);
  }

  setOperatorAddress(address: string): void {
    this.operatorAddress = address;
    this.logger.log(`👨‍💼 Operator address set: ${address}`);
  }

  async initializeSession(chainId: number): Promise<void> {
    this.logger.log('🚀 Initializing backend vault session', {
      chainId,
      vaultAddress: this.vaultAddress,
      operatorAddress: this.operatorAddress,
      timestamp: new Date().toISOString(),
    });

    if (this.provider) {
      try {
        const network = await this.provider.getNetwork();
        const blockNumber = await this.provider.getBlockNumber();

        this.logger.log('📡 Network connection established', {
          chainId: Number(network.chainId),
          blockNumber,
          networkName: network.name,
        });

        // Verify operator address matches (if contract is deployed)
        if (this.vaultAddress) {
          try {
            const code = await this.provider.getCode(this.vaultAddress);
            if (code !== '0x') {
              const vaultContract = new ethers.Contract(
                this.vaultAddress,
                this.iface,
                this.provider,
              );

              const contractOperator = await vaultContract.operator();
              if (
                contractOperator.toLowerCase() !==
                this.operatorAddress.toLowerCase()
              ) {
                this.logger.warn('⚠️ Operator address mismatch', {
                  configured: this.operatorAddress,
                  contract: contractOperator,
                });
              } else {
                this.logger.log('✅ Operator address verified');
              }
            } else {
              this.logger.warn('⚠️ Contract not deployed at vault address', {
                vaultAddress: this.vaultAddress,
                suggestion:
                  'Deploy contract or check VAULT_ADDRESS environment variable',
              });
            }
          } catch (error) {
            this.logger.warn('⚠️ Could not verify operator address', {
              error: String(error),
              vaultAddress: this.vaultAddress,
              suggestion: 'Contract may not be compatible or deployed',
            });
          }
        }
      } catch (error) {
        this.logger.error('❌ Failed to get network info', error);
      }
    }
  }

  async captureBalanceSnapshot(
    title: string,
    solverAddress: string,
  ): Promise<BalanceSnapshot | null> {
    if (!this.provider) {
      this.logger.warn('Cannot capture balance snapshot: no provider');
      return null;
    }

    try {
      const [solverBalance, operatorBalance, vaultBalance] = await Promise.all([
        this.provider.getBalance(solverAddress),
        this.provider.getBalance(this.operatorAddress),
        this.provider.getBalance(this.vaultAddress),
      ]);

      const snapshot: BalanceSnapshot = {
        timestamp: Date.now(),
        solver: solverAddress,
        operator: this.operatorAddress,
        vault: this.vaultAddress,
        solverBalance: ethers.formatEther(solverBalance),
        operatorBalance: ethers.formatEther(operatorBalance),
        vaultBalance: ethers.formatEther(vaultBalance),
      };

      this.logger.log(`💰 ${title}`, {
        solver: `${solverAddress}: ${snapshot.solverBalance} ETH`,
        operator: `${this.operatorAddress}: ${snapshot.operatorBalance} ETH`,
        vault: `${this.vaultAddress}: ${snapshot.vaultBalance} ETH`,
        timestamp: new Date(snapshot.timestamp).toISOString(),
      });

      return snapshot;
    } catch (error) {
      this.logger.error('Failed to capture balance snapshot', {
        error: String(error),
        solverAddress,
        operatorAddress: this.operatorAddress,
        vaultAddress: this.vaultAddress,
      });
      return null;
    }
  }

  async logBountyState(bountyId: string): Promise<BountyState | null> {
    if (!this.provider) {
      this.logger.warn('Cannot fetch bounty state: no provider');
      return null;
    }

    try {
      const vaultContract = new ethers.Contract(
        this.vaultAddress,
        this.iface,
        this.provider,
      );

      const bountyKey = ethers.keccak256(ethers.toUtf8Bytes(bountyId));
      const bounty = await vaultContract.bounties(bountyKey);

      const bountyState: BountyState = {
        key: bountyKey,
        tokenType: bounty.tokenType,
        tokenAddress: bounty.tokenAddress,
        totalAmount: bounty.totalAmount,
        depositor: bounty.depositor,
        solver: bounty.solver,
        solverShare: bounty.solverShare,
        operatorShare: bounty.operatorShare,
        distributed: bounty.distributed,
      };

      this.logger.log(`🎯 Bounty State: "${bountyId}"`, {
        key: bountyState.key,
        tokenType: bountyState.tokenType === 0n ? 'ETH' : 'ERC20',
        tokenAddress: bountyState.tokenAddress,
        totalAmount: `${ethers.formatEther(bountyState.totalAmount)} ${bountyState.tokenType === 0n ? 'ETH' : 'tokens'}`,
        depositor: bountyState.depositor,
        solver: bountyState.solver,
        solverShare: `${bountyState.solverShare}%`,
        operatorShare: `${bountyState.operatorShare}%`,
        distributed: bountyState.distributed,
      });

      return bountyState;
    } catch (error) {
      this.logger.log(`🎯 Bounty "${bountyId}" not found or error occurred`, {
        error: String(error),
      });
      return null;
    }
  }

  calculateDistribution(bountyState: BountyState): DistributionCalculation {
    const isETH = bountyState.tokenType === 0n;
    const totalAmount = bountyState.totalAmount;
    const solverShare = bountyState.solverShare;
    const operatorShare = bountyState.operatorShare;

    // Calculate amounts (shares are percentages)
    const solverAmount = (totalAmount * solverShare) / 100n;
    const operatorAmount = (totalAmount * operatorShare) / 100n;

    const calculation: DistributionCalculation = {
      totalAmount,
      solverShare,
      operatorShare,
      solverAmount,
      operatorAmount,
      isETH,
      tokenAddress: bountyState.tokenAddress,
    };

    this.logger.log('🧮 Distribution Calculation', {
      totalAmount: `${ethers.formatEther(totalAmount)} ${isETH ? 'ETH' : 'tokens'}`,
      solverShare: `${solverShare}%`,
      operatorShare: `${operatorShare}%`,
      solverAmount: `${ethers.formatEther(solverAmount)} ${isETH ? 'ETH' : 'tokens'}`,
      operatorAmount: `${ethers.formatEther(operatorAmount)} ${isETH ? 'ETH' : 'tokens'}`,
      tokenType: isETH ? 'ETH' : 'ERC20',
      tokenAddress: bountyState.tokenAddress,
    });

    return calculation;
  }

  logDistributionStart(params: {
    bountyId: string;
    solverAddress: string;
    ownerAddress: string;
  }): void {
    this.logger.log('💸 Starting Distribution', {
      step: 'DISTRIBUTION_START',
      bountyId: params.bountyId,
      solver: params.solverAddress,
      owner: params.ownerAddress,
      operator: this.operatorAddress,
      timestamp: new Date().toISOString(),
    });
  }

  logTransactionSent(txHash: string, txData: any): void {
    this.logger.log('📤 Distribution Transaction Sent', {
      step: 'TX_SENT',
      hash: txHash,
      to: txData.to,
      from: txData.from,
      gasLimit: txData.gasLimit?.toString(),
      gasPrice: txData.gasPrice
        ? ethers.formatUnits(txData.gasPrice, 'gwei') + ' gwei'
        : undefined,
      nonce: txData.nonce,
      timestamp: new Date().toISOString(),
    });
  }

  logTransactionMined(
    receipt: ethers.TransactionReceipt,
    bountyId: string,
  ): void {
    const gasUsed = receipt.gasUsed;
    const effectiveGasPrice = receipt.gasPrice;
    const txCost =
      gasUsed && effectiveGasPrice
        ? ethers.formatEther(gasUsed * effectiveGasPrice)
        : 'unknown';

    this.logger.log('✅ Distribution Transaction Mined', {
      step: 'TX_MINED',
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'SUCCESS' : 'FAILED',
      gasUsed: gasUsed?.toString(),
      txCost: txCost + ' ETH',
      logsCount: receipt.logs?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Parse and log events
    if (receipt.logs && receipt.logs.length > 0) {
      this.logger.log('📢 Distribution Events', {
        step: 'EVENTS_PARSED',
        eventsCount: receipt.logs.length,
      });

      for (const log of receipt.logs) {
        try {
          const parsedLog = this.iface.parseLog(log);
          if (parsedLog) {
            if (parsedLog.name === 'Distributed') {
              this.logger.log('🎉 Distributed Event', {
                event: parsedLog.name,
                bountyId: parsedLog.args[0],
                solver: parsedLog.args[1],
                solverAmount: ethers.formatEther(parsedLog.args[2]) + ' ETH',
                operatorAmount: ethers.formatEther(parsedLog.args[3]) + ' ETH',
              });
            } else if (parsedLog.name.startsWith('Debug')) {
              this.logger.log('🔍 Debug Event', {
                event: parsedLog.name,
                message: parsedLog.args[0],
                value: parsedLog.args[1]?.toString(),
              });
            } else {
              this.logger.debug(`Event: ${parsedLog.name}`, {
                event: parsedLog.name,
                args: parsedLog.args.map((arg) =>
                  typeof arg === 'bigint' ? arg.toString() : arg,
                ),
              });
            }
          }
        } catch (e) {
          // Skip non-contract logs
          console.error('error: ', e);
        }
      }
    }

    // Diagnose transaction
    this.diagnoseDistributionTransaction(receipt, bountyId);
  }

  logDistributionSuccess(params: {
    txHash: string;
    bountyId: string;
    solverAddress: string;
    solverAmount: string;
    operatorAmount: string;
  }): void {
    this.logger.log('🎉 Distribution Completed Successfully', {
      step: 'DISTRIBUTION_SUCCESS',
      txHash: params.txHash,
      bountyId: params.bountyId,
      solver: params.solverAddress,
      solverAmount: params.solverAmount,
      operatorAmount: params.operatorAmount,
      operator: this.operatorAddress,
      timestamp: new Date().toISOString(),
    });
  }

  logDistributionError(
    error: unknown,
    bountyId: string,
    solverAddress?: string,
  ): void {
    const errorInfo = this.normalizeError(error);

    this.logger.error('❌ Distribution Failed', {
      step: 'DISTRIBUTION_FAILED',
      bountyId,
      solver: solverAddress,
      ...errorInfo,
      timestamp: new Date().toISOString(),
    });
  }

  private diagnoseDistributionTransaction(
    receipt: ethers.TransactionReceipt,
    bountyId: string,
  ): void {
    const gasUsed = receipt.gasUsed ? BigInt(receipt.gasUsed.toString()) : 0n;
    const logsCount = receipt.logs?.length || 0;

    if (receipt.status !== 1) {
      this.logger.error('Distribution transaction failed', {
        diagnosis: 'TX_FAILED',
        status: receipt.status,
        bountyId,
        possibleCauses: [
          'Bounty already distributed',
          'Insufficient gas',
          'Invalid solver address',
          'Contract error',
        ],
      });
      return;
    }

    if (logsCount === 0) {
      this.logger.warn('No events emitted - potential distribution issue', {
        diagnosis: 'NO_EVENTS',
        gasUsed: gasUsed.toString(),
        bountyId,
        suggestion:
          'Check if bounty exists, is already distributed, or transaction reverted silently',
      });
    } else {
      // Check for specific events
      let hasDistributedEvent = false;
      let debugEventCount = 0;

      for (const log of receipt.logs || []) {
        try {
          const parsedLog = this.iface.parseLog(log);
          if (parsedLog?.name === 'Distributed') {
            hasDistributedEvent = true;
          } else if (parsedLog?.name.startsWith('Debug')) {
            debugEventCount++;
          }
        } catch (e: any) {
          // Skip
          console.error(e);
        }
      }

      if (!hasDistributedEvent) {
        this.logger.warn('Missing Distributed event', {
          diagnosis: 'MISSING_DISTRIBUTED_EVENT',
          totalEvents: logsCount,
          debugEvents: debugEventCount,
          suggestion: 'Distribution may have failed silently',
        });
      } else if (debugEventCount > 0) {
        this.logger.log('Distribution completed with debug info', {
          diagnosis: 'SUCCESS_WITH_DEBUG',
          debugEvents: debugEventCount,
          gasUsed: gasUsed.toString(),
        });
      } else {
        this.logger.log('Distribution appears successful', {
          diagnosis: 'SUCCESS',
          gasUsed: gasUsed.toString(),
          eventsCount: logsCount,
        });
      }
    }
  }

  private normalizeError(error: unknown): Record<string, unknown> {
    const e = error as any;

    return {
      name: e?.name,
      code: e?.code,
      reason: e?.reason || e?.shortMessage,
      message: e?.message,
      data: e?.data,
      // Truncate stack trace for logging
      stack:
        typeof e?.stack === 'string'
          ? e.stack.split('\n').slice(0, 3).join(' | ')
          : undefined,
    };
  }

  async validateDistributionPreconditions(
    bountyId: string,
    solverAddress: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check bounty exists and get state
      const bountyState = await this.logBountyState(bountyId);

      if (!bountyState) {
        errors.push('Bounty does not exist');
        return { valid: false, errors };
      }

      if (bountyState.distributed) {
        errors.push('Bounty already distributed');
      }

      if (bountyState.totalAmount === 0n) {
        errors.push('Bounty has zero amount');
      }

      if (!ethers.isAddress(solverAddress)) {
        errors.push('Invalid solver address');
      }

      if (
        bountyState.solver !== ethers.ZeroAddress &&
        bountyState.solver.toLowerCase() !== solverAddress.toLowerCase()
      ) {
        errors.push(
          `Bounty already assigned to different solver: ${bountyState.solver}`,
        );
      }

      // Check vault has sufficient balance for ETH bounties
      if (bountyState.tokenType === 0n && this.provider) {
        const vaultBalance = await this.provider.getBalance(this.vaultAddress);
        if (vaultBalance < bountyState.totalAmount) {
          errors.push(
            `Insufficient vault balance: ${ethers.formatEther(vaultBalance)} < ${ethers.formatEther(bountyState.totalAmount)}`,
          );
        }
      }

      this.logger.log('🔍 Distribution validation completed', {
        bountyId,
        solver: solverAddress,
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      });

      return { valid: errors.length === 0, errors };
    } catch (error) {
      const validationError = `Validation failed: ${String(error)}`;
      errors.push(validationError);
      this.logger.error('❌ Distribution validation error', {
        error: validationError,
      });
      return { valid: false, errors };
    }
  }
}
