import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { CurrencyFormatterPipe } from '../../../../shared/pipes/currency-formatter-pipe';

interface DolarCard {
  label: string;
  key: 'oficial' | 'blue' | 'mep' | 'ccl' | 'tarjeta';
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

  readonly isLoading = this.dataService.isLoading;
  readonly dolar = this.dataService.dolar;
  readonly brecha = this.dataService.dolarBrecha;
  readonly dolarError = this.dataService.dolarError;

  readonly cards: DolarCard[] = [
    { label: 'Oficial', key: 'oficial' },
    { label: 'Blue', key: 'blue' },
    { label: 'MEP', key: 'mep' },
    { label: 'CCL', key: 'ccl' },
    { label: 'Tarjeta', key: 'tarjeta' },
  ];

  formatUpdatedAt(iso: string): string {
    return (
      new Date(iso).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' ART'
    );
  }
}
