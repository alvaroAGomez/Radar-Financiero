import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppConfig } from './app-config.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio singleton que carga la configuración pública desde el backend
 * (GET /api/config) y la cachea en memoria durante toda la sesión.
 *
 * Uso: inyectar en los componentes que necesiten las URLs dinámicas.
 * Para precarga en bootstrap, ver app.config.ts con APP_INITIALIZER.
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: AppConfig = {
    botCaucionesUrl: environment.botCaucionesUrl,
    botDividendosUrl: environment.botDividendosUrl,
  };

  constructor(private readonly http: HttpClient) {}

  /**
   * Llama a GET /api/config y cachea el resultado.
   * Usar en ngOnInit o como APP_INITIALIZER.
   */
  loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${environment.apiUrl}/config`).pipe(
      tap((config) => {
        this.config = config;
      }),
      catchError((err) => {
        console.error('[AppConfigService] No se pudo cargar la config del servidor. Usando valores del environment como fallback.', err);
        return of(this.config);
      }),
    );
  }

  get botCaucionesUrl(): string {
    return this.config.botCaucionesUrl;
  }

  get botDividendosUrl(): string {
    return this.config.botDividendosUrl;
  }
}
