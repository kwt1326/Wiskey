import { IsNumber } from 'class-validator';

export class SelectWinnerDto {
  @IsNumber()
  bountyId: number;

  @IsNumber()
  answerId: number;
}
