import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea números financieros con símbolo de moneda argentino.
 * Uso: {{ 1450.5 | currencyFormatter:'ARS' }} → $ 1.450,50
 * Uso: {{ 67430.1 | currencyFormatter:'USD' }} → U$S 67.430,10
 * Uso: {{ 64281 | currencyFormatter:'USD':0 }} → U$S 64.281
 */
@Pipe({
  name: 'currencyFormatter',
  standalone: true,
  pure: true,
})
export class CurrencyFormatterPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: 'ARS' | 'USD' = 'ARS', decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '—';

    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

    return currency === 'USD' ? `U$S ${formatted}` : `$ ${formatted}`;
  }
}
