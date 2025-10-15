import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BountyWinner } from './bounty-winner.entity';
import { Bounty } from '../bounty/bounty.entity';
import { Answer } from '../answer/answer.entity';
import { SelectWinnerDto } from './dto/select-winner.dto';
import { VaultService } from 'src/blockchain/vault.service';

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
    const answer = await this.answerRepository.findOneBy({ id: dto.answerId });

    if (!bounty || !answer) throw new Error('Invalid bounty or answer');

    const exists = await this.winnerRepository.findOne({
      where: { bounty: { id: bounty.id } },
    });
    if (exists) throw new Error('Winner already selected for this bounty');

    const winner = this.winnerRepository.create({
      bounty,
      answer,
      rewardPaid: false,
    });

    return this.winnerRepository.save(winner);
  }

  async payReward(winnerId: number) {
    const winner = await this.winnerRepository.findOne({
      where: { id: winnerId },
      relations: ['bounty', 'answer', 'answer.author'],
    });
    if (!winner) throw new Error('Winner not found');
    if (winner.rewardPaid) throw new Error('Reward already paid');

    const bounty = winner.bounty;
    if (!bounty.vaultBountyId)
      throw new Error('Bounty vault ID missing – cannot distribute reward.');

    const toAddress = winner.answer.author.walletAddress;

    try {
      const receipt = await VaultService.distributeReward(
        parseInt(bounty.vaultBountyId),
        toAddress,
      );

      winner.rewardPaid = true;
      winner.txHash = receipt.transactionHash;
      await this.winnerRepository.save(winner);

      return {
        status: 'success',
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (err) {
      throw new Error(`Vault reward distribution failed: ${err.message}`);
    }
  }
}
