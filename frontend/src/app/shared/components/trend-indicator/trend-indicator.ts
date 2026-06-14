import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trend-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (value !== null && value !== undefined) {
      <span
        [class]="badgeClass"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      >
        <span class="material-symbols-outlined" style="font-size: 11px;">
          {{ iconName }}
        </span>
        {{ displayValue }}
      </span>
    } @else {
      <span class="text-outline text-[10px]">—</span>
    }
  `,
})
export class TrendIndicator {
  @Input() value: number | null | undefined = null;
  @Input() decimals: number = 2;

  get isPositive(): boolean { return (this.value ?? 0) > 0; }
  get isNegative(): boolean { return (this.value ?? 0) < 0; }

  get badgeClass(): string {
    if (this.isPositive) return 'text-secondary bg-secondary/10';
    if (this.isNegative) return 'text-tertiary bg-tertiary/10';
    return 'text-on-surface-variant bg-surface-bright/50';
  }

  get iconName(): string {
    if (this.isPositive) return 'arrow_upward';
    if (this.isNegative) return 'arrow_downward';
    return 'remove';
  }

  get displayValue(): string {
    if (this.value === null || this.value === undefined) return '—';
    const abs = Math.abs(this.value);
    const fmt = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    }).format(abs);
    if (this.isPositive) return `+${fmt}%`;
    if (this.isNegative) return `-${fmt}%`;
    return `${fmt}%`;
  }
}
