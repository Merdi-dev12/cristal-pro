import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { AuthService } from './auth.service';
import {
  MyPropertySubmission,
  PropertySubmissionInput,
  PropertySubmissionNotification,
} from '../../shared/models/property-submission.model';

@Injectable({ providedIn: 'root' })
export class PropertySubmissionService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly submissions = signal<MyPropertySubmission[]>([]);
  readonly notifications = signal<PropertySubmissionNotification[]>([]);
  readonly isLoading = signal(false);

  async create(input: PropertySubmissionInput): Promise<MyPropertySubmission> {
    const body = new FormData();
    body.set('title', input.title);
    body.set('category', input.category);
    body.set('type', input.type);
    body.set('city', input.city);
    body.set('address', input.address);
    body.set('price', String(input.price));
    body.set('surface', String(input.surface));
    body.set('bedrooms', String(input.bedrooms));
    body.set('bathrooms', String(input.bathrooms));
    body.set('description', input.description);
    body.set('latitude', String(input.latitude));
    body.set('longitude', String(input.longitude));
    input.photos.forEach((file) => body.append('photos', file, file.name));
    input.documents.forEach((file) => body.append('documents', file, file.name));

    const { data, error } = await this.supabase.functions.invoke('create-property-submission', {
      body,
    });
    if (error) throw error;
    const submission = this.mapSubmission(data as Record<string, unknown>);
    this.submissions.update((items) => [submission, ...items]);
    return submission;
  }

  async loadMine(): Promise<void> {
    if (!this.auth.userId()) {
      this.submissions.set([]);
      this.notifications.set([]);
      return;
    }
    this.isLoading.set(true);
    try {
      const [submissions, notifications] = await Promise.all([
        this.supabase
          .from('property_submissions')
          .select('*')
          .order('created_at', { ascending: false }),
        this.supabase
          .from('property_submission_notifications')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);
      if (submissions.error) throw submissions.error;
      if (notifications.error) throw notifications.error;
      this.submissions.set(
        (submissions.data ?? []).map((row) => this.mapSubmission(row as Record<string, unknown>)),
      );
      this.notifications.set(
        (notifications.data ?? []).map((row) =>
          this.mapNotification(row as Record<string, unknown>),
        ),
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapSubmission(row: Record<string, unknown>): MyPropertySubmission {
    return {
      id: String(row['id']),
      title: String(row['title']),
      category: row['category'] as MyPropertySubmission['category'],
      type: row['type'] as MyPropertySubmission['type'],
      city: String(row['city']),
      address: String(row['address']),
      price: Number(row['price']),
      surface: Number(row['surface']),
      bedrooms: Number(row['bedrooms'] ?? 0),
      bathrooms: Number(row['bathrooms'] ?? 0),
      description: String(row['description']),
      latitude: Number(row['latitude']),
      longitude: Number(row['longitude']),
      photoUrls: Array.isArray(row['photos']) ? row['photos'].map(String) : [],
      documentUrls: Array.isArray(row['documents']) ? row['documents'].map(String) : [],
      status: row['status'] as MyPropertySubmission['status'],
      adminMessage: String(row['admin_message'] ?? row['rejection_reason'] ?? ''),
      createdAt: new Date(String(row['created_at'])),
      updatedAt: new Date(String(row['updated_at'])),
      publishedPropertyId: row['published_property_id']
        ? String(row['published_property_id'])
        : undefined,
    };
  }

  private mapNotification(row: Record<string, unknown>): PropertySubmissionNotification {
    return {
      id: String(row['id']),
      submissionId: String(row['submission_id']),
      kind: row['kind'] as PropertySubmissionNotification['kind'],
      message: String(row['message']),
      readAt: row['read_at'] ? new Date(String(row['read_at'])) : undefined,
      createdAt: new Date(String(row['created_at'])),
    };
  }
}
