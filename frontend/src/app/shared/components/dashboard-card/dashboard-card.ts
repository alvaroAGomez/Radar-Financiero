import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card.html',
  styleUrl: './dashboard-card.css',
})
export class DashboardCard {
  /** Aplica borde izquierdo de acento (para resaltar Blue, alertas, etc.) */
  @Input() accentBorder: 'primary' | 'secondary' | 'tertiary' | 'none' = 'none';
  /** Clase extra para padding custom */
  @Input() padding: string = 'p-5';
  /** Aplica efecto glass (para modales y dropdowns flotantes) */
  @Input() glass: boolean = false;
}
