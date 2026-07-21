import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { Property } from '../../shared/models/property.model';
import { PropertySearchFilters } from '../../shared/models/property-search.model';
import { FaqItem, ProcessStep, ServiceOffer, StatItem, Testimonial } from '../../shared/models/site-content.model';

@Injectable({ providedIn: 'root' })
export class RheodyceDataService {
  private readonly supabase = inject(SupabaseClientService).client;

  readonly properties: Property[] = [];
  readonly stats: StatItem[] = [];
  readonly services: ServiceOffer[] = [];
  readonly process: ProcessStep[] = [];
  readonly faqs: FaqItem[] = [];
  readonly testimonials: Testimonial[] = [];

  async load(): Promise<void> {
    await Promise.all([
      this.loadProperties(),
      this.loadStats(),
      this.loadServices(),
      this.loadProcess(),
      this.loadFaqs(),
      this.loadTestimonials(),
    ]);
  }

  private async loadProperties(): Promise<void> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .or('status.eq.published,status.is.null')
      .order('created_at', { ascending: false });

    if (error) throw error;

    this.properties.splice(0, this.properties.length, ...data.map(mapProperty));
  }

  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    const { data, error } = await this.supabase.rpc('search_properties', {
      p_query: filters.query.trim() || null,
      p_type: filters.type === 'all' ? null : filters.type,
      p_category: filters.category === 'all' ? null : filters.category,
      p_location: filters.location.trim() || null,
      p_budget_max: filters.budgetMax,
      p_bedrooms_min: filters.bedroomsMin,
      p_verified_only: filters.verifiedOnly,
      p_sort: filters.sort,
      p_limit: 80,
      p_offset: 0,
    });

    if (!error) {
      return ((data ?? []) as Record<string, unknown>[]).map(mapProperty);
    }

    return this.searchPropertiesDirect(filters);
  }

  private async searchPropertiesDirect(filters: PropertySearchFilters): Promise<Property[]> {
    let query = this.supabase
      .from('properties')
      .select('*')
      .eq('status', 'published');

    if (filters.query.trim()) {
      const term = this.escapeLike(filters.query.trim());
      query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%,description.ilike.%${term}%`);
    }

    if (filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.location.trim()) {
      const location = this.escapeLike(filters.location.trim());
      query = query.or(`location.ilike.%${location}%,address.ilike.%${location}%`);
    }

    if (filters.budgetMax != null) {
      query = query.lte('price', filters.budgetMax);
    }

    if (filters.bedroomsMin != null) {
      query = query.gte('bedrooms', filters.bedroomsMin);
    }

    if (filters.verifiedOnly) {
      query = query.eq('verified', true);
    }

    if (filters.sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (filters.sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (filters.sort === 'surface-desc') {
      query = query.order('surface', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapProperty);
  }

  private async loadStats(): Promise<void> {
    const { data, error } = await this.supabase
      .from('stats')
      .select('value, label')
      .order('display_order', { ascending: true });

    if (error) throw error;
    this.stats.push(...data.map((row: Record<string, unknown>): StatItem => ({ value: String(row['value'] ?? ''), label: String(row['label'] ?? '') })));
  }

  private async loadServices(): Promise<void> {
    const { data, error } = await this.supabase
      .from('service_offers')
      .select('slug, title, eyebrow, description, icon, cta')
      .order('display_order', { ascending: true });

    if (error) throw error;

    const offers = (data ?? []).map((row: Record<string, unknown>): ServiceOffer => ({
        id: String(row['slug'] ?? ''),
        title: String(row['title'] ?? ''),
        eyebrow: String(row['eyebrow'] ?? ''),
        description: String(row['description'] ?? ''),
        icon: String(row['icon'] ?? ''),
        cta: String(row['cta'] ?? ''),
      })) ?? [];

    this.services.push(...offers);
  }

  private async loadProcess(): Promise<void> {
    const { data, error } = await this.supabase
      .from('process_steps')
      .select('step, title, description')
      .order('display_order', { ascending: true });

    if (error) throw error;
    this.process.push(
      ...data.map((row: Record<string, unknown>): ProcessStep => ({ step: String(row['step'] ?? ''), title: String(row['title'] ?? ''), description: String(row['description'] ?? '') })),
    );
  }

  private async loadFaqs(): Promise<void> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('question, answer')
      .order('display_order', { ascending: true });

    if (error) throw error;
    this.faqs.push(...data.map((row: Record<string, unknown>): FaqItem => ({ question: String(row['question'] ?? ''), answer: String(row['answer'] ?? '') })));
  }

  private async loadTestimonials(): Promise<void> {
    const { data, error } = await this.supabase
      .from('testimonials')
      .select('name, role, quote')
      .order('display_order', { ascending: true });

    if (error) throw error;
    this.testimonials.push(
      ...data.map((row: Record<string, unknown>): Testimonial => ({ name: String(row['name'] ?? ''), role: String(row['role'] ?? ''), quote: String(row['quote'] ?? '') })),
    );
  }

  get featuredProperties(): Property[] {
    return this.properties.filter((property) => property.featured || property.verified).slice(0, 3);
  }

  private escapeLike(value: string): string {
    return value.replace(/[%_]/g, '');
  }
}

function mapProperty(row: Record<string, unknown>): Property {
  return {
    id: String(row['id'] ?? ''),
    title: String(row['title'] ?? ''),
    price: Number(row['price']),
    priceSuffix: row['price_suffix'] == null ? undefined : String(row['price_suffix']),
    location: String(row['location'] ?? ''),
    address: String(row['address'] ?? ''),
    bedrooms: Number(row['bedrooms'] ?? 0),
    bathrooms: Number(row['bathrooms'] ?? 0),
    surface: Number(row['surface']),
    type: row['type'] as Property['type'],
    category: row['category'] as Property['category'],
    imageUrl: String(row['image_url'] ?? ''),
    featured: Boolean(row['featured']),
    verified: Boolean(row['verified']),
    description: String(row['description'] ?? ''),
    latitude: row['latitude'] == null ? undefined : Number(row['latitude']),
    longitude: row['longitude'] == null ? undefined : Number(row['longitude']),
  };
}
