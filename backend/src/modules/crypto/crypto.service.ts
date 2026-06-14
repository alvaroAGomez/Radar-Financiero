import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CoinGeckoProvider } from './providers/coingecko.provider';
import { DolarService } from '../dolar/dolar.service';
import { CryptoMarketDto } from './dto/crypto-market.dto';
import { CACHE_KEYS, DEFAULT_CRYPTO_LIST } from '../../common/constants/api-endpoints.constant';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  constructor(
    private readonly coinGeckoProvider: CoinGeckoProvider,
    private readonly dolarService: DolarService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getPrices(ids?: string): Promise<CryptoMarketDto[]> {
    const list = ids ? ids.split(',').map(id => id.trim()).filter(id => id.length > 0) : DEFAULT_CRYPTO_LIST;
    
    const cachedCoins: CryptoMarketDto[] = [];
    const missingIds: string[] = [];

    // Check individual cache for each requested coin
    for (const id of list) {
      const cached = await this.cacheManager.get<CryptoMarketDto>(`crypto_coin_${id}`);
      if (cached) {
        cachedCoins.push(cached);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      // If all requested coins are in cache, just sort them to match requested order
      return cachedCoins.sort((a, b) => list.indexOf(a.id) - list.indexOf(b.id));
    }

    this.logger.log(`Cache missing for ${missingIds.length} coins (${missingIds.join(',')}), fetching...`);
    const fetchedCoins = await this.updateCache(missingIds);

    // Combine what we had in cache with what we just fetched (if any)
    const combined = [...cachedCoins, ...fetchedCoins];
    
    // In case CoinGecko failed completely for missing ones, we at least return the ones we had
    return combined
      .filter(c => list.includes(c.id))
      .sort((a, b) => list.indexOf(a.id) - list.indexOf(b.id));
  }

  async updateCache(cryptoList: string[] = DEFAULT_CRYPTO_LIST): Promise<CryptoMarketDto[]> {
    let freshData: CryptoMarketDto[] = [];
    const nowStr = new Date().toISOString();

    try {
      let usdToArsRate = 1000;
      try {
        const dolarPrices = await this.dolarService.getPrices();
        usdToArsRate = dolarPrices.blue.venta;
      } catch (dolarError) {
        this.logger.warn(`Could not fetch dollar rate for ARS conversion: ${dolarError.message}`);
      }

      this.logger.log(`Fetching crypto markets from CoinGecko for ${cryptoList.length} coins...`);
      const markets = await this.coinGeckoProvider.fetchMarkets(cryptoList);
      
      freshData = markets.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        priceUsd: coin.current_price,
        priceArs: coin.current_price * usdToArsRate,
        change24h: coin.price_change_percentage_24h || 0,
        lastUpdated: coin.last_updated || nowStr,
        sparkline: coin.sparkline_in_7d?.price || [],
      }));

      this.logger.log(`Successfully updated ${freshData.length} coins from CoinGecko`);
    } catch (error) {
      this.logger.error(`CoinGecko fetch failed for ${cryptoList.join(',')}. Error: ${error.message}`);
      freshData = [];
    }

    // Save fetched data to cache individually
    for (const coin of freshData) {
      const isDefault = DEFAULT_CRYPTO_LIST.includes(coin.id);
      const ttl = isDefault ? 120000 : 60000; // 2 mins for default, 1 min for custom
      await this.cacheManager.set(`crypto_coin_${coin.id}`, coin, ttl);
    }
    
    // Also keep the legacy global cache just in case other modules depend on it (e.g. search fallback)
    if (cryptoList.length === DEFAULT_CRYPTO_LIST.length && cryptoList.every((val, index) => val === DEFAULT_CRYPTO_LIST[index])) {
      await this.cacheManager.set(CACHE_KEYS.CRYPTO_PRICES, freshData, 120000);
    }

    return freshData;
  }

  async search(query: string): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cacheKey = `crypto_search_${query.trim().toLowerCase()}`;
    const cachedSearch = await this.cacheManager.get<any[]>(cacheKey);
    if (cachedSearch) {
      return cachedSearch;
    }

    try {
      const results = await this.coinGeckoProvider.searchCoins(query);
      const formatted = results.slice(0, 10).map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.large,
      }));

      // Cache search query for 5 minutes to reduce CoinGecko load
      await this.cacheManager.set(cacheKey, formatted, 300000);
      return formatted;
    } catch (error) {
      this.logger.warn(`Search failed for query "${query}": ${error.message}`);
      return [];
    }
  }

}
