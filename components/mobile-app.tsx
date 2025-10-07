'use client';

import { useState } from 'react';

import { ConnectWalletModal } from '@/components/ConnectWalletModal';
import { Home } from '@/components/Home';
import { MyBounties } from '@/components/MyBounties';
import { PostProblem } from '@/components/PostProblem';
import { ProblemDetail } from '@/components/ProblemDetail';
import { Profile } from '@/components/Profile';
import { Toaster } from '@/components/ui/sonner';
import { mockBounties } from '@/components/mock-data';
import type { AppState, Screen } from '@/components/types';

export function MobileApp() {
  const [state, setState] = useState<AppState>(() => ({
    currentScreen: 'home',
    selectedBountyId: null,
    isWalletConnected: false,
    userWallet: null,
    bounties: mockBounties,
    showConnectModal: false,
  }));

  const navigateToScreen = (screen: Screen, bountyId?: string) => {
    setState((prev) => ({
      ...prev,
      currentScreen: screen,
      selectedBountyId: bountyId ?? null,
    }));
  };

  const connectWallet = () => {
    setState((prev) => ({
      ...prev,
      isWalletConnected: true,
      userWallet: '0x4F7c...7B9A',
      showConnectModal: false,
    }));
  };

  const addBounty = (bounty: Omit<AppState['bounties'][number], 'id' | 'createdAt' | 'answers'>) => {
    const newBounty = {
      ...bounty,
      id: Date.now().toString(),
      createdAt: new Date(),
      answers: [],
    };

    setState((prev) => ({
      ...prev,
      bounties: [newBounty, ...prev.bounties],
    }));
  };

  const addAnswer = (bountyId: string, content: string) => {
    setState((prev) => ({
      ...prev,
      bounties: prev.bounties.map((bounty) =>
        bounty.id === bountyId
          ? {
              ...bounty,
              answers: [
                ...bounty.answers,
                {
                  id: Date.now().toString(),
                  content,
                  responderWallet: prev.userWallet ?? '0x0000...0000',
                  timestamp: new Date(),
                },
              ],
            }
          : bounty,
      ),
    }));
  };

  const selectWinner = (bountyId: string, answerId: string) => {
    setState((prev) => ({
      ...prev,
      bounties: prev.bounties.map((bounty) =>
        bounty.id === bountyId
          ? {
              ...bounty,
              status: 'completed',
              timeLeft: 'Completed',
              answers: bounty.answers.map((answer) =>
                answer.id === answerId ? { ...answer, isWinner: true } : answer,
              ),
            }
          : bounty,
      ),
    }));
  };

  const renderCurrentScreen = () => {
    switch (state.currentScreen) {
      case 'home':
        return (
          <Home
            bounties={state.bounties}
            isWalletConnected={state.isWalletConnected}
            userWallet={state.userWallet}
            onNavigate={navigateToScreen}
            onShowConnectModal={() =>
              setState((prev) => ({ ...prev, showConnectModal: true }))
            }
          />
        );
      case 'problem-detail':
        return (
          <ProblemDetail
            bountyId={state.selectedBountyId!}
            bounties={state.bounties}
            isWalletConnected={state.isWalletConnected}
            userWallet={state.userWallet}
            onNavigate={navigateToScreen}
            onAddAnswer={addAnswer}
            onSelectWinner={selectWinner}
          />
        );
      case 'post-problem':
        return (
          <PostProblem
            isWalletConnected={state.isWalletConnected}
            userWallet={state.userWallet}
            onNavigate={navigateToScreen}
            onAddBounty={addBounty}
          />
        );
      case 'my-bounties':
        return (
          <MyBounties
            bounties={state.bounties}
            userWallet={state.userWallet}
            onNavigate={navigateToScreen}
          />
        );
      case 'profile':
        return (
          <Profile
            isWalletConnected={state.isWalletConnected}
            userWallet={state.userWallet}
            bounties={state.bounties}
            onNavigate={navigateToScreen}
            onShowConnectModal={() =>
              setState((prev) => ({ ...prev, showConnectModal: true }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen mx-auto overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {renderCurrentScreen()}

      <ConnectWalletModal
        isOpen={state.showConnectModal}
        onClose={() => setState((prev) => ({ ...prev, showConnectModal: false }))}
        onConnect={connectWallet}
      />

      <Toaster />
    </div>
  );
}
