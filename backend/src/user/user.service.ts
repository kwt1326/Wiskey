import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreate(dto: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { walletAddress: dto.walletAddress },
    });
    if (!user) {
      user = this.userRepository.create(dto);
      await this.userRepository.save(user);
    }
    return user;
  }

  getProfile(wallet: string) {
    return this.userRepository.findOne({
      where: { walletAddress: wallet },
      relations: ['bounties', 'answers'],
    });
  }
}
