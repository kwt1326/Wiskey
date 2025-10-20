import { Controller, Post, Body } from '@nestjs/common';
import { BountyWinnerService } from './bounty-winner.service';
import { SelectWinnerDto } from './dto/select-winner.dto';

@Controller('winners')
export class BountyWinnerController {
  constructor(private readonly winnerService: BountyWinnerService) {}

  @Post('select')
  selectWinner(@Body() dto: SelectWinnerDto) {
    return this.winnerService.selectWinner(dto);
  }
}
