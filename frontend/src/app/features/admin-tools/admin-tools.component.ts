import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../core/services/app-config.service';

@Component({
  selector: 'app-admin-tools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tools.component.html',
  styleUrl: './admin-tools.component.css',
})
export class AdminToolsComponent implements OnInit {
  /** URL del bot de Telegram de cauciones. Se carga desde /api/config en ngOnInit. */
  botCaucionesUrl = '';

  /** URL del bot de Telegram de dividendos. Se carga desde /api/config en ngOnInit. */
  botDividendosUrl = '';

  /** Estado de carga para mostrar skeleton/spinner si es necesario. */
  isLoadingConfig = true;

  constructor(private readonly appConfigService: AppConfigService) {}

  ngOnInit(): void {
    this.appConfigService.loadConfig().subscribe({
      next: (config) => {
        this.botCaucionesUrl = config.botCaucionesUrl;
        this.botDividendosUrl = config.botDividendosUrl;
        this.isLoadingConfig = false;
      },
      error: (err) => {
        // El catchError del servicio ya maneja el fallback, este bloque
        // solo se ejecutaría si el observable completase con error (no debería).
        console.error('[AdminToolsComponent] Error inesperado al cargar config:', err);
        this.isLoadingConfig = false;
      },
    });
  }
}
