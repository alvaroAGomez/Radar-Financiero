import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { CurrencyFormatterPipe } from '../../../../shared/pipes/currency-formatter-pipe';

interface EtfMeta {
  ticker: string;
  fullName: string;
  macro: string;
  icon: string;
}

const ETF_META: EtfMeta[] = [
  { ticker: 'SPY', fullName: 'SPDR S&P 500 ETF', macro: 'Top 500 EE.UU.', icon: '🇺🇸' },
  { ticker: 'QQQ', fullName: 'Invesco QQQ (Nasdaq)', macro: 'Tech & IA', icon: '💻' },
  { ticker: 'DIA', fullName: 'SPDR Dow Jones', macro: 'Economía industrial', icon: '🏗️' },
  { ticker: 'EEM', fullName: 'iShares Emerging Markets', macro: 'Mercados emergentes', icon: '🌏' },
  { ticker: 'GLD', fullName: 'SPDR Gold Trust', macro: 'Oro – Refugio global', icon: '🥇' },
];

@Component({
  selector: 'app-etf-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton, CurrencyFormatterPipe],
  templateUrl: './etf-panel.html',
  styleUrl: './etf-panel.css',
})
export class EtfPanel {
  private dataService = inject(DashboardDataService);

  readonly isLoading = this.dataService.isLoading;
  readonly market    = this.dataService.market;
  readonly marketError = this.dataService.marketError;

  readonly etfMeta = ETF_META;

  getMetaForTicker(ticker: string): EtfMeta | undefined {
    return ETF_META.find(m => m.ticker === ticker);
  }

  /** Enrich the raw market ETFs array with metadata, preserving display order */
  get enrichedEtfs() {
    const etfsData = this.market()?.etfs ?? [];
    return ETF_META.map(meta => {
      const live = etfsData.find(e => e.ticker === meta.ticker);
      return { ...meta, live };
    });
  }
}
