import { LOCALE_ID, signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardShell } from './dashboard-shell';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ApiService } from '../../../../core/services/api.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { CryptoPanel } from '../../components/crypto-panel/crypto-panel';
import { By } from '@angular/platform-browser';
import { DolarPayload } from '../../../../shared/models/dolar.model';
import { MarketData } from '../../../../shared/models/market.model';

registerLocaleData(localeEsAr);

describe('Dashboard visual identity integration', () => {
  function setup() {
    const quote = { compra: 1485, venta: 1535 };
    const service = {
      isLoading: signal(false),
      isMarketOpen: signal(false),
      marketCachedAt: signal('2026-10-16T20:28:00.000Z'),
      lastPollEpoch: signal(0),
      dolarError: signal(false),
      marketError: signal(false),
      caucionError: signal(false),
      cryptoError: signal(false),
      dolarBrecha: signal(0),
      dolar: signal<DolarPayload | null>({
        rates: { oficial: quote, blue: quote, mep: quote, ccl: quote, tarjeta: quote },
        brecha: 0,
        ultimaActualizacion: '2026-10-16T20:28:00.000Z',
      }),
      cauciones: signal({ min: 19.2, avg: 21.2, max: 23, lastClose: 20.2, plazo: '1 día' }),
      market: signal<MarketData | null>({
        topGainers: [
          {
            ticker: 'FNMA',
            nombre: 'Cedear Fannie Mae',
            precio: 6645,
            variacion: 10.1,
            tipo: 'CEDEAR',
          },
        ],
        topLosers: [
          { ticker: 'SDA', nombre: 'SunCar', precio: 263, variacion: -13.3, tipo: 'CEDEAR' },
        ],
        etfs: [],
      }),
      cryptos: signal({
        cryptos: [
          {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            priceUsd: 81545,
            change24h: -0.73,
            sparkline: [1, 2, 1],
          },
        ],
        ultimaActualizacion: '2026-10-16T20:28:00.000Z',
      }),
      selectedCryptoIds: signal(['bitcoin', 'ethereum', 'solana', 'binancecoin']),
      updateCryptoSelection(ids: string[]) {
        this.selectedCryptoIds.set(ids);
      },
    };
    TestBed.configureTestingModule({
      imports: [DashboardShell],
      providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },
        { provide: DashboardDataService, useValue: service },
        { provide: ApiService, useValue: { get: () => of([]) } },
        {
          provide: AppConfigService,
          useValue: {
            loadConfig: () => of({ botCaucionesUrl: 'https://t.me/example', botDividendosUrl: '' }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(DashboardShell);
    fixture.detectChanges();
    return { fixture, service, el: fixture.nativeElement as HTMLElement };
  }

  it('renders live values, a zero currency gap and Argentine number formatting', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.rf-dollar').length).toBe(5);
    expect(el.querySelector('.rf-pill')?.textContent).toContain('0,0%');
    expect(el.querySelector('.rf-dollar .rf-value')?.textContent).toContain('1.535');
    expect(el.querySelector('.rf-rate')?.textContent).toContain('20,2%');
  });

  it('switches ranking with accessible buttons without changing data', () => {
    const { el, fixture } = setup();
    const panel = el.querySelector('app-cedears-panel')!;
    expect(panel.textContent).toContain('FNMA');
    (panel.querySelectorAll('button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(panel.textContent).toContain('SDA');
    expect(panel.textContent).not.toContain('FNMA');
    expect(panel.querySelectorAll('button')[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('exposes API errors instead of displaying a false zero interest rate', () => {
    const { el, fixture, service } = setup();
    service.caucionError.set(true);
    service.dolarError.set(true);
    service.marketError.set(true);
    service.cryptoError.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.rf-rate')).toBeNull();
    expect(el.querySelector('.rf-dollar')).toBeNull();
    expect(el.querySelector('.rf-market')?.textContent).toContain('Estado no disponible');
    expect(el.querySelectorAll('[role="status"]').length).toBe(5);
  });

  it('displays loading and unavailable ETF prices without fabricated quotes', () => {
    const { el, fixture, service } = setup();
    expect(el.querySelector('app-etf-panel')?.textContent).toContain('Sin datos');
    service.dolar.set(null);
    service.isLoading.set(true);
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Cargando cotizaciones"]')).not.toBeNull();
    expect(el.querySelector('app-dolar-panel [role="status"]')).toBeNull();
  });

  it('distinguishes 24-hour changes from 7-day histories', () => {
    const { el } = setup();
    expect(el.querySelector('app-crypto-panel h2')?.textContent).toContain('24 h');
    expect(el.querySelector('.rf-spark')?.getAttribute('aria-label')).toContain('7 días');
    expect(el.querySelector('.rf-change.down')).not.toBeNull();
  });

  it('edits the selection, enforces four assets and handles an empty selection', () => {
    const { fixture, el, service } = setup();
    (el.querySelector('app-crypto-panel > .rf-section-head button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('label[for="crypto-search"]')).not.toBeNull();
    const component = fixture.debugElement.query(By.directive(CryptoPanel))
      .componentInstance as CryptoPanel;
    component.toggleCrypto('cardano');
    expect(service.selectedCryptoIds().length).toBe(4);
    component.toggleCrypto('bitcoin');
    component.toggleCrypto('cardano');
    expect(service.selectedCryptoIds()).toContain('cardano');
    service.selectedCryptoIds.set([]);
    fixture.detectChanges();
    expect(el.querySelector('app-crypto-panel')?.textContent).toContain(
      'No hay activos seleccionados',
    );
    expect(component.getSparklinePoints([1], 250, 50)).toBe('');
  });

  it('shows dated closing information in Argentina and preserves configured links', () => {
    const { el } = setup();
    expect(el.querySelector('.rf-date')?.textContent).toContain('17:28');
    expect(el.querySelector('.rf-date')?.textContent).toContain('2026');
    expect(el.querySelector('.rf-date')?.textContent).toContain('ART');
    const link = el.querySelector('.rf-tool')!;
    expect(link.getAttribute('href')).toBe('https://t.me/example');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
