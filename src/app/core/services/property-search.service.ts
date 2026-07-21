import { Injectable } from '@angular/core';
import { ParamMap, Params } from '@angular/router';
import { Property } from '../../shared/models/property.model';
import { PropertySearchFilters } from '../../shared/models/property-search.model';

@Injectable({ providedIn: 'root' })
export class PropertySearchService {
  readonly defaultFilters: PropertySearchFilters = {
    query: '',
    type: 'all',
    category: 'all',
    location: '',
    budgetMax: null,
    bedroomsMin: null,
    verifiedOnly: false,
    sort: 'recent',
  };

  fromQueryParams(params: ParamMap): PropertySearchFilters {
    return {
      query: params.get('q') ?? '',
      type: this.readUnion(params.get('type'), ['all', 'location', 'vente'], 'all'),
      category: this.readUnion(params.get('category'), ['all', 'maison', 'appartement', 'residence', 'terrain'], 'all'),
      location: params.get('location') ?? '',
      budgetMax: this.readNumber(params.get('budgetMax')),
      bedroomsMin: this.readNumber(params.get('bedroomsMin')),
      verifiedOnly: params.get('verified') === 'true',
      sort: this.readUnion(params.get('sort'), ['recent', 'price-asc', 'price-desc', 'surface-desc'], 'recent'),
    };
  }

  toQueryParams(filters: PropertySearchFilters): Params {
    return {
      q: filters.query.trim() || null,
      type: filters.type === 'all' ? null : filters.type,
      category: filters.category === 'all' ? null : filters.category,
      location: filters.location.trim() || null,
      budgetMax: filters.budgetMax,
      bedroomsMin: filters.bedroomsMin,
      verified: filters.verifiedOnly ? 'true' : null,
      sort: filters.sort === 'recent' ? null : filters.sort,
    };
  }

  filterLocal(properties: Property[], filters: PropertySearchFilters): Property[] {
    const query = this.normalize(filters.query);
    const location = this.normalize(filters.location);

    const result = properties.filter((property) => {
      const matchesQuery = !query || this.normalize(`${property.title} ${property.location} ${property.description}`).includes(query);
      const matchesType = filters.type === 'all' || property.type === filters.type;
      const matchesCategory = filters.category === 'all' || property.category === filters.category;
      const matchesLocation = !location || this.normalize(`${property.location} ${property.address}`).includes(location);
      const matchesBudget = filters.budgetMax == null || property.price <= filters.budgetMax;
      const matchesRooms = filters.bedroomsMin == null || property.bedrooms >= filters.bedroomsMin;
      const matchesVerified = !filters.verifiedOnly || property.verified === true;

      return matchesQuery && matchesType && matchesCategory && matchesLocation && matchesBudget && matchesRooms && matchesVerified;
    });

    return this.sort(result, filters.sort);
  }

  private sort(properties: Property[], sort: PropertySearchFilters['sort']): Property[] {
    const items = [...properties];
    if (sort === 'price-asc') return items.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return items.sort((a, b) => b.price - a.price);
    if (sort === 'surface-desc') return items.sort((a, b) => b.surface - a.surface);
    return items;
  }

  private readNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private readUnion<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    return value && allowed.includes(value as T) ? value as T : fallback;
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}

