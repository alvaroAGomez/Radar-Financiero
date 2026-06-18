import { Component, inject, OnInit, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
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
  
  currentTime = signal<string>('');
  private timerInt?: any;

  ngOnInit() {
    this.updateClock();
    this.ngZone.runOutsideAngular(() => {
      this.timerInt = setInterval(() => {
        this.updateClock();
      }, 1000);
    });
  }

  ngOnDestroy() {
    if (this.timerInt) {
      clearInterval(this.timerInt);
    }
  }

  private updateClock() {
    const now = new Date();
    this.currentTime.set(
      now.toLocaleTimeString('es-AR', {
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      }) 
    );
  }
}
