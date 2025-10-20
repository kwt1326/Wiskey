import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import contract from './contracts/MultiTokenBountyVault.json';

dotenv.config();

// export class VaultService {
//   private static iface = new ethers.Interface(contract.abi);

//   private static provider = new ethers.JsonRpcProvider(
//     process.env.ETH_PROVIDER_URL,
//   );
//   private static wallet = new ethers.Wallet(
//     process.env.ETH_PRIVATE_KEY!,
//     this.provider,
//   );
//   private static contract = new ethers.Contract(
//     process.env.VAULT_CONTRACT_ADDRESS!,
//     this.iface,
//     this.wallet,
//   );

//   static async distributeReward(bountyId: string, winnerAddress: string) {
//     const tx = await this.contract.distribute(bountyId, winnerAddress);
//     const receipt = await tx.wait();
//     return receipt;
//   }
// }

// VaultService.ts (ethers v6)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface Logger {
  log: (
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) => void;
}

const defaultLogger: Logger = {
  log(level, message, meta) {
    const ts = new Date().toISOString();
    const metaStr = meta ? safeStringify(meta) : '';
    const fn =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'info'
            ? console.info
            : console.debug;
    fn(
      `[VaultService] ${ts} ${level.toUpperCase()} ${message}${metaStr ? ' ' + metaStr : ''}`,
    );
  },
};

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, (_k, v) => {
      if (typeof v === 'bigint') return v.toString();
      if (v instanceof Uint8Array) return Buffer.from(v).toString('hex');
      return v;
    });
  } catch {
    return '[unserializable]';
  }
}

function maskUrl(url?: string) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.username) u.username = '***';
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return url;
  }
}

function normalizeError(error: unknown): Record<string, unknown> {
  const e = error as any;
  return {
    name: e?.name,
    code: e?.code,
    reason: e?.reason,
    shortMessage: e?.shortMessage,
    message: typeof e?.message === 'string' ? e.message : undefined,
    data: e?.data,
    info: e?.info,
    tx: e?.transaction,
    receipt: e?.receipt,
    stack:
      typeof e?.stack === 'string'
        ? e.stack.split('\n').slice(0, 4).join(' | ')
        : undefined,
  };
}

export class VaultService {
  private static logger: Logger = defaultLogger;

  static setLogger(logger: Logger) {
    this.logger = logger;
  }

  private static iface = new ethers.Interface(contract.abi);
  private static provider = new ethers.JsonRpcProvider(
    process.env.ETH_PROVIDER_URL,
  );
  private static wallet = new ethers.Wallet(
    process.env.ETH_PRIVATE_KEY!,
    this.provider,
  );
  private static contract = new ethers.Contract(
    process.env.VAULT_CONTRACT_ADDRESS!,
    this.iface,
    this.wallet,
  );

  static async initDiagnostics() {
    const network = await this.provider.getNetwork();
    const feeData = await this.provider.getFeeData();
    const walletAddress = await this.wallet.getAddress();
    this.logger.log('info', 'Initialized VaultService', {
      rpcUrl: maskUrl(process.env.ETH_PROVIDER_URL),
      contractAddress: process.env.VAULT_CONTRACT_ADDRESS,
      walletAddress,
      chainId: Number(network.chainId),
      gasPrice: feeData.gasPrice?.toString(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    });
  }

  // distribute(bountyId: string, solver: address)
  static async distributeReward(bountyId: string, solver: string) {
    const startTs = Date.now();
    this.logger.log('info', 'distributeReward called', { bountyId, solver });

    try {
      if (!bountyId || typeof bountyId === 'object')
        throw new Error('Invalid bountyId');
      if (!ethers.isAddress(solver))
        throw new Error(`Invalid Ethereum address: ${solver}`);

      const walletAddress = await this.wallet.getAddress();
      const nonce = await this.provider.getTransactionCount(
        walletAddress,
        'pending',
      );
      const feeData = await this.provider.getFeeData();

      this.logger.log('debug', 'Pre-tx state', {
        walletAddress,
        nonce,
        feeData: {
          gasPrice: feeData.gasPrice?.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        },
      });

      let gasEstimate: bigint | undefined;
      try {
        const estimate = await this.contract.distribute.estimateGas(
          bountyId,
          solver,
        );
        gasEstimate = BigInt(estimate.toString());
        this.logger.log('debug', 'Gas estimated', {
          gasEstimate: gasEstimate.toString(),
        });
      } catch (err) {
        this.logger.log(
          'warn',
          'Gas estimation failed; sending without explicit gasLimit',
          normalizeError(err),
        );
      }

      this.logger.log('info', 'Sending tx: distribute', {
        method: 'distribute',
        args: { bountyId, solver },
      });

      const tx = await this.contract.distribute(bountyId, solver, {
        // gasLimit: gasEstimate ? (gasEstimate * 110n) / 100n : undefined,
        // maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      });

      this.logger.log('info', 'Tx sent', {
        hash: tx.hash,
        nonce: tx.nonce,
        to: tx.to,
        from: tx.from,
        gasPrice: tx.gasPrice?.toString(),
      });

      const receipt = await tx.wait();

      const durationMs = Date.now() - startTs;
      this.logger.log('info', 'Tx mined', {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        logsCount: receipt.logs?.length,
        durationMs,
      });

      // ABI상 outputs 없고 이벤트 명시 없음 → 로그 디코딩은 생략하거나, 컨트랙트가 실제로 이벤트를 emit한다면 iface.parseLog로 추가
      return receipt;
    } catch (error) {
      const durationMs = Date.now() - startTs;
      const normalized = normalizeError(error);
      this.logger.log('error', 'distributeReward failed', {
        ...normalized,
        durationMs,
        bountyId,
        solver,
      });
      throw error;
    }
  }
}
