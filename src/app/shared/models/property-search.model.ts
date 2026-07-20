import { PropertyCategory, PropertyType } from './property.model';

export type PropertySort = 'recent' | 'price-asc' | 'price-desc' | 'surface-desc';

export interface PropertySearchFilters {
  query: string;
  type: PropertyType | 'all';
  category: PropertyCategory | 'all';
  location: string;
  budgetMax: number | null;
  bedroomsMin: number | null;
  verifiedOnly: boolean;
  sort: PropertySort;
}

export interface PropertySearchOption<T extends string | number | null> {
  label: string;
  value: T;
}

