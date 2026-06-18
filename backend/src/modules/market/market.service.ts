import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IolApiProvider } from './providers/iol-api.provider';
import { MarketScraperProvider } from './providers/market-scraper.provider';
import { MarketSummaryDto } from './dto/market-summary.dto';
import { CaucionRateDto } from './dto/caucion-rate.dto';
import { CACHE_KEYS } from '../../common/constants/api-endpoints.constant';
import { MarketHoursService } from '../../common/services/market-hours.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  // ─── Snapshots persistentes ────────────────────────────────────────────────
  // Se guardan en memoria y sobreviven al vencimiento del caché de corto plazo.
  // Permiten mostrar el último cierre cuando el mercado está cerrado.
  private summarySnapshot: MarketSummaryDto | null = null;
  private caucionesSnapshot: CaucionRateDto[] | null = null;

  constructor(
    private readonly iolApiProvider: IolApiProvider,
    private readonly marketScraperProvider: MarketScraperProvider,
    private readonly marketHoursService: MarketHoursService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getSummary(): Promise<MarketSummaryDto> {
    const marketOpen = this.marketHoursService.isMarketOpen();

    if (!marketOpen) {
      // Mercado cerrado: devolver snapshot persistente si existe
      if (this.summarySnapshot) {
        this.logger.debug('Market closed – returning persistent summary snapshot.');
        return { ...this.summarySnapshot, marketOpen: false };
      }
      // Sin snapshot aún: intentar igualmente (primer arranque del día)
      this.logger.warn('Market closed but no snapshot available yet. Attempting fetch anyway...');
    }

    // Mercado abierto: preferir caché de corto plazo
    const cached = await this.cacheManager.get<MarketSummaryDto>(CACHE_KEYS.MARKET_Movers);
    if (cached) {
      return { ...cached, marketOpen: true };
    }

    this.logger.log('Cache miss for market summary – running immediate sync...');
    await this.updateCache();

    const fresh = await this.cacheManager.get<MarketSummaryDto>(CACHE_KEYS.MARKET_Movers);
    if (fresh) return { ...fresh, marketOpen: true };

    // Fallback: snapshot si falló la actualización
    if (this.summarySnapshot) {
      return { ...this.summarySnapshot, marketOpen };
    }

    throw new Error('No market summary available and cache is empty.');
  }

  async getCauciones(): Promise<{ rates: CaucionRateDto[]; marketOpen: boolean; cachedAt?: string }> {
    const marketOpen = this.marketHoursService.isMarketOpen();

    if (!marketOpen) {
      if (this.caucionesSnapshot) {
        this.logger.debug('Market closed – returning persistent cauciones snapshot.');
        return {
          rates: this.caucionesSnapshot,
          marketOpen: false,
          cachedAt: this.caucionesSnapshot[0]?.fecha,
        };
      }
      this.logger.warn('Market closed but no cauciones snapshot available. Attempting fetch...');
    }

    const cached = await this.cacheManager.get<CaucionRateDto[]>(CACHE_KEYS.CAUCION_RATES);
    if (cached) {
      return { rates: cached, marketOpen: true };
    }

    this.logger.log('Cache miss for cauciones – running immediate sync...');
    await this.updateCache();

    const fresh = await this.cacheManager.get<CaucionRateDto[]>(CACHE_KEYS.CAUCION_RATES);
    if (fresh) return { rates: fresh, marketOpen: true };

    if (this.caucionesSnapshot) {
      return { rates: this.caucionesSnapshot, marketOpen, cachedAt: this.caucionesSnapshot[0]?.fecha };
    }

    return { rates: [], marketOpen };
  }

  async updateCache(): Promise<void> {
    const marketOpen = this.marketHoursService.isMarketOpen();

    if (!marketOpen) {
      this.logger.log('Market is closed – skipping IOL/scraper fetch. Snapshot preserved.');
      return;
    }

    const nowStr = new Date().toISOString();

    // 1. Actualizar CEDEARs / Movers
    try {
      this.logger.log('Updating stock movers cache...');
      const movers = await this.iolApiProvider.fetchMovers();

      const summaryDto: MarketSummaryDto = {
        gainers: movers.gainers,
        losers: movers.losers,
        etfs: movers.etfs,
        lastUpdated: nowStr,
        marketOpen: true,
        cachedAt: nowStr,
      };

      await this.cacheManager.set(CACHE_KEYS.MARKET_Movers, summaryDto);
      // Guardar snapshot persistente
      this.summarySnapshot = summaryDto;
      this.logger.log('Successfully updated stock movers cache and snapshot.');
    } catch (error) {
      this.logger.error(`Failed to update stock movers cache: ${error.message}`);
    }

    // 2. Actualizar Cauciones
    try {
      this.logger.log('Updating cauciones rates cache...');
      const rates = await this.marketScraperProvider.fetchCaucionRates();
      await this.cacheManager.set(CACHE_KEYS.CAUCION_RATES, rates);
      // Guardar snapshot persistente
      this.caucionesSnapshot = rates;
      this.logger.log('Successfully updated cauciones rates cache and snapshot.');
    } catch (error) {
      this.logger.error(`Failed to update cauciones rates cache: ${error.message}`);
    }
  }
}
