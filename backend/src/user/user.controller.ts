import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { AuthenticatedRequest } from '../common/types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('connect')
  connectWallet(@Body() dto: CreateUserDto) {
    return this.userService.findOrCreate(dto);
  }

  @Get('me')
  getMyInfo(@Req() req: AuthenticatedRequest) {
    return this.userService.getProfile(req.user.walletAddress);
  }
}
