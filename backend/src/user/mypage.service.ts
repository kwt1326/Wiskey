import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Bounty } from '../bounty/bounty.entity';
import { Answer } from '../answer/answer.entity';
import { BountyWinner } from '../bounty-winner/bounty-winner.entity';
import { MyPageStatsDto } from './dto/mypage-stats.dto';
import { ActivityType, RecentActivityDto } from './dto/recent-activity.dto';

@Injectable()
export class MyPageService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(BountyWinner)
    private readonly winnerRepository: Repository<BountyWinner>,
  ) {}

  async getStats(wallet: string): Promise<MyPageStatsDto> {
    const user = await this.userRepository.findOne({
      where: { walletAddress: wallet },
    });
    if (!user) throw new Error('User not found');

    const [bountyCount, answerCount, winCount] = await Promise.all([
      this.bountyRepository.count({ where: { creator: { id: user.id } } }),
      this.answerRepository.count({ where: { author: { id: user.id } } }),
      this.winnerRepository.count({
        where: { answer: { author: { id: user.id } } },
      }),
    ]);

    const { totalRewardEth } = await this.winnerRepository
      .createQueryBuilder('w')
      .leftJoin('w.bounty', 'b')
      .leftJoin('w.answer', 'a')
      .leftJoin('a.author', 'u')
      .where('u.id = :userId', { userId: user.id })
      .select('COALESCE(SUM(b.rewardEth), 0)', 'totalRewardEth')
      .getRawOne();

    return {
      bountyCount,
      answerCount,
      totalRewardEth,
      winCount,
    };
  }

  async getRecentActivities(wallet: string): Promise<RecentActivityDto[]> {
    const user = await this.userRepository.findOne({
      where: { walletAddress: wallet },
    });
    if (!user) throw new Error('User not found');

    const bounties = await this.bountyRepository.find({
      where: { creator: { id: user.id } },
      select: ['id', 'title', 'content', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const answers = await this.answerRepository.find({
      where: { author: { id: user.id } },
      relations: ['bounty'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const wins = await this.winnerRepository.find({
      relations: ['bounty', 'answer'],
      where: { answer: { author: { id: user.id } } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const activities: RecentActivityDto[] = [
      ...bounties.map((b) => ({
        type: ActivityType.BOUNTY,
        title: b.title,
        content: b.content,
        createdAt: b.createdAt,
        status: b.status,
      })),
      ...answers.map((a) => ({
        type: ActivityType.ANSWER,
        title: a.bounty.title,
        content: a.content,
        createdAt: a.createdAt,
        status: a.status,
      })),
      ...wins.map((w) => ({
        type: ActivityType.WIN,
        title: w.bounty.title,
        rewardEth: w.bounty.rewardEth.toString(),
        createdAt: w.createdAt,
        status: 'WINNER',
      })),
    ];

    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }
}
