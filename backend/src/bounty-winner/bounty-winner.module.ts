import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyWinnerService } from './bounty-winner.service';
import { BountyWinnerController } from './bounty-winner.controller';
import { BountyWinner } from './bounty-winner.entity';
import { Bounty } from 'src/bounty/bounty.entity';
import { Answer } from 'src/answer/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BountyWinner, Bounty, Answer]),
    BountyWinnerModule,
  ],
  controllers: [BountyWinnerController],
  providers: [BountyWinnerService],
  exports: [BountyWinnerService],
})
export class BountyWinnerModule {}
