import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
  Socials,
} from '@coinbase/onchainkit/identity';
import { cn } from '@coinbase/onchainkit/theme';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

interface WalletConnectorProps {
  onConnect: (address: string) => void;
}

export default function WalletConnector({ onConnect }: WalletConnectorProps) {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }
    
    onConnect(address);
  }, [address, isConnected, onConnect]);

  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet
          disconnectedLabel={
            <span className={cn('text-ock-foreground-inverse')}>Connect</span>
          }
        >
          <Avatar address={address} className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2">
            <Avatar />
            <Name />
            <Address className={'text-ock-foreground-muted'} />
            <EthBalance />
            <Socials />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownLink
            icon="wallet"
            href="https://keys.coinbase.com"
            target="_blank"
          >
            Wallet
          </WalletDropdownLink>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
