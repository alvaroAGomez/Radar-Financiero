import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MarketInstrument } from '../dto/market-summary.dto';

/**
 * Real IOL API response shapes (from official Swagger v2 docs)
 */
interface IolInstrumentoTituloModel {
  simbolo: string;
  descripcion?: string;
  ultimoPrecio?: number;
  variacionPorcentual?: number;
  volumen?: number;
  cantidadOperaciones?: number;
  apertura?: number;
  maximo?: number;
  minimo?: number;
  ultimoCierre?: number;
  fecha?: string;
  mercado?: string;
  moneda?: string;
}

interface IolInstrumentoModel {
  titulos: IolInstrumentoTituloModel[];
}

@Injectable()
export class IolApiProvider {
  private readonly logger = new Logger(IolApiProvider.name);
  private readonly baseUrl: string;
  private readonly timeout: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl =
      this.configService.get<string>('IOL_API_URL') ||
      'https://api.invertironline.com';
    this.timeout = parseInt(
      this.configService.get<string>('HTTP_TIMEOUT') || '5000',
      10
    );
  }

  /**
   * Fetches all CEDEARs from the real IOL endpoint:
   *   GET /api/v2/Cotizaciones/cedears/argentina/Todos
   *
   * Response model (InstrumentoModel):
   *   { titulos: [{ simbolo, descripcion, ultimoPrecio, variacionPorcentual, volumen, ... }] }
   *
   * Sorts by variacionPorcentual descending and returns top 5 gainers and top 5 losers.
   */
  async fetchMovers(): Promise<{ gainers: MarketInstrument[]; losers: MarketInstrument[]; etfs: MarketInstrument[] }> {
    const username = this.configService.get<string>('IOL_USERNAME');
    const password = this.configService.get<string>('IOL_PASSWORD');

    if (!username || !password) {
      throw new Error('IOL credentials (IOL_USERNAME / IOL_PASSWORD) are not set in .env.');
    }

    await this.ensureAuthenticated(username, password);

    // Correct endpoint from IOL Swagger v2 docs:
    // GET /api/v2/Cotizaciones/{Instrumento}/{Pais}/Todos
    // Instrumento = "cedears", Pais = "argentina"
    const url = `${this.baseUrl}/api/v2/Cotizaciones/cedears/argentina/Todos?timestamp=${Date.now()}`;

    this.logger.log(`Fetching CEDEARs from IOL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<IolInstrumentoModel>(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          timeout: this.timeout,
        })
      );
      return this.mapIolData(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logger.warn('IOL API token expired or invalid (401). Forcing refresh and retrying...');
        await this.ensureAuthenticated(username, password, true);
        
        const retryResponse = await firstValueFrom(
          this.httpService.get<IolInstrumentoModel>(url, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
            timeout: this.timeout,
          })
        );
        return this.mapIolData(retryResponse.data);
      }
      throw error;
    }
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  private async ensureAuthenticated(username: string, password: string, forceRefresh: boolean = false): Promise<void> {
    if (!forceRefresh && this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return; // Token still valid
    }

    if (this.refreshToken) {
      this.logger.log('Refreshing IOL API token using refresh_token...');
      try {
        const url = `${this.baseUrl}/token`;
        const payload = `refresh_token=${encodeURIComponent(this.refreshToken)}&grant_type=refresh_token`;

        const response = await firstValueFrom(
          this.httpService.post<{ access_token: string; refresh_token?: string; expires_in?: number }>(
            url,
            payload,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: this.timeout,
            }
          )
        );

        this.accessToken = response.data.access_token;
        if (response.data.refresh_token) {
          this.refreshToken = response.data.refresh_token;
        }
        const expiresInSeconds = response.data.expires_in || 900;
        this.tokenExpiresAt = new Date(Date.now() + (expiresInSeconds - 60) * 1000);
        this.logger.log('Successfully refreshed token with IOL API');
        return;
      } catch (error: any) {
        this.logger.warn('Failed to refresh token, falling back to password login...');
        this.refreshToken = null;
        // let it fall through to password login
      }
    }

    this.logger.log('Authenticating with IOL API via password...');
    try {
      // IOL uses OAuth2 Resource Owner Password flow via /token
      const url = `${this.baseUrl}/token`;
      const payload =
        `username=${encodeURIComponent(username)}` +
        `&password=${encodeURIComponent(password)}` +
        `&grant_type=password`;

      const response = await firstValueFrom(
        this.httpService.post<{ access_token: string; refresh_token?: string; expires_in?: number }>(
          url,
          payload,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: this.timeout,
          }
        )
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      const expiresInSeconds = response.data.expires_in || 900; // IOL tokens expire in 15 min
      // Renew 60 s before expiry to avoid mid-request failures
      this.tokenExpiresAt = new Date(Date.now() + (expiresInSeconds - 60) * 1000);
      this.logger.log('Successfully authenticated with IOL API via password');
    } catch (error: any) {
      this.logger.error(`Failed to authenticate with IOL API: ${error.message}`);
      throw error;
    }
  }

  // ─── Mapping ───────────────────────────────────────────────────────────────

  /**
   * Maps the raw IOL InstrumentoModel response to our internal MarketInstrument shape.
   * Sorts all titles by variacionPorcentual and slices top 5 gainers / top 5 losers.
   */
  private mapIolData(data: IolInstrumentoModel): {
    gainers: MarketInstrument[];
    losers: MarketInstrument[];
    etfs: MarketInstrument[];
  } {
    const titulos: IolInstrumentoTituloModel[] = data?.titulos ?? [];

    if (titulos.length === 0) {
      throw new Error('IOL returned an empty titulos array for cedears.');
    }

    // 1. Filtrar solo moneda local (Pesos = "1")
    const enPesos = titulos.filter((t) => t.moneda === '1');

    if (enPesos.length === 0) {
      this.logger.warn('No CEDEARs found in local currency (Pesos).');
      return { gainers: [], losers: [], etfs: [] };
    }

    // 2. Encontrar la fecha de mercado más reciente para evitar fines de semana o feriados
    const fechas = enPesos
      .map((t) => (t.fecha ? t.fecha.split('T')[0] : ''))
      .filter((f) => f !== '')
      .sort((a, b) => (a < b ? 1 : -1)); // descending

    const fechaMasReciente = fechas.length > 0 ? fechas[0] : '';

    // 3. Aplicar filtros de fecha y volumen (Clean Data)
    const listaLimpia = enPesos.filter((t) => {
      const fechaActivo = t.fecha ? t.fecha.split('T')[0] : '';
      return (
        fechaActivo === fechaMasReciente &&
        (t.cantidadOperaciones ?? 0) > 15
      );
    });

    if (listaLimpia.length === 0) {
      this.logger.warn(`No valid CEDEARs found for date ${fechaMasReciente} with required volume.`);
      return { gainers: [], losers: [], etfs: [] };
    }

    const format = (item: IolInstrumentoTituloModel): MarketInstrument => ({
      symbol: item.simbolo,
      name: item.descripcion || item.simbolo,
      price: item.ultimoPrecio ?? 0,
      change: item.variacionPorcentual ?? 0,
      volume: item.volumen ?? 0,
      isCedear: true,
    });

    const etfSymbols = ['SPY', 'QQQ', 'DIA', 'EEM', 'GLD'];
    const etfs = enPesos
      .filter((t) => t.fecha?.split('T')[0] === fechaMasReciente && etfSymbols.includes(t.simbolo))
      .map(format);

    // 4. Sort descending by change %
    const sorted = [...listaLimpia].sort(
      (a, b) => (b.variacionPorcentual ?? 0) - (a.variacionPorcentual ?? 0)
    );

    const gainers = sorted
      .filter((t) => (t.variacionPorcentual ?? 0) > 0)
      .slice(0, 5)
      .map(format);

    const losers = sorted
      .filter((t) => (t.variacionPorcentual ?? 0) < 0)
      .slice(-5)
      .reverse()
      .map(format);

    return { gainers, losers, etfs };
  }

}
