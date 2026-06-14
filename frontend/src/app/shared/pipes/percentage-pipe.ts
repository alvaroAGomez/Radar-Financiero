import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea variaciones porcentuales con prefijo + para positivos.
 * Uso: {{ 2.45 | percentage }}  → +2,45%
 * Uso: {{ -0.12 | percentage }} → -0,12%
 * Uso: {{ 0 | percentage }}     → 0,00%
 */
@Pipe({
  name: 'percentage',
  standalone: true,
  pure: true,
})
export class PercentagePipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '—';

    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Math.abs(value));

    if (value > 0) return `+${formatted}%`;
    if (value < 0) return `-${formatted}%`;
    return `${formatted}%`;
  }
}
