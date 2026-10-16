import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ApiService } from '../../../../core/services/api.service';
import { LoadingSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { CurrencyFormatterPipe } from '../../../../shared/pipes/currency-formatter-pipe';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
} from 'rxjs';

@Component({
  selector: 'app-crypto-panel',
  standalone: true,
  imports: [CommonModule, LoadingSkeleton, CurrencyFormatterPipe],
  templateUrl: './crypto-panel.html',
  styleUrl: './crypto-panel.css',
})
export class CryptoPanel implements OnInit, OnDestroy {
  private dataService = inject(DashboardDataService);
  private api = inject(ApiService);

  readonly isLoading = this.dataService.isLoading;
  readonly cryptoData = this.dataService.cryptos;
  readonly selectedIds = this.dataService.selectedCryptoIds;
  readonly cryptoError = this.dataService.cryptoError;

  filteredCryptos = computed(() => {
    const data = this.cryptoData();
    if (!data) return [];
    const selected = this.selectedIds();
    return data.cryptos
      .filter((c) => selected.includes(c.id))
      .sort((a, b) => selected.indexOf(a.id) - selected.indexOf(b.id));
  });

  readonly editing = signal(false);

  // Search state
  searchQuery = signal<string>('');
  isSearching = signal<boolean>(false);
  showDropdown = signal<boolean>(false);
  suggestions = signal<any[]>([]);

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.trim().length === 0) {
            return of([]);
          }
          this.isSearching.set(true);
          return this.api.get<any[]>('/crypto/search', { query }).pipe(catchError(() => of([])));
        }),
      )
      .subscribe((results) => {
        this.suggestions.set(results);
        this.isSearching.set(false);
        this.showDropdown.set(this.searchQuery().trim().length > 0);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);

    this.searchSubject.next(val);
    if (val.trim().length === 0) {
      this.showDropdown.set(false);
      this.suggestions.set([]);
    }
  }

  getSparklinePoints(data: number[] | undefined, width: number, height: number): string {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // avoid div by 0

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }

  getCryptoLabel(id: string): string {
    const data = this.cryptoData();
    if (data) {
      const found = data.cryptos.find((c) => c.id === id);
      if (found) return found.symbol;
    }
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  toggleCrypto(id: string) {
    const current = [...this.selectedIds()];
    const index = current.indexOf(id);

    if (index >= 0) {
      // Remove
      current.splice(index, 1);
      this.dataService.updateCryptoSelection(current);
    } else {
      // Add (if less than 4)
      if (current.length < 4) {
        current.push(id);
        this.dataService.updateCryptoSelection(current);
      }
    }

    // Limpiar buscador al seleccionar/deseleccionar
    this.searchQuery.set('');
    this.searchSubject.next('');
    this.suggestions.set([]);
    this.showDropdown.set(false);
  }
}
