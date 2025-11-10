import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
  Socials,
} from '@coinbase/onchainkit/identity';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { Wallet as WalletIcon } from 'lucide-react';
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
  }, [address, isConnected]);

  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet
          className='p-0! m-0! min-w-0! bg-transparent! rounded-none! text-white!'
          disconnectedLabel={
            <div className="glass-effect flex items-center space-x-2 px-4 py-2 rounded-2xl hover:bg-[rgba(42,42,42,0.9)] transition-all">
              <WalletIcon
                className="h-4 w-4 pr-1"
                style={{
                  background: 'linear-gradient(135deg, #B8611E 0%, #D08C3A 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(184, 98, 31, 0.3))'
                }}
              />
              <span>Connect</span>
            </div>
          }
        >
          <div className="glass-effect flex items-center space-x-2 px-4 py-2 rounded-2xl hover:bg-[rgba(42,42,42,0.9)] transition-all">
            <WalletIcon
              className="h-4 w-4 pr-1"
              style={{
                background: 'linear-gradient(135deg, #B8611E 0%, #D08C3A 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(184, 98, 31, 0.3))'
              }}
            />
            <Name />
          </div>
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
