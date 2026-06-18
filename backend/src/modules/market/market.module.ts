import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { IolApiProvider } from './providers/iol-api.provider';
import { MarketScraperProvider } from './providers/market-scraper.provider';
import { MarketHoursService } from '../../common/services/market-hours.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MarketController],
  providers: [MarketService, IolApiProvider, MarketScraperProvider, MarketHoursService],
  exports: [MarketService],
})
export class MarketModule {}

