import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse space-y-3">
      @for (row of rows; track $index) {
        <div
          class="skeleton h-4 rounded-md"
          [style.width]="row"
        ></div>
      }
    </div>
  `,
})
export class LoadingSkeleton {
  /** Anchos de cada línea del skeleton, ej: ['60%', '40%', '80%'] */
  @Input() rows: string[] = ['100%', '75%', '50%'];
}
