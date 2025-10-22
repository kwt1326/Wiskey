import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyWinnerService } from './bounty-winner.service';
import { BountyWinnerController } from './bounty-winner.controller';
import { BountyWinner } from './bounty-winner.entity';
import { Bounty } from 'src/bounty/bounty.entity';
import { Answer } from 'src/answer/answer.entity';
import { VaultService } from 'src/blockchain/vault.service';
import { VaultLoggerService } from 'src/blockchain/vault-logger.service';
import { NonceManagerService } from 'src/blockchain/nonce-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([BountyWinner, Bounty, Answer])],
  controllers: [BountyWinnerController],
  providers: [
    BountyWinnerService,
    VaultService,
    VaultLoggerService,
    NonceManagerService,
  ],
  exports: [BountyWinnerService],
})
export class BountyWinnerModule {}
