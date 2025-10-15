import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { BountyWinnerService } from './bounty-winner.service';
import { SelectWinnerDto } from './dto/select-winner.dto';

@Controller('winners')
export class BountyWinnerController {
  constructor(private readonly winnerService: BountyWinnerService) {}

  @Post('select')
  selectWinner(@Body() dto: SelectWinnerDto) {
    return this.winnerService.selectWinner(dto);
  }

  @Patch(':id/reward')
  payReward(@Param('id') id: number) {
    return this.winnerService.payReward(id);
  }
}
