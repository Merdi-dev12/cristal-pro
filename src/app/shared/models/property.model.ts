export type PropertyType = 'vente' | 'location';
export type PropertyCategory = 'maison' | 'appartement' | 'residence' | 'terrain';

export interface Property {
  id: string;
  title: string;
  price: number;
  priceSuffix?: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string;
  photos?: string[];
  featured?: boolean;
  verified?: boolean;
  description: string;
  latitude?: number;
  longitude?: number;
}
