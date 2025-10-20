import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletAuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  // Define routes that require wallet authentication and user object
  private readonly authenticatedRoutes = [
    'POST /api/bounties',
    'GET /api/bounties/mine/list',
    'GET /api/bounties/answered/list',
    'GET /api/user/me',
    'POST /api/answers',
    'GET /api/mypage/stats',
    'GET /api/mypage/activities',
    'POST /api/winners/select',
    'PATCH /api/winners',
  ];

  private requiresAuthentication(method: string, path: string): boolean {
    const route = `${method} ${path}`;
    return this.authenticatedRoutes.some((authRoute) => {
      // Handle PATCH /winners routes with dynamic IDs
      if (
        authRoute === 'PATCH /api/winners' &&
        route.startsWith('PATCH /api/winners/')
      ) {
        return true;
      }
      // Exact match for other routes
      return route === authRoute;
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Use req.originalUrl or req.url instead of req.path to get the full URL
    const fullPath = req.originalUrl || req.url;

    // Skip authentication for /api/user/connect
    if (fullPath === '/api/user/connect' && req.method === 'POST') {
      return next();
    }

    // Check if this route requires authentication
    const requiresAuth = this.requiresAuthentication(req.method, fullPath);

    if (!requiresAuth) {
      return next();
    }

    // For authenticated routes, require wallet address
    const wallet =
      req.headers['wallet-address'] || req.headers['x-wallet-address'];

    if (!wallet || typeof wallet !== 'string') {
      throw new UnauthorizedException('Missing wallet address in header');
    }

    try {
      // 유저 자동 등록 or 조회
      const user = await this.userService.findOrCreate({
        walletAddress: wallet.toLowerCase(),
      });

      if (!user) {
        throw new UnauthorizedException('Failed to authenticate user');
      }

      // 요청 객체에 유저 주입
      (req as any).user = user;
      next();
    } catch (error) {
      Logger.error('Error in wallet middleware:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
