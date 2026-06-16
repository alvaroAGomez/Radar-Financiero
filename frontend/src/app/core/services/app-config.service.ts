import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { catchError, tap, take } from 'rxjs/operators';
import { AppConfig } from './app-config.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio singleton que carga la configuración pública desde el backend
 * (GET /api/config) y la cachea en memoria durante toda la sesión.
 *
 * La primera llamada a loadConfig() hace el request HTTP.
 * Todas las llamadas posteriores retornan el valor cacheado instantáneamente
 * sin volver a tocar la red (gracias al ReplaySubject con buffer=1).
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  /** Caché en memoria: emite el último valor a cualquier suscriptor nuevo. */
  private readonly config$ = new ReplaySubject<AppConfig>(1);

  /** True una vez que el primer fetch fue iniciado, para no repetirlo. */
  private loaded = false;

  /** Fallback sincrónico mientras el request viaja. */
  private fallback: AppConfig = {
    botCaucionesUrl: environment.botCaucionesUrl,
    botDividendosUrl: environment.botDividendosUrl,
  };

  constructor(private readonly http: HttpClient) {}

  /**
   * Retorna un Observable<AppConfig>.
   * - Primera llamada: dispara GET /api/config, cachea el resultado.
   * - Llamadas posteriores: emiten el valor cacheado inmediatamente.
   */
  loadConfig(): Observable<AppConfig> {
    if (!this.loaded) {
      this.loaded = true;
      this.http.get<AppConfig>(`${environment.apiUrl}/config`).pipe(
        catchError((err) => {
          console.error(
            '[AppConfigService] No se pudo cargar la config del servidor. Usando fallback del environment.',
            err,
          );
          return of(this.fallback);
        }),
      ).subscribe((config) => this.config$.next(config));
    }

    return this.config$.pipe(take(1));
  }

  get botCaucionesUrl(): string {
    return this.fallback.botCaucionesUrl;
  }

  get botDividendosUrl(): string {
    return this.fallback.botDividendosUrl;
  }
}
