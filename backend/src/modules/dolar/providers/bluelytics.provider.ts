import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DolarRate } from '../dto/dolar-response.dto';

interface BluelyticsItem {
  value_buy: number;
  value_sell: number;
  value_avg: number;
}

interface BluelyticsResponse {
  oficial: BluelyticsItem;
  blue: BluelyticsItem;
  last_update: string;
}

@Injectable()
export class BluelyticsProvider {
  private readonly logger = new Logger(BluelyticsProvider.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('BLUELYTICS_API_URL') || 'https://api.bluelytics.com.ar/v2/latest';
    this.timeout = parseInt(this.configService.get<string>('HTTP_TIMEOUT') || '5000', 10);
  }

  async fetchPrices(): Promise<Record<string, DolarRate>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<BluelyticsResponse>(this.baseUrl, { timeout: this.timeout })
      );

      const data = response.data;
      const dateStr = data.last_update || new Date().toISOString();

      return {
        oficial: {
          compra: data.oficial.value_buy,
          venta: data.oficial.value_sell,
          fecha: dateStr,
        },
        blue: {
          compra: data.blue.value_buy,
          venta: data.blue.value_sell,
          fecha: dateStr,
        },
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch from Bluelytics: ${error.message}`);
      throw error;
    }
  }
}
