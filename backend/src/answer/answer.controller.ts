import { Controller, Post, Body, Req } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import type { AuthenticatedRequest } from '../common/types';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(@Body() dto: CreateAnswerDto, @Req() req: AuthenticatedRequest) {
    return this.answerService.create(dto, req.user);
  }
}
