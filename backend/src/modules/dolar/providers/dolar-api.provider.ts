import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DolarRate } from '../dto/dolar-response.dto';

interface DolarApiItem {
  casa: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

@Injectable()
export class DolarApiProvider {
  private readonly logger = new Logger(DolarApiProvider.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('DOLAR_API_URL') || 'https://dolarapi.com/v1/dolares';
    this.timeout = parseInt(this.configService.get<string>('HTTP_TIMEOUT') || '5000', 10);
  }

  async fetchPrices(): Promise<Record<string, DolarRate>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DolarApiItem[]>(this.baseUrl, { timeout: this.timeout })
      );

      const data = response.data;
      const result: Record<string, DolarRate> = {};

      const mappedCasas: Record<string, string> = {
        oficial: 'oficial',
        blue: 'blue',
        bolsa: 'mep',
        contadoconliqui: 'ccl', // Keeping ccl mapping just in case, but adding tarjeta
        tarjeta: 'tarjeta',
      };

      for (const item of data) {
        const key = mappedCasas[item.casa.toLowerCase()];
        if (key) {
          result[key] = {
            compra: item.compra,
            venta: item.venta,
            fecha: item.fechaActualizacion,
          };
        }
      }

      return result;
    } catch (error) {
      this.logger.warn(`Failed to fetch from DolarAPI: ${error.message}`);
      throw error;
    }
  }
}
