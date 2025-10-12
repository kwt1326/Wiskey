export interface Answer {
  id: string;
  content: string;
  responderWallet: string;
  timestamp: Date;
  isWinner?: boolean;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: "open" | "completed";
  timeLeft: string;
  postedBy: string;
  answers: Answer[];
  createdAt: Date;
}

export interface AppState {
  isWalletConnected: boolean;
  userWallet: string | null;
  bounties: Bounty[];
  showConnectModal: boolean;
}
