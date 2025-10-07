'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { mockBounties } from '@/components/mock-data';
import type { AppState, Bounty } from '@/components/types';

interface AppStateContextValue extends AppState {
  connectWallet: () => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  addBounty: (
    bounty: Omit<Bounty, 'id' | 'createdAt' | 'answers'>,
  ) => string;
  addAnswer: (bountyId: string, content: string) => void;
  selectWinner: (bountyId: string, answerId: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

const generateId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AppState>({
    isWalletConnected: false,
    userWallet: null,
    bounties: mockBounties,
    showConnectModal: false,
  });

  const connectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isWalletConnected: true,
      userWallet: '0x4F7c...7B9A',
      showConnectModal: false,
    }));
  }, []);

  const openConnectModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConnectModal: true,
    }));
  }, []);

  const closeConnectModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConnectModal: false,
    }));
  }, []);

  const addBounty = useCallback<
    AppStateContextValue['addBounty']
  >((bountyInput) => {
    const id = generateId();
    const newBounty: Bounty = {
      ...bountyInput,
      id,
      createdAt: new Date(),
      answers: [],
    };

    setState((prev) => ({
      ...prev,
      bounties: [newBounty, ...prev.bounties],
    }));

    return id;
  }, []);

  const addAnswer = useCallback<
    AppStateContextValue['addAnswer']
  >((bountyId, content) => {
    const answerId = generateId();

    setState((prev) => ({
      ...prev,
      bounties: prev.bounties.map((bounty) =>
        bounty.id === bountyId
          ? {
              ...bounty,
              answers: [
                ...bounty.answers,
                {
                  id: answerId,
                  content,
                  responderWallet: prev.userWallet ?? '0x0000...0000',
                  timestamp: new Date(),
                },
              ],
            }
          : bounty,
      ),
    }));
  }, []);

  const selectWinner = useCallback<
    AppStateContextValue['selectWinner']
  >((bountyId, answerId) => {
    setState((prev) => ({
      ...prev,
      bounties: prev.bounties.map((bounty) =>
        bounty.id === bountyId
          ? {
              ...bounty,
              status: 'completed',
              timeLeft: 'Completed',
              answers: bounty.answers.map((answer) => ({
                ...answer,
                isWinner: answer.id === answerId,
              })),
            }
          : bounty,
      ),
    }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      connectWallet,
      openConnectModal,
      closeConnectModal,
      addBounty,
      addAnswer,
      selectWinner,
    }),
    [
      state,
      connectWallet,
      openConnectModal,
      closeConnectModal,
      addBounty,
      addAnswer,
      selectWinner,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
