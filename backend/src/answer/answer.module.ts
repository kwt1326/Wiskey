import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { Answer } from './answer.entity';
import { UserModule } from '../user/user.module';
import { Bounty } from 'src/bounty/bounty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Bounty]), UserModule],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
