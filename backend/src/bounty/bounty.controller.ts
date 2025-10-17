import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Req,
  Logger,
} from '@nestjs/common';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../common/types';

@ApiTags('Bounties')
@Controller('bounties')
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @Post()
  create(@Body() dto: CreateBountyDto, @Req() req: AuthenticatedRequest) {
    return this.bountyService.create(dto, req.user);
  }

  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['latest', 'views', 'reward', 'answers'],
  })
  @Get()
  async list(
    @Query('sort') sort: 'latest' | 'views' | 'reward' | 'answers' = 'latest',
  ) {
    return this.bountyService.list(sort);
  }

  @Get(':id')
  async detail(@Param('id') id: number) {
    return this.bountyService.getDetail(id);
  }

  @Get('mine/list')
  async myBounties(@Req() req: AuthenticatedRequest) {
    return this.bountyService.getMyBounties(req.user.walletAddress);
  }

  @Get('answered/list')
  async answeredBounties(@Req() req: AuthenticatedRequest) {
    return this.bountyService.getAnsweredBounties(req.user.walletAddress);
  }
}
