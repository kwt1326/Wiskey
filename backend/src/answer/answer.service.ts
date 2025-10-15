import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UserService } from '../user/user.service';
import { Bounty } from '../bounty/bounty.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateAnswerDto) {
    const user = await this.userService.findOrCreate({
      walletAddress: dto.walletAddress,
    });
    const bounty = await this.bountyRepository.findOneBy({ id: dto.bountyId });

    if (!bounty) throw new Error('Bounty not found');

    const answer = this.answerRepository.create({
      content: dto.content,
      author: user,
      bounty,
    });

    return this.answerRepository.save(answer);
  }
}
