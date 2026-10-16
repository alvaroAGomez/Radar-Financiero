import { Component, inject, OnInit, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService, POLL_INTERVAL_MS } from '../../services/dashboard-data.service';
import { DolarPanel } from '../../components/dolar-panel/dolar-panel';
import { CaucionesPanel } from '../../components/cauciones-panel/cauciones-panel';
import { CedearsPanel } from '../../components/cedears-panel/cedears-panel';
import { CryptoPanel } from '../../components/crypto-panel/crypto-panel';
import { EtfPanel } from '../../components/etf-panel/etf-panel';
import { HerramientasPanel } from '../../components/herramientas-panel/herramientas-panel';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    CommonModule,
    DolarPanel,
    CaucionesPanel,
    CedearsPanel,
    CryptoPanel,
    EtfPanel,
    HerramientasPanel,
  ],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.css',
})
export class DashboardShell implements OnInit, OnDestroy {
  private dataService = inject(DashboardDataService);
  private ngZone = inject(NgZone);

  readonly year = new Date().getFullYear();
  readonly marketError = this.dataService.marketError;
  readonly isLoading = this.dataService.isLoading;

  readonly isMarketOpen = this.dataService.isMarketOpen;
  readonly marketCachedAt = this.dataService.marketCachedAt;

  currentTime = signal<string>('');
  nextUpdateIn = signal<string>(''); // Formato "M:SS"

  private timerInt?: any;

  ngOnInit() {
    this.tick();
    this.ngZone.runOutsideAngular(() => {
      this.timerInt = setInterval(() => this.tick(), 1000);
    });
  }

  ngOnDestroy() {
    if (this.timerInt) clearInterval(this.timerInt);
  }

  private tick() {
    const now = new Date();

    // Reloj
    this.currentTime.set(
      now.toLocaleTimeString('es-AR', {
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      }),
    );

    // Countdown próxima actualización
    const lastPoll = this.dataService.lastPollEpoch();
    if (lastPoll > 0) {
      const elapsed = Date.now() - lastPoll;
      const remaining = Math.max(0, POLL_INTERVAL_MS - elapsed);
      const mins = Math.floor(remaining / 60_000);
      const secs = Math.floor((remaining % 60_000) / 1000);
      this.nextUpdateIn.set(`${mins}:${secs.toString().padStart(2, '0')}`);
    }
  }

  /** Fecha y hora de la fuente en Argentina, incluso para cierres de días anteriores. */
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
}
