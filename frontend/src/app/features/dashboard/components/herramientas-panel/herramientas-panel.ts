import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../../../core/services/app-config.service';

@Component({
  selector: 'app-herramientas-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './herramientas-panel.html',
  styleUrl: './herramientas-panel.css',
})
export class HerramientasPanel implements OnInit {
  botCaucionesUrl = '';
  botDividendosUrl = '';
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
        console.error('[HerramientasPanel] Error inesperado al cargar config:', err);
        this.isLoadingConfig = false;
      },
    });
  }
}
