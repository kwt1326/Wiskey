import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { walletAddress: createUserDto.walletAddress },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this wallet address already exists',
      );
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true },
      relations: ['postedBounties', 'answers'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['postedBounties', 'answers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByWalletAddress(walletAddress: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { walletAddress, isActive: true },
      relations: ['postedBounties', 'answers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOrCreate(walletAddress: string): Promise<User> {
    try {
      return await this.findByWalletAddress(walletAddress);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.create({ walletAddress });
      }
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateByWalletAddress(
    walletAddress: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findByWalletAddress(walletAddress);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async updateStats(
    userId: string,
    stats: Partial<{
      totalRewardsEarned: number;
      totalBountiesPosted: number;
      totalAnswersGiven: number;
      totalWinningAnswers: number;
    }>,
  ): Promise<User> {
    const user = await this.findOne(userId);

    if (stats.totalRewardsEarned !== undefined) {
      user.totalRewardsEarned += stats.totalRewardsEarned;
    }
    if (stats.totalBountiesPosted !== undefined) {
      user.totalBountiesPosted += stats.totalBountiesPosted;
    }
    if (stats.totalAnswersGiven !== undefined) {
      user.totalAnswersGiven += stats.totalAnswersGiven;
    }
    if (stats.totalWinningAnswers !== undefined) {
      user.totalWinningAnswers += stats.totalWinningAnswers;
    }

    return this.userRepository.save(user);
  }
}
