import { useCallback, useMemo, useRef, useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus, TransactionResponseType } from "@coinbase/onchainkit/transaction";
import { APIError } from "@coinbase/onchainkit/api";
import { base } from "wagmi/chains";
import { ethers } from "ethers";
import { Award } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import contract from "@/contracts/MultiTokenBountyVault.json" assert { type: "json" };

export type OnDepositSuccessPayload = {
  txHash: string;
  vaultBountyId: string;
  title: string;
  description: string;
  rewardEth: string;
  userWallet: string;
};

type Props = {
  rewardEth: string;
  solverShare?: number;
  operatorShare?: number;
  title: string;
  description: string;
  userWallet?: string | null;
  isFormValid: boolean;
  isSponsored?: boolean;
  onDepositSuccess: (payload: OnDepositSuccessPayload) => Promise<void> | void;
};

const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x0000') as `0x${string}`;
const ANVIL_CHAIN_ID = 31337;

export default function BountyDeposit({
  rewardEth,
  solverShare = 90,
  operatorShare = 10,
  title,
  description,
  userWallet,
  isFormValid,
  isSponsored = false,
  onDepositSuccess,
}: Props) {
  const iface = useMemo(() => new ethers.Interface(contract.abi), []);
  const lastBountyIdRef = useRef<string | null>(null);
  
  const [status, setStatus] = useState<string>('init');
  const [isCalled, setIsCalled] = useState<boolean>(false);

  const chainId = useMemo(
    () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ? ANVIL_CHAIN_ID : base.id,
    []
  );

  const calls = async () => {
    if (!userWallet) {
      throw new Error("Wallet not connected");
    }
    if (!isFormValid) {
      throw new Error("Form not valid");
    }
    if (solverShare + operatorShare !== 100) {
      throw new Error("Invalid ratio");
    }

    const bountyId = uuidv4();
    lastBountyIdRef.current = bountyId;

    const value = ethers.parseEther(rewardEth);
    const data = iface.encodeFunctionData("depositETH", [bountyId, solverShare, operatorShare]);
    
    return [{ to: VAULT_ADDRESS, data: data as `0x${string}`, value }];
  };

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    setStatus(status.statusName);
  }, []);

  const handleOnError = useCallback((error: APIError) => {
    console.error("TransactionError: ", error);
  }, []);

  const handleOnSuccess = async (response: TransactionResponseType) => {
    try {
      if (status !== 'success' || isCalled) return;
      
      const vaultBountyId = lastBountyIdRef.current?.toString();
      
      if (!vaultBountyId || !userWallet) throw new Error('Missing bountyId or wallet');

      const receipt = response.transactionReceipts[0];
      const txHash = receipt.transactionHash;

      await onDepositSuccess({
        txHash,
        vaultBountyId,
        title: title.trim(),
        description: description.trim(),
        rewardEth,
        userWallet,
      });

      setIsCalled(true);
    } catch (err) {
      console.error(`handleOnSuccess Error : ${err}`);
    }
  };

  // Button render function (same as original)
  const renderButton = ({
    status,
    onSubmit,
    isDisabled,
  }: {
    status: "default" | "success" | "error" | "pending";
    onSubmit: () => void;
    isDisabled: boolean;
  }) => {
    const walletConnected = !!userWallet;
    const baseDisabled = isDisabled || !walletConnected || !isFormValid;

    let content: React.ReactNode = null;

    if (!walletConnected) {
      content = (
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6" />
          <span>Connect Wallet</span>
        </div>
      );
    } else if (status === "pending") {
      content = (
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Creating Bounty...</span>
        </div>
      );
    } else if (isCalled || status === "success") {
      content = (
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6" />
          <span>Created Bounty</span>
        </div>
      );
    } else {
      content = (
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6" />
          <span>{isFormValid ? "Create Bounty" : "Create Bounty"}</span>
        </div>
      );
    }

    return (
      <button
        onClick={onSubmit}
        disabled={baseDisabled}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-4 text-lg font-semibold min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {content}
      </button>
    );
  };

  return (
    <div>
      <Transaction
        chainId={chainId}
        calls={calls}
        onStatus={handleOnStatus}
        onSuccess={handleOnSuccess}
        onError={handleOnError}
        isSponsored={isSponsored}
      >
        <TransactionButton render={renderButton} />
        <TransactionStatus>
          <TransactionStatusLabel />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}