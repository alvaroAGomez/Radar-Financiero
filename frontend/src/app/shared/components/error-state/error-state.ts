import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-8 gap-3 text-center animate-fade-in">
      <span class="material-symbols-outlined text-tertiary text-4xl">wifi_off</span>
      <p class="text-sm font-headline font-bold text-on-surface">{{ title }}</p>
      <p class="text-[11px] text-on-surface-variant max-w-xs">{{ message }}</p>
      @if (showRetry) {
        <button
          (click)="retry.emit()"
          class="mt-2 flex items-center gap-1 text-primary text-xs font-semibold
                 border border-primary/30 rounded-full px-4 py-1.5
                 hover:bg-primary/10 transition-colors"
        >
          <span class="material-symbols-outlined text-sm">refresh</span>
          Reintentar
        </button>
      }
    </div>
  `,
})
export class ErrorState {
  @Input() title: string = 'Sin conexión';
  @Input() message: string = 'No se pudo sincronizar la información financiera. Mostrando datos de resguardo.';
  @Input() showRetry: boolean = true;
  @Output() retry = new EventEmitter<void>();
}
