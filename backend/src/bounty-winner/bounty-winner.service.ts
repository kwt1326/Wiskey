import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BountyWinner } from './bounty-winner.entity';
import { Bounty } from '../bounty/bounty.entity';
import { Answer } from '../answer/answer.entity';
import { SelectWinnerDto } from './dto/select-winner.dto';
import { VaultService } from 'src/blockchain/vault.service';
import { BountyStatus, AnswerStatus } from '../common/types';

@Injectable()
export class BountyWinnerService {
  constructor(
    @InjectRepository(BountyWinner)
    private readonly winnerRepository: Repository<BountyWinner>,
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async selectWinner(dto: SelectWinnerDto) {
    const bounty = await this.bountyRepository.findOneBy({ id: dto.bountyId });
    const answer = await this.answerRepository.findOne({
      where: { id: dto.answerId },
      relations: ['author'],
    });

    if (!bounty || !answer) throw new Error('Invalid bounty or answer');
    if (bounty.status === BountyStatus.COMPLETED) {
      throw new Error('Bounty is already completed');
    }

    const exists = await this.winnerRepository.findOne({
      where: { bounty: { id: bounty.id } },
    });
    if (exists) throw new Error('Winner already selected for this bounty');

    // Check if bounty has vault ID for contract distribution
    if (!bounty.vaultBountyId) {
      throw new Error('Bounty vault ID missing – cannot distribute reward.');
    }

    try {
      // Call contract distribute function (9:1 ratio - 90% to winner, 10% to operation wallet)
      const receipt = await VaultService.distributeReward(
        bounty.vaultBountyId,
        answer.author.walletAddress,
      );

      // Create winner record
      const winner = this.winnerRepository.create({
        bounty,
        answer,
        rewardPaid: true,
        txHash: receipt.transactionHash,
      });

      // Update bounty status to completed
      bounty.status = BountyStatus.COMPLETED;
      await this.bountyRepository.save(bounty);

      // Update answer status to winner
      answer.status = AnswerStatus.WINNER;
      await this.answerRepository.save(answer);

      // Save winner record
      const savedWinner = await this.winnerRepository.save(winner);

      return {
        winner: savedWinner,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (err) {
      throw new Error(
        `Failed to distribute reward and select winner: ${err.message}`,
      );
    }
  }
}
