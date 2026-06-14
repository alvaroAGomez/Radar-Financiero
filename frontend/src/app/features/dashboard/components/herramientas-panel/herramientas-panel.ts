import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-herramientas-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './herramientas-panel.html',
  styleUrl: './herramientas-panel.css',
})
export class HerramientasPanel {
  readonly botCaucionesUrl = environment.botCaucionesUrl;
  readonly botDividendosUrl = environment.botDividendosUrl;
}
