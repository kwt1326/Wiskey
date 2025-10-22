/**
 * Nonce Management Service
 *
 * Handles sequential nonce allocation to prevent "nonce too low" errors
 * when multiple transactions are sent concurrently from the same wallet.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

interface PendingTransaction {
  nonce: number;
  promise: Promise<ethers.TransactionResponse>;
  timestamp: number;
}

@Injectable()
export class NonceManagerService {
  private readonly logger = new Logger(NonceManagerService.name);
  private nonceCache = new Map<string, number>(); // walletAddress -> nextNonce
  private pendingTxs = new Map<string, Map<number, PendingTransaction>>(); // walletAddress -> nonce -> PendingTx
  private nonceLocks = new Map<string, Promise<void>>(); // walletAddress -> lock promise

  /**
   * Get the next available nonce for a wallet address
   */
  async getNextNonce(
    provider: ethers.Provider,
    walletAddress: string,
    forceRefresh = false,
  ): Promise<number> {
    const normalizedAddress = walletAddress.toLowerCase();

    // Wait for any existing nonce operations to complete
    await this.waitForNonceLock(normalizedAddress);

    // Create a lock for this operation
    let resolveLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.nonceLocks.set(normalizedAddress, lockPromise);

    try {
      let nextNonce: number;

      if (forceRefresh || !this.nonceCache.has(normalizedAddress)) {
        // Get fresh nonce from blockchain
        const blockchainNonce = await provider.getTransactionCount(
          walletAddress,
          'pending', // Include pending transactions
        );

        this.logger.debug('Fresh nonce from blockchain', {
          address: normalizedAddress,
          blockchainNonce,
          forceRefresh,
        });

        nextNonce = blockchainNonce;
        this.nonceCache.set(normalizedAddress, nextNonce);
      } else {
        // Use cached nonce
        nextNonce = this.nonceCache.get(normalizedAddress)!;

        this.logger.debug('Using cached nonce', {
          address: normalizedAddress,
          cachedNonce: nextNonce,
        });
      }

      // Increment nonce for next transaction
      this.nonceCache.set(normalizedAddress, nextNonce + 1);

      // Clean up old pending transactions
      this.cleanupOldPendingTxs(normalizedAddress);

      this.logger.log('Allocated nonce', {
        address: normalizedAddress,
        allocatedNonce: nextNonce,
        nextAvailable: nextNonce + 1,
      });

      return nextNonce;
    } finally {
      // Release the lock
      resolveLock!();
      this.nonceLocks.delete(normalizedAddress);
    }
  }

  /**
   * Register a pending transaction to track its nonce usage
   */
  registerPendingTransaction(
    walletAddress: string,
    nonce: number,
    txPromise: Promise<ethers.TransactionResponse>,
  ): void {
    const normalizedAddress = walletAddress.toLowerCase();

    if (!this.pendingTxs.has(normalizedAddress)) {
      this.pendingTxs.set(normalizedAddress, new Map());
    }

    const pendingTx: PendingTransaction = {
      nonce,
      promise: txPromise,
      timestamp: Date.now(),
    };

    this.pendingTxs.get(normalizedAddress)!.set(nonce, pendingTx);

    // Monitor transaction completion
    txPromise
      .then((tx) => {
        this.logger.debug('Transaction completed', {
          address: normalizedAddress,
          nonce,
          hash: tx.hash,
        });
      })
      .catch((error) => {
        this.logger.warn('Transaction failed', {
          address: normalizedAddress,
          nonce,
          error: String(error),
        });

        // If transaction failed due to nonce issues, we might need to refresh
        if (this.isNonceError(error)) {
          this.logger.warn(
            'Nonce error detected, will refresh on next request',
            {
              address: normalizedAddress,
              nonce,
              error: String(error),
            },
          );

          // Force refresh on next nonce request
          this.nonceCache.delete(normalizedAddress);
        }
      })
      .finally(() => {
        // Clean up completed transaction
        const walletPendingTxs = this.pendingTxs.get(normalizedAddress);
        if (walletPendingTxs) {
          walletPendingTxs.delete(nonce);
          if (walletPendingTxs.size === 0) {
            this.pendingTxs.delete(normalizedAddress);
          }
        }
      });

    this.logger.debug('Registered pending transaction', {
      address: normalizedAddress,
      nonce,
      pendingCount: this.pendingTxs.get(normalizedAddress)?.size || 0,
    });
  }

  /**
   * Reset nonce cache for a wallet (use when nonce errors occur)
   */
  async resetNonce(
    provider: ethers.Provider,
    walletAddress: string,
  ): Promise<number> {
    const normalizedAddress = walletAddress.toLowerCase();

    this.logger.warn('Resetting nonce cache', { address: normalizedAddress });

    // Clear cache and get fresh nonce
    this.nonceCache.delete(normalizedAddress);
    this.pendingTxs.delete(normalizedAddress);

    return this.getNextNonce(provider, walletAddress, true);
  }

  /**
   * Get current nonce status for debugging
   */
  getNonceStatus(walletAddress: string): {
    cachedNonce?: number;
    pendingTxCount: number;
    pendingNonces: number[];
  } {
    const normalizedAddress = walletAddress.toLowerCase();
    const pendingTxs = this.pendingTxs.get(normalizedAddress);

    return {
      cachedNonce: this.nonceCache.get(normalizedAddress),
      pendingTxCount: pendingTxs?.size || 0,
      pendingNonces: pendingTxs ? Array.from(pendingTxs.keys()).sort() : [],
    };
  }

  private async waitForNonceLock(walletAddress: string): Promise<void> {
    const existingLock = this.nonceLocks.get(walletAddress);
    if (existingLock) {
      await existingLock;
    }
  }

  private cleanupOldPendingTxs(walletAddress: string): void {
    const pendingTxs = this.pendingTxs.get(walletAddress);
    if (!pendingTxs) return;

    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [nonce, pendingTx] of pendingTxs.entries()) {
      if (now - pendingTx.timestamp > maxAge) {
        this.logger.warn('Cleaning up old pending transaction', {
          address: walletAddress,
          nonce,
          age: now - pendingTx.timestamp,
        });
        pendingTxs.delete(nonce);
      }
    }

    if (pendingTxs.size === 0) {
      this.pendingTxs.delete(walletAddress);
    }
  }

  private isNonceError(error: any): boolean {
    const errorStr = String(error).toLowerCase();
    return (
      errorStr.includes('nonce too low') ||
      errorStr.includes('nonce too high') ||
      errorStr.includes('nonce has already been used') ||
      errorStr.includes('replacement transaction underpriced')
    );
  }
}
