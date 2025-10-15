import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { BountyModule } from './bounty/bounty.module';
import { AnswerModule } from './answer/answer.module';
import { BountyWinnerModule } from './bounty-winner/bounty-winner.module';
import { WalletAuthMiddleware } from './common/wallet.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UserModule,
    BountyModule,
    AnswerModule,
    BountyWinnerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WalletAuthMiddleware).forRoutes('*');
  }
}
