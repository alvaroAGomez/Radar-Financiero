import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicConfigDto } from './dto/public-config.dto';

/**
 * Lee variables de entorno a través del ConfigService de NestJS
 * y las expone de forma segura al cliente Angular.
 *
 * Variables requeridas en .env:
 *   TELEGRAM_BOT_CAUCIONES_URL=https://t.me/tu_bot_cauciones
 *   TELEGRAM_BOT_DIVIDENDOS_URL=https://t.me/tu_bot_dividendos
 *
 * NOTA: No confundir con CAUCION_BOT_URL, que es la URL interna
 * del backend para consumir datos de cauciones (backend → backend).
 */
@Injectable()
export class ConfigPublicService {
  constructor(private readonly configService: ConfigService) {}

  getPublicConfig(): PublicConfigDto {
    return {
      botCaucionesUrl: this.configService.get<string>('TELEGRAM_BOT_CAUCIONES_URL', ''),
      botDividendosUrl: this.configService.get<string>('TELEGRAM_BOT_DIVIDENDOS_URL', ''),
    };
  }
}
