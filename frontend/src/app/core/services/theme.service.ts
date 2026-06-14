import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Radar Financiero es siempre dark — señal pública por si se extiende en el futuro
  private _isDark = signal(true);
  isDark = this._isDark.asReadonly();

  constructor() {
    document.documentElement.classList.add('dark');
  }
}
