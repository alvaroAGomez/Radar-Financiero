import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
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

  readonly isLoading = this.dataService.isLoading;
  readonly market = this.dataService.market;
  readonly marketError = this.dataService.marketError;
  readonly isMarketOpen = this.dataService.isMarketOpen;
  readonly marketCachedAt = this.dataService.marketCachedAt;

  readonly showLosers = signal(false);
  readonly visibleAssets = computed(
    () => (this.showLosers() ? this.market()?.topLosers : this.market()?.topGainers) ?? [],
  );

  formatCachedAt(iso: string | null): string {
    if (!iso) return '';
    return (
      new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      }) + ' ART'
    );
  }

  formatCedearName(name: string): string {
    if (!name) return '';
    // Eliminar la palabra "Cedear" o "CEDEAR" y limpiar espacios
    return name.replace(/cedear/i, '').trim();
  }
}
