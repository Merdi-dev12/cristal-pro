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
      ...data.map((row: Record<string, unknown>): Property => ({
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
      })),
    );
  }

  private async loadStats(): Promise<void> {
    const { data, error } = await this.supabase
      .from('stats')
      .select('value, label')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.stats.push(...data.map((row: Record<string, unknown>): StatItem => ({ value: String(row['value'] ?? ''), label: String(row['label'] ?? '') })));
  }

  private async loadServices(): Promise<void> {
    const { data, error } = await this.supabase
      .from('service_offers')
      .select('slug, title, eyebrow, description, icon, cta')
      .order('display_order', { ascending: true });

    const offers = data?.map((row: Record<string, unknown>): ServiceOffer => ({
        id: String(row['slug'] ?? ''),
        title: String(row['title'] ?? ''),
        eyebrow: String(row['eyebrow'] ?? ''),
        description: String(row['description'] ?? ''),
        icon: String(row['icon'] ?? ''),
        cta: String(row['cta'] ?? ''),
      })) ?? [];

    if (!offers.some((offer) => offer.id === 'demenagement')) {
      offers.push({
        id: 'demenagement',
        title: 'Déménagement',
        eyebrow: 'Logistique',
        description: 'Préparez votre transfert avec un itinéraire estimé, le volume à transporter et l’affectation d’un partenaire.',
        icon: '↗',
        cta: 'Préparer mon déménagement',
      });
    }

    this.services.push(...offers);
  }

  private async loadProcess(): Promise<void> {
    const { data, error } = await this.supabase
      .from('process_steps')
      .select('step, title, description')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.process.push(
      ...data.map((row: Record<string, unknown>): ProcessStep => ({ step: String(row['step'] ?? ''), title: String(row['title'] ?? ''), description: String(row['description'] ?? '') })),
    );
  }

  private async loadFaqs(): Promise<void> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('question, answer')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.faqs.push(...data.map((row: Record<string, unknown>): FaqItem => ({ question: String(row['question'] ?? ''), answer: String(row['answer'] ?? '') })));
  }

  private async loadTestimonials(): Promise<void> {
    const { data, error } = await this.supabase
      .from('testimonials')
      .select('name, role, quote')
      .order('display_order', { ascending: true });

    if (error || !data) return;
    this.testimonials.push(
      ...data.map((row: Record<string, unknown>): Testimonial => ({ name: String(row['name'] ?? ''), role: String(row['role'] ?? ''), quote: String(row['quote'] ?? '') })),
    );
  }

  get featuredProperties(): Property[] {
    return this.properties.filter((property) => property.featured || property.verified).slice(0, 3);
  }
}
