import { IsString, IsNumber } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  walletAddress: string;

  @IsString()
  content: string;

  @IsNumber()
  bountyId: number;
}
