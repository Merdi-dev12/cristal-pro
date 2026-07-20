import { Service, inject } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { Property } from '../../shared/models/property.model';
import { FaqItem, ProcessStep, ServiceOffer, StatItem, Testimonial } from '../../shared/models/site-content.model';

@Service()
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
      .order('created_at', { ascending: false });

    if (error || !data) return;

    this.properties.push(
      ...data.map((row): Property => ({
        id: row['id'],
        title: row['title'],
        price: Number(row['price']),
        priceSuffix: row['price_suffix'] ?? undefined,
        location: row['location'],
        address: row['address'],
        bedrooms: row['bedrooms'],
        bathrooms: row['bathrooms'],
        surface: Number(row['surface']),
        type: row['type'],
        category: row['category'],
        imageUrl: row['image_url'],
        featured: row['featured'] ?? undefined,
        verified: row['verified'] ?? undefined,
        description: row['description'],
      })),
    );
  }

  private async loadStats(): Promise<void> {
    const { data, error } = await this.supabase
      .from('stats')
      .select('value, label')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.stats.push(...data.map((row): StatItem => ({ value: row['value'], label: row['label'] })));
  }

  private async loadServices(): Promise<void> {
    const { data, error } = await this.supabase
      .from('service_offers')
      .select('slug, title, eyebrow, description, icon, cta')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.services.push(
      ...data.map((row): ServiceOffer => ({
        id: row['slug'],
        title: row['title'],
        eyebrow: row['eyebrow'],
        description: row['description'],
        icon: row['icon'],
        cta: row['cta'],
      })),
    );
  }

  private async loadProcess(): Promise<void> {
    const { data, error } = await this.supabase
      .from('process_steps')
      .select('step, title, description')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.process.push(
      ...data.map((row): ProcessStep => ({ step: row['step'], title: row['title'], description: row['description'] })),
    );
  }

  private async loadFaqs(): Promise<void> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('question, answer')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.faqs.push(...data.map((row): FaqItem => ({ question: row['question'], answer: row['answer'] })));
  }

  private async loadTestimonials(): Promise<void> {
    const { data, error } = await this.supabase
      .from('testimonials')
      .select('name, role, quote')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.testimonials.push(
      ...data.map((row): Testimonial => ({ name: row['name'], role: row['role'], quote: row['quote'] })),
    );
  }

  get featuredProperties(): Property[] {
    return this.properties.filter((property) => property.featured || property.verified).slice(0, 3);
  }
}
