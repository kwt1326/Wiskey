import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bounty, BountyStatus } from './bounty.entity';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { UserService } from '../user/user.service';

export type SortType = 'newest' | 'popular' | 'high-reward' | 'few-answers';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(Bounty)
    private bountyRepository: Repository<Bounty>,
    private userService: UserService,
  ) {}

  async create(
    createBountyDto: CreateBountyDto,
    walletAddress: string,
  ): Promise<Bounty> {
    const user = await this.userService.findOrCreate(walletAddress);

    const bounty = this.bountyRepository.create({
      ...createBountyDto,
      poster: user,
      expiresAt: createBountyDto.expiresAt
        ? new Date(createBountyDto.expiresAt)
        : undefined,
    });

    const savedBounty = await this.bountyRepository.save(bounty);

    // Update user stats
    await this.userService.updateStats(user.id, { totalBountiesPosted: 1 });

    return this.findOne(savedBounty.id);
  }

  async findAll(
    sortBy: SortType = 'newest',
    status?: BountyStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bounties: Bounty[]; total: number }> {
    const queryBuilder = this.bountyRepository
      .createQueryBuilder('bounty')
      .leftJoinAndSelect('bounty.poster', 'poster')
      .leftJoinAndSelect('bounty.answers', 'answers')
      .leftJoinAndSelect('answers.responder', 'responder')
      .leftJoinAndSelect('bounty.winningAnswer', 'winningAnswer');

    if (status) {
      queryBuilder.where('bounty.status = :status', { status });
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder.orderBy('bounty.createdAt', 'DESC');
        break;
      case 'popular':
        queryBuilder
          .addSelect('COUNT(answers.id)', 'answerCount')
          .groupBy('bounty.id')
          .addGroupBy('poster.id')
          .addGroupBy('answers.id')
          .addGroupBy('responder.id')
          .addGroupBy('winningAnswer.id')
          .orderBy('answerCount', 'DESC')
          .addOrderBy('bounty.createdAt', 'DESC');
        break;
      case 'high-reward':
        queryBuilder.orderBy('bounty.reward', 'DESC');
        break;
      case 'few-answers':
        queryBuilder
          .addSelect('COUNT(answers.id)', 'answerCount')
          .groupBy('bounty.id')
          .addGroupBy('poster.id')
          .addGroupBy('answers.id')
          .addGroupBy('responder.id')
          .addGroupBy('winningAnswer.id')
          .orderBy('answerCount', 'ASC')
          .addOrderBy('bounty.createdAt', 'DESC');
        break;
    }

    const [bounties, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bounties, total };
  }

  async findOne(id: string): Promise<Bounty> {
    const bounty = await this.bountyRepository.findOne({
      where: { id },
      relations: ['poster', 'answers', 'answers.responder', 'winningAnswer'],
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    // Increment view count
    await this.bountyRepository.update(id, { viewCount: bounty.viewCount + 1 });
    bounty.viewCount += 1;

    return bounty;
  }

  async findByUser(walletAddress: string): Promise<Bounty[]> {
    const user = await this.userService.findByWalletAddress(walletAddress);

    return this.bountyRepository.find({
      where: { poster: user },
      relations: ['poster', 'answers', 'answers.responder', 'winningAnswer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAnsweredByUser(walletAddress: string): Promise<Bounty[]> {
    const user = await this.userService.findByWalletAddress(walletAddress);

    return this.bountyRepository
      .createQueryBuilder('bounty')
      .leftJoinAndSelect('bounty.poster', 'poster')
      .leftJoinAndSelect('bounty.answers', 'answers')
      .leftJoinAndSelect('answers.responder', 'responder')
      .leftJoinAndSelect('bounty.winningAnswer', 'winningAnswer')
      .where('answers.responderId = :userId', { userId: user.id })
      .orderBy('bounty.createdAt', 'DESC')
      .getMany();
  }

  async update(
    id: string,
    updateBountyDto: UpdateBountyDto,
    walletAddress: string,
  ): Promise<Bounty> {
    const bounty = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (bounty.poster.id !== user.id) {
      throw new ForbiddenException('You can only update your own bounties');
    }

    if (bounty.status === BountyStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed bounties');
    }

    Object.assign(bounty, {
      ...updateBountyDto,
      expiresAt: updateBountyDto.expiresAt
        ? new Date(updateBountyDto.expiresAt)
        : bounty.expiresAt,
    });

    return this.bountyRepository.save(bounty);
  }

  async remove(id: string, walletAddress: string): Promise<void> {
    const bounty = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (bounty.poster.id !== user.id) {
      throw new ForbiddenException('You can only delete your own bounties');
    }

    if (bounty.answers.length > 0) {
      throw new BadRequestException('Cannot delete bounties with answers');
    }

    await this.bountyRepository.remove(bounty);
  }

  async selectWinner(
    bountyId: string,
    answerId: string,
    walletAddress: string,
  ): Promise<Bounty> {
    const bounty = await this.findOne(bountyId);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (bounty.poster.id !== user.id) {
      throw new ForbiddenException(
        'Only the bounty poster can select a winner',
      );
    }

    if (bounty.status !== BountyStatus.OPEN) {
      throw new BadRequestException('Bounty is not open');
    }

    const answer = bounty.answers.find((a) => a.id === answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found for this bounty');
    }

    // Update bounty
    bounty.status = BountyStatus.COMPLETED;

    if (bounty.winningAnswer) {
      bounty.winningAnswer.id = answerId;
    }

    // Update answer
    answer.isWinner = true;

    await this.bountyRepository.save(bounty);

    // Update winner's stats
    await this.userService.updateStats(answer.responder.id, {
      totalRewardsEarned: bounty.reward,
      totalWinningAnswers: 1,
    });

    return this.findOne(bountyId);
  }

  async searchBounties(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bounties: Bounty[]; total: number }> {
    const [bounties, total] = await this.bountyRepository
      .createQueryBuilder('bounty')
      .leftJoinAndSelect('bounty.poster', 'poster')
      .leftJoinAndSelect('bounty.answers', 'answers')
      .leftJoinAndSelect('answers.responder', 'responder')
      .leftJoinAndSelect('bounty.winningAnswer', 'winningAnswer')
      .where('bounty.title ILIKE :query OR bounty.description ILIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('bounty.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bounties, total };
  }
}
