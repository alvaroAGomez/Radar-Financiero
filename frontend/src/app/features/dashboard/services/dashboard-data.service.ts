import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { timer, switchMap, retry, Subscription, catchError, of, forkJoin, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardPayload } from '../../../shared/models/market.model';
import { DolarPayload } from '../../../shared/models/dolar.model';
import { CryptoPayload } from '../../../shared/models/crypto.model';
import { CaucionesData, MarketData, RadarOpportunity, MarketAsset } from '../../../shared/models/market.model';

const POLL_INTERVAL_MS = 240_000; // 4 minutos
const RETRY_DELAY_MS   = 5_000;   // 5 segundos

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService implements OnDestroy {
  private api = inject(ApiService);

  // ─── Signals privadas ────────────────────────────────
  private _isLoading   = signal<boolean>(true);
  private _error       = signal<string | null>(null);
  private _isStale     = signal<boolean>(false);
  private _lastUpdated = signal<string | null>(null);

  private _dolar      = signal<DolarPayload | null>(null);
  private _cryptos    = signal<CryptoPayload | null>(null);
  private _cauciones  = signal<CaucionesData | null>(null);
  private _market     = signal<MarketData | null>(null);
  private _radar      = signal<RadarOpportunity[]>([]);

  // ─── Error signals por sección ───────────────────────
  private _dolarError    = signal<boolean>(false);
  private _marketError   = signal<boolean>(false);
  private _cryptoError   = signal<boolean>(false);
  private _caucionError  = signal<boolean>(false);

  // ─── Signals públicas ─────────────────────────────────────
  readonly isLoading   = this._isLoading.asReadonly();
  readonly error       = this._error.asReadonly();
  readonly isStale     = this._isStale.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();
  readonly dolar       = this._dolar.asReadonly();
  readonly cryptos     = this._cryptos.asReadonly();
  readonly cauciones   = this._cauciones.asReadonly();
  readonly market      = this._market.asReadonly();
  readonly radar       = this._radar.asReadonly();
  readonly dolarError   = this._dolarError.asReadonly();
  readonly marketError  = this._marketError.asReadonly();
  readonly cryptoError  = this._cryptoError.asReadonly();
  readonly caucionError = this._caucionError.asReadonly();

  // ─── Estado de la UI compartida ──────────────────────────────────────────
  private _selectedCryptoIds = signal<string[]>(['bitcoin', 'ethereum', 'solana', 'binancecoin']);
  readonly selectedCryptoIds = this._selectedCryptoIds.asReadonly();

  readonly dolarBrecha = computed(() => {
    const d = this._dolar();
    if (!d) return 0;
    return d.brecha;
  });

  readonly hasData = computed(() => this._dolar() !== null);

  private subscription?: Subscription;

  constructor() {
    this.startPolling();
  }

  private startPolling(): void {
    this.subscription = timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => {
          this._isLoading.set(true);
          // Resetear errores por sección al inicio de cada ciclo
          this._dolarError.set(false);
          this._marketError.set(false);
          this._cryptoError.set(false);
          this._caucionError.set(false);
          
          const selected = this._selectedCryptoIds();
          const ids = selected.join(',');
          
          const cryptoReq = selected.length > 0 
            ? this.api.get<any[]>('/crypto/prices', { ids }).pipe(catchError(() => { this._cryptoError.set(true); return of([]); }))
            : of([]);

          // Cada endpoint falla de forma independiente para no bloquear el resto del dashboard
          return forkJoin({
            dolarRes:     this.api.get<any>('/dolar').pipe(catchError(() => { this._dolarError.set(true); return of(null); })),
            cryptoRes:    cryptoReq,
            marketRes:    this.api.get<any>('/market/summary').pipe(catchError(() => { this._marketError.set(true); return of(null); })),
            caucionesRes: this.api.get<any[]>('/market/cauciones').pipe(catchError(() => { this._caucionError.set(true); return of([]); }))
          }).pipe(
            map(results => this.mapBackendToFrontend(results)),
            catchError((err) => {
              console.warn('[DashboardDataService] Error crítico en todos los endpoints.', err);
              this._error.set('No se pudo conectar con el backend. Verificá que NestJS esté corriendo.');
              this._isStale.set(true);
              return of(null);
            })
          );
        }),
        retry({ delay: RETRY_DELAY_MS }),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this._dolar.set(data.dolar);
            this._cryptos.set(data.cryptos);
            this._cauciones.set(data.cauciones);
            this._market.set(data.market);
            this._radar.set(data.radar ?? []);
            this._lastUpdated.set(data.serverTime);
            this._isStale.set(false);
            this._error.set(null);
          }
          this._isLoading.set(false);
        },
        error: (err) => {
          console.error('[DashboardDataService] Error crítico:', err);
          this._error.set('Error crítico al sincronizar.');
          this._isLoading.set(false);
        },
      });
  }

  private mapBackendToFrontend(res: { dolarRes: any, cryptoRes: any[], marketRes: any, caucionesRes: any[] }): DashboardPayload {
    // 1. Dolar
    const d = res.dolarRes;
    const brecha = d?.oficial?.venta && d?.blue?.venta 
      ? ((d.blue.venta - d.oficial.venta) / d.oficial.venta) * 100 
      : 0;

    const dolarPayload: DolarPayload | null = d ? {
      rates: {
        oficial: { compra: d.oficial?.compra || 0, venta: d.oficial?.venta || 0, variacion: 0 },
        blue: { compra: d.blue?.compra || 0, venta: d.blue?.venta || 0, variacion: 0 },
        mep: { compra: d.mep?.compra || 0, venta: d.mep?.venta || 0, variacion: 0 },
        ccl: { compra: d.ccl?.compra || 0, venta: d.ccl?.venta || 0, variacion: 0 },
        tarjeta: { compra: d.tarjeta?.compra || 0, venta: d.tarjeta?.venta || 0, variacion: 0 }
      },
      brecha: brecha,
      ultimaActualizacion: d.lastUpdated || new Date().toISOString(),
      isStale: d.stale || false
    } : null;

    // 2. Crypto
    const cryptosPayload: CryptoPayload = {
      cryptos: (res.cryptoRes || []).map(c => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        priceUsd: c.priceUsd,
        change24h: c.change24h,
        icon: this.getCryptoIcon(c.symbol),
        sparkline: c.sparkline || []
      })),
      ultimaActualizacion: new Date().toISOString()
    };

    // 3. Market
    const m = res.marketRes;
    const marketPayload: MarketData | null = m ? {
      topGainers: (m.gainers || []).map((g: any) => ({
        ticker: g.symbol,
        nombre: g.name,
        variacion: g.change,
        precio: g.price,
        tipo: g.isCedear ? 'CEDEAR' : 'USA'
      })),
      topLosers: (m.losers || []).map((l: any) => ({
        ticker: l.symbol,
        nombre: l.name,
        variacion: l.change,
        precio: l.price,
        tipo: l.isCedear ? 'CEDEAR' : 'USA'
      })),
      etfs: (m.etfs || []).map((e: any) => ({
        ticker: e.symbol,
        nombre: e.name,
        variacion: e.change,
        precio: e.price,
        tipo: e.isCedear ? 'CEDEAR' : 'USA'
      }))
    } : null;

    // 4. Cauciones — El bot retorna [min, prom, max, last], usamos los tenores semánticos
    const lastRate = res.caucionesRes.find((c: any) => c.tenor === 'last') ?? res.caucionesRes[res.caucionesRes.length - 1];
    const promRate = res.caucionesRes.find((c: any) => c.tenor === 'prom');
    const rates    = res.caucionesRes.map((c: any) => c.tasa);
    const caucionesData: CaucionesData = {
      min:       rates.length ? Math.min(...rates) : 0,
      max:       rates.length ? Math.max(...rates) : 0,
      avg:       promRate?.tasa ?? (rates.length ? rates.reduce((a: number, b: number) => a + b, 0) / rates.length : 0),
      lastClose: lastRate?.tasa || 0,
      plazo:     '1 día'
    };

    // 5. Radar (Mock until backend has an endpoint)
    const radarData: RadarOpportunity[] = [
      { id: '1', tipo: 'caucion', titulo: 'Caución act', descripcion: 'Tasa spot monitoreada.', timestamp: new Date().toISOString(), prioridad: 'alta', icon: '🔥' }
    ];

    return {
      dolar: dolarPayload,
      cryptos: cryptosPayload,
      cauciones: caucionesData,
      market: marketPayload,
      radar: radarData,
      serverTime: new Date().toISOString()
    };
  }

  private getCryptoIcon(symbol: string): string {
    const s = symbol.toLowerCase();
    if (s.includes('btc') || s.includes('bitcoin')) return 'currency_bitcoin';
    if (s.includes('eth')) return 'token';
    return 'monetization_on';
  }

  updateCryptoSelection(ids: string[]): void {
    this._selectedCryptoIds.set(ids.slice(0, 4));
    this.refresh();
  }

  refresh(): void {
    this._isStale.set(false);
    this._error.set(null);
    this.subscription?.unsubscribe();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
