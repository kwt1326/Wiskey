import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bounty } from './bounty.entity';
import { UserService } from '../user/user.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { BountySummaryDto } from './dto/bounty-summary.dto';
import { User } from '../user/user.entity';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    private readonly userService: UserService,
  ) {}

  /** 바운티 생성 */
  create(dto: CreateBountyDto, user: User) {
    const bounty = this.bountyRepository.create({
      title: dto.title,
      content: dto.content,
      rewardEth: dto.rewardEth.toString(),
      rewardTxHash: dto.rewardTxHash, // 프론트가 전달
      vaultBountyId: dto.vaultBountyId, // 프론트가 Vault에서 받은 bountyId
      creator: user,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return this.bountyRepository.save(bounty);
  }

  /** 바운티 목록 (필터) */
  async list(sort: 'latest' | 'views' | 'reward' | 'answers') {
    const qb = this.bountyRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.creator', 'creator')
      .loadRelationCountAndMap('b.answerCount', 'b.answers')
      .loadRelationCountAndMap('b.winnerCount', 'b.winners');

    if (sort === 'latest') qb.orderBy('b.createdAt', 'DESC');
    else if (sort === 'views') qb.orderBy('b.views', 'DESC');
    else if (sort === 'reward') qb.orderBy('b.rewardEth', 'DESC');
    else if (sort === 'answers') {
      // For sorting by answer count, we need to handle it differently
      qb.leftJoin('b.answers', 'a')
        .addSelect('COUNT(a.id)', 'answerCount')
        .groupBy('b.id')
        .addGroupBy('creator.id')
        .orderBy('COUNT(a.id)', 'ASC');
    }

    const results = await qb.getMany();
    return results.map((b) => this.toSummaryDto(b));
  }

  /** 바운티 상세 (조회수 증가 포함) */
  async getDetail(id: number) {
    const bounty = await this.bountyRepository.findOne({
      where: { id },
      relations: ['creator', 'answers', 'answers.author'],
    });

    if (!bounty) throw new Error('Bounty not found');

    // 조회수 증가
    bounty.views += 1;
    await this.bountyRepository.save(bounty);

    return {
      ...bounty,
      remainingTime: this.calculateRemaining(bounty.expiresAt),
    };
  }

  /** 내가 생성한 바운티 */
  async getMyBounties(wallet: string): Promise<BountySummaryDto[]> {
    const user = await this.userService.findOrCreate({
      walletAddress: wallet,
    });
    const bounties = await this.bountyRepository.find({
      where: { creator: { id: user.id } },
      relations: ['answers'],
      order: { createdAt: 'DESC' },
    });

    return bounties.map((b) => this.toSummaryDto(b));
  }

  /** 내가 답변한 바운티 */
  async getAnsweredBounties(wallet: string): Promise<BountySummaryDto[]> {
    const user = await this.userService.findOrCreate({
      walletAddress: wallet,
    });

    const qb = this.bountyRepository
      .createQueryBuilder('b')
      .innerJoin('b.answers', 'a')
      .innerJoin('a.author', 'u')
      .leftJoinAndSelect('b.creator', 'creator')
      .where('u.walletAddress = :wallet', { wallet })
      .loadRelationCountAndMap('b.answerCount', 'b.answers')
      .loadRelationCountAndMap('b.winnerCount', 'b.winners')
      .orderBy('b.createdAt', 'DESC');

    const results = await qb.getMany();
    return results.map((b) => this.toSummaryDto(b));
  }

  /** Helper: 바운티 DTO 변환 */
  private toSummaryDto(b: Bounty): BountySummaryDto {
    const remainingTime = this.calculateRemaining(b.expiresAt);

    return {
      id: b.id,
      title: b.title,
      content: b.content,
      rewardEth: b.rewardEth,
      views: b.views,
      answerCount: (b as any).answerCount ?? b.answers?.length ?? 0,
      winnerCount: (b as any).winnerCount ?? 0,
      totalRewardEth: b.rewardEth.toString(),
      remainingTime,
      createdAt: b.createdAt,
      status: b.status,
    };
  }

  private calculateRemaining(expiresAt: Date | null): string {
    if (!expiresAt) return '만료일 없음';
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return '만료됨';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days}일 남음` : `${hours}시간 남음`;
  }
}
