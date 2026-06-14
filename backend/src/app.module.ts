import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { DolarModule } from './modules/dolar/dolar.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { MarketModule } from './modules/market/market.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ConfigPublicModule } from './modules/config-public/config-public.module';

@Module({
  imports: [
    // Global configurations
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 120000, // 2 minutes default cache
      max: 100,    // max items
    }),
    ScheduleModule.forRoot(),

    // Feature modules
    DolarModule,
    CryptoModule,
    MarketModule,
    SchedulerModule,
    ConfigPublicModule,
  ],
})
export class AppModule {}
