// Utility functions to transform API data for component use
import { Bounty as ApiBounty, Answer as ApiAnswer } from '@/lib/types/api';

export function formatTimeLeft(expiresAt: string | null): string {
  if (!expiresAt) return 'No deadline';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) return `${diffDays}d left`;
  if (diffHours > 0) return `${diffHours}h left`;
  return 'Less than 1h left';
}

export function formatTimestamp(dateString: string): Date {
  return new Date(dateString);
}

export function getBountyStatus(bounty: ApiBounty): 'open' | 'completed' {
  // Check if there's a winner selected
  const hasWinner = bounty.answers?.some(_ => 
    // This would need to be determined by checking if there's a BountyWinner record
    // For now, we'll assume open unless explicitly marked
    false
  );
  
  // Check if expired
  if (bounty.expiresAt) {
    const now = new Date();
    const expiry = new Date(bounty.expiresAt);
    if (now > expiry) return 'completed';
  }
  
  return hasWinner ? 'completed' : 'open';
}

export function transformBountyForComponent(bounty: ApiBounty) {
  return {
    ...bounty,
    status: getBountyStatus(bounty),
    timeLeft: formatTimeLeft(bounty.expiresAt),
    reward: parseFloat(bounty.rewardEth),
    postedBy: bounty.creator.walletAddress,
    description: bounty.content,
    answers: bounty.answers?.map(transformAnswerForComponent) || []
  };
}

export function transformAnswerForComponent(answer: ApiAnswer) {
  return {
    ...answer,
    responderWallet: answer.author.walletAddress,
    timestamp: formatTimestamp(answer.createdAt),
    // Winner status would need to be determined from BountyWinner records
    isWinner: false // This would need proper logic based on winner selection
  };
}