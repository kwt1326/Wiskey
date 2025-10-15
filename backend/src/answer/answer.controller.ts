import { Controller, Post, Body } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(@Body() dto: CreateAnswerDto) {
    return this.answerService.create(dto);
  }
}
