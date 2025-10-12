import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UserService } from '../user/user.service';
import { Bounty, BountyStatus } from '../bounty/bounty.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    private userService: UserService,
  ) {}

  async create(
    createAnswerDto: CreateAnswerDto,
    walletAddress: string,
  ): Promise<Answer> {
    const user = await this.userService.findOrCreate(walletAddress);

    // Check if bounty exists and is open
    const bounty = (await this.getBountyRepository().findOne({
      where: { id: createAnswerDto.bountyId },
      relations: ['answers'],
    })) as Bounty;

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    if (bounty.status !== BountyStatus.OPEN) {
      throw new BadRequestException('Bounty is not open for answers');
    }

    if (bounty.poster.id === user.id) {
      throw new BadRequestException('Cannot answer your own bounty');
    }

    // Check if user already answered this bounty
    const existingAnswer = bounty.answers.find(
      (a) => a.responder.id === user.id,
    );
    if (existingAnswer) {
      throw new BadRequestException('You have already answered this bounty');
    }

    const answer = this.answerRepository.create({
      ...createAnswerDto,
      responder: user,
    });

    const savedAnswer = await this.answerRepository.save(answer);

    // Update user stats
    await this.userService.updateStats(user.id, { totalAnswersGiven: 1 });

    return this.findOne(savedAnswer.id);
  }

  findAll(): Promise<Answer[]> {
    return this.answerRepository.find({
      relations: ['responder', 'bounty'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id },
      relations: ['responder', 'bounty'],
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return answer;
  }

  findByBounty(bounty: Bounty): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { bounty },
      relations: ['responder'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByUser(walletAddress: string): Promise<Answer[]> {
    const user = await this.userService.findByWalletAddress(walletAddress);

    return this.answerRepository.find({
      where: { responder: user },
      relations: ['responder', 'bounty'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    content: string,
    walletAddress: string,
  ): Promise<Answer> {
    const answer = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (answer.responder.id !== user.id) {
      throw new ForbiddenException('You can only update your own answers');
    }

    if (answer.bounty.status !== BountyStatus.OPEN) {
      throw new BadRequestException(
        'Cannot update answers for closed bounties',
      );
    }

    if (answer.isWinner) {
      throw new BadRequestException('Cannot update winning answers');
    }

    answer.content = content;
    return this.answerRepository.save(answer);
  }

  async remove(id: string, walletAddress: string): Promise<void> {
    const answer = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (answer.responder.id !== user.id) {
      throw new ForbiddenException('You can only delete your own answers');
    }

    if (answer.isWinner) {
      throw new BadRequestException('Cannot delete winning answers');
    }

    await this.answerRepository.remove(answer);
  }

  async upvote(id: string, walletAddress: string): Promise<Answer> {
    const answer = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (answer.responder.id === user.id) {
      throw new BadRequestException('Cannot vote on your own answer');
    }

    answer.upvotes += 1;
    return this.answerRepository.save(answer);
  }

  async downvote(id: string, walletAddress: string): Promise<Answer> {
    const answer = await this.findOne(id);
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (answer.responder.id === user.id) {
      throw new BadRequestException('Cannot vote on your own answer');
    }

    answer.downvotes += 1;
    return this.answerRepository.save(answer);
  }

  // Helper method to access bounty repository
  private getBountyRepository() {
    // This would typically be injected, but for simplicity we'll use a workaround
    // In a real implementation, you'd inject the BountyRepository directly
    return this.answerRepository.manager.getRepository('bounties');
  }
}
