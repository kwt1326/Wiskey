import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  getProfile(@Headers('x-wallet-address') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.userService.findByWalletAddress(walletAddress);
  }

  @Get('wallet/:walletAddress')
  findByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return this.userService.findByWalletAddress(walletAddress);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('profile')
  updateProfile(
    @Headers('x-wallet-address') walletAddress: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.userService.updateByWalletAddress(walletAddress, updateUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('connect')
  connectWallet(@Body('walletAddress') walletAddress: string) {
    return this.userService.findOrCreate(walletAddress);
  }
}
