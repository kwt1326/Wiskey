import type { Bounty } from "./types";

export const mockBounties: Bounty[] = [
  {
    id: "1",
    title: "How to automate NFT minting?",
    description:
      "Looking for a detailed guide on automating NFT minting process using smart contracts. Need code examples and best practices.",
    reward: 0.02,
    status: "open",
    timeLeft: "3d 12h",
    postedBy: "0x1234...5678",
    answers: [
      {
        id: "1",
        content:
          "You can use OpenZeppelin contracts with a custom minting function...",
        responderWallet: "0xabcd...efgh",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Best DeFi yield farming strategies?",
    description:
      "What are the current best yield farming strategies with low risk? Looking for detailed analysis.",
    reward: 0.05,
    status: "open",
    timeLeft: "1d 8h",
    postedBy: "0x9876...4321",
    answers: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "How to integrate Base network?",
    description:
      "Need help integrating Base network into my existing dApp. What are the key considerations?",
    reward: 0.03,
    status: "completed",
    timeLeft: "Completed",
    postedBy: "0x5555...7777",
    answers: [
      {
        id: "2",
        content:
          "Base integration is straightforward. First, you need to update your network configuration...",
        responderWallet: "0x2222...8888",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isWinner: true,
      },
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];
