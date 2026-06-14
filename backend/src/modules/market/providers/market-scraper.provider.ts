import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CaucionRateDto } from '../dto/caucion-rate.dto';

@Injectable()
export class MarketScraperProvider {
  private readonly logger = new Logger(MarketScraperProvider.name);
  private readonly botUrl: string | null = null;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.botUrl = this.configService.get<string>('CAUCION_BOT_URL') || null;
    this.timeout = parseInt(this.configService.get<string>('HTTP_TIMEOUT') || '5000', 10);
  }

  async fetchCaucionRates(): Promise<CaucionRateDto[]> {
    const nowStr = new Date().toISOString();

    if (!this.botUrl || this.botUrl.includes('cauciones-bot.local')) {
      this.logger.warn('CAUCION_BOT_URL is not configured with a real external scraper endpoint. Returning default simulated caucion rates.');
      return this.getMockCaucionRates(nowStr);
    }

    try {
      this.logger.log(`Fetching cauciones rates from external scraper bot: ${this.botUrl}`);
      const response = await firstValueFrom(
        this.httpService.get<any>(this.botUrl, { timeout: this.timeout })
      );

      const d = response.data;

      // El bot devuelve un objeto único con estadísticas del día, no un array.
      // Estructura esperada: { fecha, tasa_minima, tasa_maxima: { valor, hora }, promedio, ultima_tasa: { valor, hora } }
      if (d && typeof d === 'object' && !Array.isArray(d) && d.promedio !== undefined) {
        const fecha = d.fecha ? new Date(d.fecha).toISOString() : nowStr;
        return [
          { tenor: 'min',   tasa: parseFloat(d.tasa_minima)          || 0, monto: 0, fecha },
          { tenor: 'prom',  tasa: parseFloat(d.promedio)              || 0, monto: 0, fecha },
          { tenor: 'max',   tasa: parseFloat(d.tasa_maxima?.valor)    || 0, monto: 0, fecha },
          { tenor: 'last',  tasa: parseFloat(d.ultima_tasa?.valor)    || 0, monto: 0, fecha },
        ];
      }

      this.logger.warn('External cauciones bot returned unexpected format. Falling back to default rates.');
      return this.getMockCaucionRates(nowStr);
    } catch (error) {
      this.logger.error(`Failed to fetch cauciones from external bot (${error.message}). Falling back to default rates.`);
      return this.getMockCaucionRates(nowStr);
    }
  }

  private getMockCaucionRates(timestamp: string): CaucionRateDto[] {
    return [
      { tenor: '1d', tasa: 64.2, monto: 1450000000, fecha: timestamp },
      { tenor: '7d', tasa: 67.5, monto: 3500000000, fecha: timestamp },
      { tenor: '14d', tasa: 68.1, monto: 850000000, fecha: timestamp },
      { tenor: '30d', tasa: 69.6, monto: 1200000000, fecha: timestamp },
    ];
  }
}
