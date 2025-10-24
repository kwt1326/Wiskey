/**
 * Dapp Vault Logging Utility for depositETH operations
 * 
 * Provides comprehensive logging for blockchain transactions,
 * balance tracking, and state changes in the frontend.
 */

import { ethers } from "ethers";
import contract from "@/contracts/MultiTokenBountyVault.json";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface VaultLogger {
  log: (level: LogLevel, message: string, meta?: Record<string, unknown>) => void;
}

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
  depositor: string;
  vault: string;
  depositorBalance: string;
  vaultBalance: string;
}

// Default console logger for dapp
const defaultLogger: VaultLogger = {
  log(level, message, meta) {
    const timestamp = new Date().toISOString();
    
    const logStyle = {
      debug: 'color: #9CA3AF; background: #F9FAFB',
      info: 'color: #1F2937; background: #EFF6FF',
      warn: 'color: #92400E; background: #FFFBEB',
      error: 'color: #DC2626; background: #FEF2F2'
    };

    const style = logStyle[level] || logStyle.info;
    
    console.groupCollapsed(
      `%c[VaultLogger] ${timestamp} ${level.toUpperCase()} ${message}`,
      `${style}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
    );
    
    if (meta) {
      Object.entries(meta).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
    }
    
    console.groupEnd();
  }
};

function maskPrivateData(obj: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...obj };
  
  // Mask sensitive fields
  if (masked.privateKey) masked.privateKey = '***MASKED***';
  if (masked.mnemonic) masked.mnemonic = '***MASKED***';
  if (masked.seed) masked.seed = '***MASKED***';
  
  return masked;
}

export class DappVaultLogger {
  private logger: VaultLogger;
  private provider: ethers.Provider | null = null;
  private vaultAddress: string = '';
  private iface: ethers.Interface;

  constructor(logger?: VaultLogger) {
    this.logger = logger || defaultLogger;
    this.iface = new ethers.Interface(contract.abi);
  }

  setProvider(provider: ethers.Provider) {
    this.provider = provider;
  }

  setVaultAddress(address: string) {
    this.vaultAddress = address;
  }

  async initializeSession(userAddress: string, chainId: number): Promise<void> {
    this.logger.log('info', 'Initializing dapp vault session', {
      userAddress,
      chainId,
      vaultAddress: this.vaultAddress,
      timestamp: Date.now()
    });

    if (this.provider) {
      try {
        const network = await this.provider.getNetwork();
        const blockNumber = await this.provider.getBlockNumber();
        
        this.logger.log('info', 'Network connection established', {
          chainId: Number(network.chainId),
          blockNumber,
          networkName: network.name
        });
      } catch (error) {
        this.logger.log('error', 'Failed to get network info', { error: String(error) });
      }
    }
  }

  async captureBalanceSnapshot(
    title: string, 
    depositorAddress: string
  ): Promise<BalanceSnapshot | null> {
    if (!this.provider) {
      this.logger.log('warn', 'Cannot capture balance snapshot: no provider');
      return null;
    }

    try {
      const [depositorBalance, vaultBalance] = await Promise.all([
        this.provider.getBalance(depositorAddress),
        this.provider.getBalance(this.vaultAddress)
      ]);

      const snapshot: BalanceSnapshot = {
        timestamp: Date.now(),
        depositor: depositorAddress,
        vault: this.vaultAddress,
        depositorBalance: ethers.formatEther(depositorBalance),
        vaultBalance: ethers.formatEther(vaultBalance)
      };

      this.logger.log('info', `💰 ${title}`, {
        depositor: `${depositorAddress}: ${snapshot.depositorBalance} ETH`,
        vault: `${this.vaultAddress}: ${snapshot.vaultBalance} ETH`,
        timestamp: new Date(snapshot.timestamp).toISOString()
      });

      return snapshot;
    } catch (error) {
      this.logger.log('error', 'Failed to capture balance snapshot', {
        error: String(error),
        depositorAddress,
        vaultAddress: this.vaultAddress
      });
      return null;
    }
  }

  async logBountyState(bountyId: string): Promise<BountyState | null> {
    if (!this.provider) {
      this.logger.log('warn', 'Cannot fetch bounty state: no provider');
      return null;
    }

    try {
      const vaultContract = new ethers.Contract(
        this.vaultAddress,
        this.iface,
        this.provider
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
        distributed: bounty.distributed
      };

      this.logger.log('info', `🎯 Bounty State: "${bountyId}"`, {
        key: bountyState.key,
        tokenType: bountyState.tokenType === 0n ? 'ETH' : 'ERC20',
        tokenAddress: bountyState.tokenAddress,
        totalAmount: `${ethers.formatEther(bountyState.totalAmount)} ${bountyState.tokenType === 0n ? 'ETH' : 'tokens'}`,
        depositor: bountyState.depositor,
        solver: bountyState.solver,
        solverShare: `${bountyState.solverShare}%`,
        operatorShare: `${bountyState.operatorShare}%`,
        distributed: bountyState.distributed
      });

      return bountyState;
    } catch (error) {
      this.logger.log('info', `🎯 Bounty "${bountyId}" not found or error occurred`, {
        error: String(error)
      });
      return null;
    }
  }

  logDepositStart(params: {
    bountyId: string;
    amount: string;
    solverShare: number;
    operatorShare: number;
    userAddress: string;
    title: string;
    description: string;
  }): void {
    this.logger.log('info', '📥 Starting ETH Deposit', {
      step: 'DEPOSIT_START',
      bountyId: params.bountyId,
      amount: `${params.amount} ETH`,
      solverShare: `${params.solverShare}%`,
      operatorShare: `${params.operatorShare}%`,
      depositor: params.userAddress,
      title: params.title.substring(0, 50) + (params.title.length > 50 ? '...' : ''),
      descriptionLength: params.description.length,
      timestamp: new Date().toISOString()
    });
  }

  logTransactionSent(txHash: string, txData: any): void {
    this.logger.log('info', '📤 Transaction Sent', {
      step: 'TX_SENT',
      hash: txHash,
      to: txData.to,
      value: txData.value ? ethers.formatEther(txData.value) + ' ETH' : '0 ETH',
      gasLimit: txData.gasLimit?.toString(),
      gasPrice: txData.gasPrice ? ethers.formatUnits(txData.gasPrice, 'gwei') + ' gwei' : undefined,
      nonce: txData.nonce,
      timestamp: new Date().toISOString()
    });
  }

  async logTransactionMined(
    receipt: ethers.TransactionReceipt,
    bountyId: string
  ): Promise<void> {
    const gasUsed = receipt.gasUsed;
    const effectiveGasPrice = receipt.gasPrice;
    const txCost = gasUsed && effectiveGasPrice ? 
      ethers.formatEther(gasUsed * effectiveGasPrice) : 'unknown';

    this.logger.log('info', '✅ Transaction Mined', {
      step: 'TX_MINED',
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'SUCCESS' : 'FAILED',
      gasUsed: gasUsed?.toString(),
      txCost: txCost + ' ETH',
      logsCount: receipt.logs?.length || 0,
      timestamp: new Date().toISOString()
    });

    // Parse and log events
    if (receipt.logs && receipt.logs.length > 0) {
      this.logger.log('info', '📢 Transaction Events', {
        step: 'EVENTS_PARSED',
        eventsCount: receipt.logs.length
      });

      for (const log of receipt.logs) {
        try {
          const parsedLog = this.iface.parseLog(log);
          if (parsedLog) {
            if (parsedLog.name === 'Deposited') {
              this.logger.log('info', '🎉 Deposited Event', {
                event: parsedLog.name,
                bountyId: parsedLog.args[0],
                tokenType: parsedLog.args[1] === 0n ? 'ETH' : 'ERC20',
                tokenAddress: parsedLog.args[2],
                depositor: parsedLog.args[3],
                amount: ethers.formatEther(parsedLog.args[4]) + ' ETH'
              });
            } else {
              this.logger.log('debug', `Event: ${parsedLog.name}`, {
                event: parsedLog.name,
                args: parsedLog.args.map(arg => 
                  typeof arg === 'bigint' ? arg.toString() : arg
                )
              });
            }
          }
        } catch (e) {
          console.error(e)
          // Skip non-contract logs
        }
      }
    }

    // Check for potential issues
    this.diagnoseTransaction(receipt, bountyId);
  }

  logDepositSuccess(params: {
    txHash: string;
    bountyId: string;
    amount: string;
    userAddress: string;
  }): void {
    this.logger.log('info', '🎉 Deposit Completed Successfully', {
      step: 'DEPOSIT_SUCCESS',
      txHash: params.txHash,
      bountyId: params.bountyId,
      amount: `${params.amount} ETH`,
      depositor: params.userAddress,
      timestamp: new Date().toISOString()
    });
  }

  logDepositError(error: unknown, bountyId: string): void {
    const errorInfo = this.normalizeError(error);
    
    this.logger.log('error', '❌ Deposit Failed', {
      step: 'DEPOSIT_FAILED',
      bountyId,
      ...errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  private diagnoseTransaction(receipt: ethers.TransactionReceipt, bountyId: string): void {
    const gasUsed = receipt.gasUsed ? BigInt(receipt.gasUsed.toString()) : 0n;
    const logsCount = receipt.logs?.length || 0;

    if (receipt.status !== 1) {
      this.logger.log('error', 'Transaction failed', {
        diagnosis: 'TX_FAILED',
        status: receipt.status,
        bountyId
      });
      return;
    }

    if (logsCount === 0) {
      this.logger.log('warn', 'No events emitted - potential issue', {
        diagnosis: 'NO_EVENTS',
        gasUsed: gasUsed.toString(),
        bountyId,
        suggestion: 'Check if bounty already exists or transaction reverted silently'
      });
    } else if (gasUsed < 50000n) {
      this.logger.log('warn', 'Low gas usage detected', {
        diagnosis: 'LOW_GAS',
        gasUsed: gasUsed.toString(),
        suggestion: 'Transaction may not have performed expected operations'
      });
    } else {
      this.logger.log('debug', 'Transaction appears healthy', {
        diagnosis: 'HEALTHY',
        gasUsed: gasUsed.toString(),
        eventsCount: logsCount
      });
    }
  }

  private normalizeError(error: unknown): Record<string, unknown> {
    const e = error as any;
    
    return maskPrivateData({
      name: e?.name,
      code: e?.code,
      reason: e?.reason || e?.shortMessage,
      message: e?.message,
      data: e?.data,
      stack: typeof e?.stack === 'string' ? 
        e.stack.split('\n').slice(0, 3).join(' | ') : 
        undefined
    });
  }
}

// Export singleton instance
export const vaultLogger = new DappVaultLogger();
