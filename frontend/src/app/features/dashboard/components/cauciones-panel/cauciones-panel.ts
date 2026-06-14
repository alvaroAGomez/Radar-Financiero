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
  private dataService  = inject(DashboardDataService);
  readonly isLoading   = this.dataService.isLoading;
  readonly cauciones   = this.dataService.cauciones;
  readonly caucionError = this.dataService.caucionError;
}
