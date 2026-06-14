import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DolarApiProvider } from './providers/dolar-api.provider';
import { BluelyticsProvider } from './providers/bluelytics.provider';
import { DolarResponseDto } from './dto/dolar-response.dto';
import { CACHE_KEYS } from '../../common/constants/api-endpoints.constant';

@Injectable()
export class DolarService {
  private readonly logger = new Logger(DolarService.name);

  constructor(
    private readonly dolarApiProvider: DolarApiProvider,
    private readonly bluelyticsProvider: BluelyticsProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getPrices(): Promise<DolarResponseDto> {
    const cached = await this.cacheManager.get<DolarResponseDto>(CACHE_KEYS.DOLAR_PRICES);
    if (cached) {
      return cached;
    }

    // Inline update fallback if cache is empty on startup
    this.logger.log('Cache empty for dolar prices, executing immediate sync...');
    return this.updateCache();
  }

  async updateCache(): Promise<DolarResponseDto> {
    let freshData: DolarResponseDto | null = null;
    const nowStr = new Date().toISOString();

    // 1. Try DolarAPI
    try {
      this.logger.log('Fetching dolar rates from DolarAPI...');
      const rates = await this.dolarApiProvider.fetchPrices();
      
      freshData = {
        oficial: rates.oficial,
        blue: rates.blue,
        mep: rates.mep,
        ccl: rates.ccl || { compra: rates.mep.compra * 1.02, venta: rates.mep.venta * 1.02, fecha: nowStr },
        tarjeta: rates.tarjeta || { compra: rates.oficial.compra * 1.6, venta: rates.oficial.venta * 1.6, fecha: nowStr },
        lastUpdated: nowStr,
        source: 'dolarapi',
        stale: false,
      };
      
      this.logger.log('Successfully updated Dolar cache from DolarAPI');
    } catch (error) {
      this.logger.warn(`DolarAPI failed. Attempting Bluelytics fallback... Error: ${error.message}`);
      
      // 2. Fallback to Bluelytics
      try {
        const rates = await this.bluelyticsProvider.fetchPrices();
        
        // Grab last known MEP/CCL from cache to preserve them if available
        const lastCached = await this.cacheManager.get<DolarResponseDto>(CACHE_KEYS.DOLAR_PRICES);
        
        const lastMep = lastCached?.mep || { compra: rates.blue.compra * 0.98, venta: rates.blue.compra * 0.99, fecha: nowStr };
        const lastCcl = lastCached?.ccl || { compra: lastMep.compra * 1.02, venta: lastMep.venta * 1.02, fecha: nowStr };
        const lastTarjeta = lastCached?.tarjeta || { compra: rates.oficial.compra * 1.6, venta: rates.oficial.venta * 1.6, fecha: nowStr };
 
        freshData = {
          oficial: rates.oficial,
          blue: rates.blue,
          mep: lastMep,
          ccl: lastCcl,
          tarjeta: lastTarjeta,
          lastUpdated: nowStr,
          source: 'bluelytics',
          stale: true,
        };
        
        this.logger.warn('Successfully updated Dolar cache using Bluelytics (stale: true)');
      } catch (fallbackError) {
        this.logger.error(`Bluelytics fallback also failed! Error: ${fallbackError.message}`);
        
        // 3. Fallback to last cache or extreme hardcoded backup
        const lastCached = await this.cacheManager.get<DolarResponseDto>(CACHE_KEYS.DOLAR_PRICES);
        if (lastCached) {
          freshData = {
            ...lastCached,
            stale: true,
            source: 'cache_backup',
          };
          this.logger.warn('Using stale cached data as absolute fallback.');
        } else {
          // Worst case: mock hardcoded data to keep the backend from crashing (resilience)
          freshData = {
            oficial: { compra: 900, venta: 940, fecha: nowStr },
            blue: { compra: 1020, venta: 1040, fecha: nowStr },
            mep: { compra: 1010, venta: 1020, fecha: nowStr },
            ccl: { compra: 1030, venta: 1045, fecha: nowStr },
            tarjeta: { compra: 1440, venta: 1504, fecha: nowStr },
            lastUpdated: nowStr,
            source: 'hardcoded_resilience',
            stale: true,
          };
          this.logger.error('CRITICAL: No cache available and all APIs failed. Returning hardcoded values for service uptime.');
        }
      }
    }

    // Set cache (TTL: 2 minutes in memory)
    await this.cacheManager.set(CACHE_KEYS.DOLAR_PRICES, freshData);
    return freshData;
  }
}
