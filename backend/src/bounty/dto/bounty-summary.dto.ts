import { ApiProperty } from '@nestjs/swagger';

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
}
