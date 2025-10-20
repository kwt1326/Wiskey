import { ApiProperty } from '@nestjs/swagger';
import { BountyStatus } from '../../common/types';

export class BountySummaryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  rewardEth: string;

  @ApiProperty()
  answerCount: number;

  @ApiProperty()
  winnerCount: number;

  @ApiProperty()
  totalRewardEth: string;

  @ApiProperty()
  remainingTime: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  expiresAt: Date | null;

  @ApiProperty({ enum: BountyStatus })
  status: BountyStatus;

  @ApiProperty()
  vaultBountyId: string;
}
