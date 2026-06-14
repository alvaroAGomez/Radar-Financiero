import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte un timestamp ISO a formato relativo amigable.
 * Uso: {{ '2024-01-01T15:00:00Z' | relativeTime }} → Hace 2 min
 */
@Pipe({
  name: 'relativeTime',
  standalone: true,
  pure: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '—';

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 10) return 'Ahora';
    if (diffSec < 60) return `Hace ${diffSec} seg`;
    if (diffMin === 1) return 'Hace 1 min';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHr === 1) return 'Hace 1 hora';
    if (diffHr < 24) return `Hace ${diffHr} horas`;
    return 'Hace más de 1 día';
  }
}
