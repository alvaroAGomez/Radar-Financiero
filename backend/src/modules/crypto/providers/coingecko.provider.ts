import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinGeckoSearchCoin {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  large: string;
}

@Injectable()
export class CoinGeckoProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('COINGECKO_API_URL') || 'https://api.coingecko.com/api/v3';
    this.timeout = parseInt(this.configService.get<string>('HTTP_TIMEOUT') || '5000', 10);
  }

  async fetchMarkets(ids: string[]): Promise<CoinGeckoMarketItem[]> {
    try {
      const idsParam = ids.join(',');
      const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
      
      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoMarketItem[]>(url, { timeout: this.timeout })
      );
      
      return response.data;
    } catch (error) {
      this.logger.warn(`Failed to fetch from CoinGecko markets: ${error.message}`);
      throw error;
    }
  }

  async searchCoins(query: string): Promise<CoinGeckoSearchCoin[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
      const response = await firstValueFrom(
        this.httpService.get<{ coins: CoinGeckoSearchCoin[] }>(url, { timeout: this.timeout })
      );
      return response.data.coins || [];
    } catch (error) {
      this.logger.warn(`Failed to search from CoinGecko: ${error.message}`);
      throw error;
    }
  }
}
