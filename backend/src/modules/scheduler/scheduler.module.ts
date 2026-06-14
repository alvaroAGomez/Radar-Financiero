import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DolarModule } from '../dolar/dolar.module';
import { CryptoModule } from '../crypto/crypto.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [DolarModule, CryptoModule, MarketModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
