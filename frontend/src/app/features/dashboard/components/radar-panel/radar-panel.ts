import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

@Component({
  selector: 'app-radar-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton, RelativeTimePipe],
  templateUrl: './radar-panel.html',
  styleUrl: './radar-panel.css',
})
export class RadarPanel {
  private dataService = inject(DashboardDataService);
  readonly isLoading = this.dataService.isLoading;
  readonly radarData = this.dataService.radar;

  getAccentClass(tipo: string): string {
    switch (tipo) {
      case 'caucion': return 'border-l-secondary text-secondary';
      case 'arbitraje': return 'border-l-primary text-primary';
      case 'dividendo': return 'border-l-tertiary text-tertiary';
      default: return 'border-l-outline text-outline';
    }
  }

  getBgClass(tipo: string): string {
    switch (tipo) {
      case 'caucion': return 'bg-secondary/10';
      case 'arbitraje': return 'bg-primary/10';
      case 'dividendo': return 'bg-tertiary/10';
      default: return 'bg-surface-bright/20';
    }
  }
}
