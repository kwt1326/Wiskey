import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Bounties')
@Controller('bounties')
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @Post()
  async create(@Body() dto: CreateBountyDto) {
    return this.bountyService.create(dto);
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
  async myBounties(@Query('wallet') wallet: string) {
    return this.bountyService.getMyBounties(wallet);
  }

  @Get('answered/list')
  async answeredBounties(@Query('wallet') wallet: string) {
    return this.bountyService.getAnsweredBounties(wallet);
  }
}
