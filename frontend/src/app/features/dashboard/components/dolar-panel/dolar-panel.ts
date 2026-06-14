import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { CurrencyFormatterPipe } from '../../../../shared/pipes/currency-formatter-pipe';

interface DolarCard {
  label: string;
  icon: string;
  key: 'oficial' | 'blue' | 'mep' | 'ccl' | 'tarjeta';
  accent: boolean;
}

@Component({
  selector: 'app-dolar-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton, CurrencyFormatterPipe],
  templateUrl: './dolar-panel.html',
  styleUrl: './dolar-panel.css',
})
export class DolarPanel {
  private dataService = inject(DashboardDataService);

  readonly isLoading  = this.dataService.isLoading;
  readonly dolar      = this.dataService.dolar;
  readonly brecha     = this.dataService.dolarBrecha;
  readonly dolarError = this.dataService.dolarError;

  readonly cards: DolarCard[] = [
    { label: 'OFICIAL', icon: '🏛️', key: 'oficial', accent: false },
    { label: 'BLUE',    icon: '💵', key: 'blue',    accent: true  },
    { label: 'MEP',     icon: '📈', key: 'mep',     accent: false },
    { label: 'CCL',     icon: '🌍', key: 'ccl',     accent: false },
    { label: 'TARJETA', icon: '💳', key: 'tarjeta', accent: false },
  ];

  getSpread(venta: number, compra: number): number {
    return (venta || 0) - (compra || 0);
  }
}
