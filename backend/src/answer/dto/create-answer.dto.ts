import { IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  content: string;

  @IsUUID()
  bountyId: string;
}
