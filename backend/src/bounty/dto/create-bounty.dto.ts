import { IsString } from 'class-validator';

export class CreateBountyDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  rewardTxHash: string;

  @IsString()
  vaultBountyId: string;

  @IsString()
  rewardEth: string;
}
