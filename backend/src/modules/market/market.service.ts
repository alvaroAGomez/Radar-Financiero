import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IolApiProvider } from './providers/iol-api.provider';
import { MarketScraperProvider } from './providers/market-scraper.provider';
import { MarketSummaryDto } from './dto/market-summary.dto';
import { CaucionRateDto } from './dto/caucion-rate.dto';
import { CACHE_KEYS } from '../../common/constants/api-endpoints.constant';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly iolApiProvider: IolApiProvider,
    private readonly marketScraperProvider: MarketScraperProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getSummary(): Promise<MarketSummaryDto> {
    const cached = await this.cacheManager.get<MarketSummaryDto>(CACHE_KEYS.MARKET_Movers);
    if (cached) {
      return cached;
    }

    this.logger.log('Cache empty for market summary, executing immediate sync...');
    await this.updateCache();
    return (await this.cacheManager.get<MarketSummaryDto>(CACHE_KEYS.MARKET_Movers))!;
  }

  async getCauciones(): Promise<CaucionRateDto[]> {
    const cached = await this.cacheManager.get<CaucionRateDto[]>(CACHE_KEYS.CAUCION_RATES);
    if (cached) {
      return cached;
    }

    this.logger.log('Cache empty for cauciones rates, executing immediate sync...');
    await this.updateCache();
    return (await this.cacheManager.get<CaucionRateDto[]>(CACHE_KEYS.CAUCION_RATES))!;
  }

  async updateCache(): Promise<void> {
    const nowStr = new Date().toISOString();

    // 1. Update CEDEARs / Stock Movers
    try {
      this.logger.log('Updating stock movers cache...');
      const movers = await this.iolApiProvider.fetchMovers();
      
      const summaryDto: MarketSummaryDto = {
        gainers: movers.gainers,
        losers: movers.losers,
        etfs: movers.etfs,
        lastUpdated: nowStr,
      };

      await this.cacheManager.set(CACHE_KEYS.MARKET_Movers, summaryDto);
      this.logger.log('Successfully updated stock movers cache');
    } catch (error) {
      this.logger.error(`Failed to update stock movers cache: ${error.message}`);
    }

    // 2. Update Cauciones Rates
    try {
      this.logger.log('Updating cauciones rates cache...');
      const rates = await this.marketScraperProvider.fetchCaucionRates();
      await this.cacheManager.set(CACHE_KEYS.CAUCION_RATES, rates);
      this.logger.log('Successfully updated cauciones rates cache');
    } catch (error) {
      this.logger.error(`Failed to update cauciones rates cache: ${error.message}`);
    }
  }
}
