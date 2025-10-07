'use client';

import React, { useEffect, useRef } from 'react';
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
import { useAccount } from 'wagmi';
import { Wallet as WalletIcon, Shield, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card, CardContent } from './ui/card';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export function ConnectWalletModal({
  isOpen,
  onClose,
  onConnect,
}: ConnectWalletModalProps) {
  const { address } = useAccount();
  const initialAddressRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your funds are protected by smart contract escrow',
    },
    {
      icon: Zap,
      title: 'Instant Rewards',
      description: 'Get paid immediately when selected as winner',
    },
  ];

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      initialAddressRef.current = address ?? null;
    }

    wasOpenRef.current = isOpen;
  }, [address, isOpen]);

  useEffect(() => {
    if (!isOpen || !address) {
      return;
    }

    if (initialAddressRef.current) {
      return;
    }

    onConnect(address);
    onClose();
  }, [address, isOpen, onClose, onConnect]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-y-auto max-w-sm mx-auto bg-white rounded-3xl p-6"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <DialogHeader>
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <WalletIcon className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 leading-relaxed mt-3">
            Connect your wallet to post bounties, answer questions, and earn
            rewards on Base network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-8">
          <Card className="border border-emerald-200/60 bg-emerald-50/60 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col items-stretch space-y-4">
                <span className="text-sm font-semibold text-emerald-700">
                  Choose a wallet to continue
                </span>
                <div className="flex justify-center">
                  <Wallet>
                    <ConnectWallet
                      disconnectedLabel={
                        <span className={cn('text-ock-foreground-inverse')}>
                          Connect
                        </span>
                      }
                    >
                      <Avatar address={address} className="h-6 w-6" />
                      <Name />
                    </ConnectWallet>
                    <WalletDropdown>
                      <Identity className="px-4 pt-3 pb-2">
                        <Avatar />
                        <Name />
                        <Address className="text-ock-foreground-muted" />
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
                <p className="text-xs text-emerald-700/80 text-center">
                  Powered by Coinbase OnchainKit
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="font-semibold text-slate-900 mb-4 text-center text-lg">
              Why Connect?
            </h4>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 text-base">
                      {feature.title}
                    </h5>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-50 rounded-2xl p-4 mt-6">
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              By connecting your wallet, you agree to our Terms of Service and
              Privacy Policy.
              We never store your private keys.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
