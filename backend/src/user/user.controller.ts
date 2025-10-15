import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('connect')
  connectWallet(@Body() dto: CreateUserDto) {
    return this.userService.findOrCreate(dto);
  }

  @Get('me')
  getMyInfo(@Query('wallet') wallet: string) {
    return this.userService.getProfile(wallet);
  }
}
