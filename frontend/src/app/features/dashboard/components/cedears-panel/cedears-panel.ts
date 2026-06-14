import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { TrendIndicator } from '../../../../shared/components/trend-indicator/trend-indicator';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { CurrencyFormatterPipe } from '../../../../shared/pipes/currency-formatter-pipe';

@Component({
  selector: 'app-cedears-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton, CurrencyFormatterPipe],
  templateUrl: './cedears-panel.html',
  styleUrl: './cedears-panel.css',
})
export class CedearsPanel {
  private dataService = inject(DashboardDataService);

  readonly isLoading   = this.dataService.isLoading;
  readonly market      = this.dataService.market;
  readonly marketError = this.dataService.marketError;

  formatCedearName(name: string): string {
    if (!name) return '';
    // Eliminar la palabra "Cedear" o "CEDEAR" y limpiar espacios
    return name.replace(/cedear/i, '').trim();
  }
}
