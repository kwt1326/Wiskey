import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletAuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const wallet =
      req.headers['wallet-address'] || req.headers['x-wallet-address'];
    if (!wallet || typeof wallet !== 'string') {
      throw new UnauthorizedException('Missing wallet address in header');
    }

    // 유저 자동 등록 or 조회
    const user = await this.userService.findOrCreate({
      walletAddress: wallet.toLowerCase(),
    });

    // 요청 객체에 유저 주입
    (req as any).user = user;
    next();
  }
}
