import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertySearchService } from '../../core/services/property-search.service';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { Property, PropertyCategory, PropertyType } from '../../shared/models/property.model';
import { PropertySearchFilters, PropertySearchOption, PropertySort } from '../../shared/models/property-search.model';

type FilterDropdown = 'category' | 'budgetMax' | 'bedroomsMin' | 'sort';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCard],
  templateUrl: './annonces.html',
})
export class AnnoncesPage implements OnInit {
  private readonly data = inject(RheodyceDataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly propertySearch = inject(PropertySearchService);

  protected readonly filters = signal<PropertySearchFilters>({ ...this.propertySearch.defaultFilters });
  protected readonly results = signal<Property[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly searchError = signal('');
  protected readonly openDropdown = signal<FilterDropdown | null>(null);
  protected readonly hasActiveFilters = computed(() => JSON.stringify(this.filters()) !== JSON.stringify(this.propertySearch.defaultFilters));

  protected readonly typeOptions: PropertySearchOption<PropertyType | 'all'>[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Location', value: 'location' },
    { label: 'Vente', value: 'vente' },
  ];

  protected readonly categoryOptions: PropertySearchOption<PropertyCategory | 'all'>[] = [
    { label: 'Tous les biens', value: 'all' },
    { label: 'Maison', value: 'maison' },
    { label: 'Appartement', value: 'appartement' },
    { label: 'Résidence', value: 'residence' },
    { label: 'Terrain', value: 'terrain' },
  ];

  protected readonly budgetOptions: PropertySearchOption<number | null>[] = [
    { label: 'Tous les budgets', value: null },
    { label: '800 $ max', value: 800 },
    { label: '2 000 $ max', value: 2000 },
    { label: '100 000 $ max', value: 100000 },
    { label: '250 000 $ max', value: 250000 },
  ];

  protected readonly bedroomOptions: PropertySearchOption<number | null>[] = [
    { label: 'Chambres', value: null },
    { label: '1+ chambre', value: 1 },
    { label: '3+ chambres', value: 3 },
    { label: '4+ chambres', value: 4 },
  ];

  protected readonly sortOptions: PropertySearchOption<PropertySort>[] = [
    { label: 'Plus récents', value: 'recent' },
    { label: 'Prix croissant', value: 'price-asc' },
    { label: 'Prix décroissant', value: 'price-desc' },
    { label: 'Grande surface', value: 'surface-desc' },
  ];

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.filters.set(this.propertySearch.fromQueryParams(params));
        void this.runSearch();
      });
  }

  protected setType(type: PropertyType | 'all'): void {
    this.filters.update((filters) => ({ ...filters, type }));
    void this.applyFilters();
  }

  protected updateFilter<K extends keyof PropertySearchFilters>(key: K, value: PropertySearchFilters[K]): void {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  protected toggleDropdown(dropdown: FilterDropdown, event: Event): void {
    event.stopPropagation();
    this.openDropdown.update((current) => (current === dropdown ? null : dropdown));
  }

  protected selectFilter<K extends keyof PropertySearchFilters>(key: K, value: PropertySearchFilters[K]): void {
    this.updateFilter(key, value);
    this.openDropdown.set(null);
  }

  protected selectedLabel<T extends string | number | null>(options: PropertySearchOption<T>[], value: T): string {
    return options.find((option) => option.value === value)?.label ?? '';
  }

  protected async applyFilters(): Promise<void> {
    this.openDropdown.set(null);
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.propertySearch.toQueryParams(this.filters()),
      queryParamsHandling: 'merge',
    });
  }

  protected async resetFilters(): Promise<void> {
    this.openDropdown.set(null);
    this.filters.set({ ...this.propertySearch.defaultFilters });
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.propertySearch.toQueryParams(this.filters()),
    });
  }

  protected onViewDetails(property: Property): void {
    void this.router.navigate(['/annonces', property.id]);
  }

  private async runSearch(): Promise<void> {
    this.isLoading.set(true);
    this.searchError.set('');

    try {
      const properties = await this.data.searchProperties(this.filters());
      this.results.set(properties);
    } catch {
      this.results.set(this.propertySearch.filterLocal(this.data.properties, this.filters()));
      this.searchError.set('Recherche locale affichée. La connexion aux filtres Supabase est à vérifier.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
