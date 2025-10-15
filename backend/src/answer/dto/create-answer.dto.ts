import { IsString, IsNumber } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  content: string;

  @IsNumber()
  bountyId: number;
}
