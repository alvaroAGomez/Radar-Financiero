import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';

@Component({
  selector: 'app-cauciones-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton],
  templateUrl: './cauciones-panel.html',
  styleUrl: './cauciones-panel.css',
})
export class CaucionesPanel {
  private dataService   = inject(DashboardDataService);
  readonly isLoading    = this.dataService.isLoading;
  readonly cauciones    = this.dataService.cauciones;
  readonly caucionError = this.dataService.caucionError;
  readonly isMarketOpen   = this.dataService.isMarketOpen;
  readonly marketCachedAt = this.dataService.marketCachedAt;

  formatCachedAt(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires',
    });
  }
}
