import { IsString, IsNumber } from 'class-validator';

export class CreateBountyDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  rewardTxHash: string;

  @IsString()
  vaultBountyId: string;

  @IsNumber()
  rewardEth: number;
}
