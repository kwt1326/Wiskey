import { Controller, Get, Req } from '@nestjs/common';
import { MyPageService } from './mypage.service';
import type { AuthenticatedRequest } from '../common/types';

@Controller('mypage')
export class MyPageController {
  constructor(private readonly myPageService: MyPageService) {}

  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.myPageService.getStats(req.user.walletAddress);
  }

  @Get('activities')
  async getRecentActivities(@Req() req: AuthenticatedRequest) {
    return this.myPageService.getRecentActivities(req.user.walletAddress);
  }
}
