import { Controller, Get, Query } from '@nestjs/common';
import { MyPageService } from './mypage.service';

@Controller('mypage')
export class MyPageController {
  constructor(private readonly myPageService: MyPageService) {}

  @Get('stats')
  async getStats(@Query('wallet') wallet: string) {
    return this.myPageService.getStats(wallet);
  }

  @Get('activities')
  async getRecentActivities(@Query('wallet') wallet: string) {
    return this.myPageService.getRecentActivities(wallet);
  }
}
