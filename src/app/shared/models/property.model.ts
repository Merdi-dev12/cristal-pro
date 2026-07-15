export type PropertyType = 'vente' | 'location';
export type PropertyCategory = 'maison' | 'appartement' | 'residence';

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string;
}
