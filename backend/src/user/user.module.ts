import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyPageService } from './mypage.service';
import { MyPageController } from './mypage.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Bounty } from 'src/bounty/bounty.entity';
import { Answer } from 'src/answer/answer.entity';
import { BountyWinner } from 'src/bounty-winner/bounty-winner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Bounty, Answer, BountyWinner])],
  controllers: [UserController, MyPageController],
  providers: [UserService, MyPageService],
  exports: [UserService, MyPageService],
})
export class UserModule {}
