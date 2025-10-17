import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { Bounty } from './bounty.entity';
import { BountyWinner } from '../bounty-winner/bounty-winner.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bounty, BountyWinner]), UserModule],
  controllers: [BountyController],
  providers: [BountyService],
  exports: [BountyService],
})
export class BountyModule {}
