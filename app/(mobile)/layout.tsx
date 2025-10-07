'use client';

import type { ReactNode } from 'react';

import { ConnectWalletModal } from '@/components/ConnectWalletModal';
import { AppStateProvider, useAppState } from '@/components/app-state';
import { Toaster } from '@/components/ui/sonner';

function WalletModal() {
  const { showConnectModal, closeConnectModal, connectWallet } = useAppState();

  return (
    <ConnectWalletModal
      isOpen={showConnectModal}
      onClose={closeConnectModal}
      onConnect={connectWallet}
    />
  );
}

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 mx-auto overflow-hidden">
          <div className="flex flex-1 flex-col min-h-0">{children}</div>
        </div>
        <WalletModal />
        <Toaster />
      </main>
    </AppStateProvider>
  );
}
