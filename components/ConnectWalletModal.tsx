'use client';

import React from 'react';
import { Wallet, Shield, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export function ConnectWalletModal({ isOpen, onClose, onConnect }: ConnectWalletModalProps) {
  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using browser extension',
      recommended: true
    },
    {
      name: 'Coinbase Wallet',
      icon: '🔷',
      description: 'Connect using Coinbase Wallet'
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect using WalletConnect'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your funds are protected by smart contract escrow'
    },
    {
      icon: Zap,
      title: 'Instant Rewards',
      description: 'Get paid immediately when selected as winner'
    }
  ];

  const handleConnect = (walletName: string) => {
    // Simulate connection process
    toast.loading('Connecting to ' + walletName + '...', { id: 'wallet-connect' });
    
    setTimeout(() => {
      onConnect();
      toast.success('Wallet Connected: 0x4F7c...7B9A', { id: 'wallet-connect' });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-white rounded-3xl p-6">
        <DialogHeader>
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center font-bold">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-center text-slate-600 leading-relaxed mt-3">
            Connect your wallet to post bounties, answer questions, and earn rewards on Base network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-8">
          {/* Wallet Options */}
          <div className="space-y-4">
            {walletOptions.map((wallet) => (
              <Card
                key={wallet.name}
                className="cursor-pointer hover:shadow-lg transition-all border border-slate-200 hover:border-emerald-200 active:scale-[0.98] rounded-2xl"
                onClick={() => handleConnect(wallet.name)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{wallet.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900 text-lg">{wallet.name}</h4>
                        {wallet.recommended && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{wallet.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="font-semibold text-slate-900 mb-4 text-center text-lg">Why Connect?</h4>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 text-base">{feature.title}</h5>
                    <p className="text-slate-600 mt-1 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-50 rounded-2xl p-4 mt-6">
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy. 
              We never store your private keys.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}