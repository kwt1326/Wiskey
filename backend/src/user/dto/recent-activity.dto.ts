export enum ActivityType {
  BOUNTY = 'BOUNTY',
  ANSWER = 'ANSWER',
  WIN = 'WIN',
}

export class RecentActivityDto {
  type: ActivityType;
  title?: string;
  content?: string;
  rewardEth?: string;
  createdAt: Date;
}
