import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import {
  AdminContactMessage,
  AdminDashboardStats,
  AdminProperty,
  AdminPropertyDraft,
  AdminServiceOffer,
  AdminServiceOfferDraft,
  AdminServiceRequestView,
  AdminUser,
  ContactMessageStatus,
  PropertySubmission,
  SubmissionDecision,
  SubmissionStatus,
  VisitRequest,
  VisitStatus,
} from '../../shared/models/admin.model';
import { PropertyCategory, PropertyType } from '../../shared/models/property.model';
import { RequestStatus, ServiceType } from '../../shared/models/service-request.model';

export type AdminReadableResource = 'visits' | 'services' | 'submissions' | 'properties';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly supabase = inject(SupabaseClientService).client;
  private hasLoaded = false;
  private loadedForUserId: string | null = null;

  readonly users = signal<AdminUser[]>([]);
  readonly properties = signal<AdminProperty[]>([]);
  readonly visits = signal<VisitRequest[]>([]);
  readonly serviceRequests = signal<AdminServiceRequestView[]>([]);
  readonly serviceOffers = signal<AdminServiceOffer[]>([]);
  readonly submissions = signal<PropertySubmission[]>([]);
  readonly contactMessages = signal<AdminContactMessage[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly actionMessage = signal('');
  readonly stats = computed<AdminDashboardStats>(() => ({
    properties: this.properties().length,
    users: this.users().length,
    subscribers: this.users().filter((user) => user.isSubscriber).length,
    requests: this.visits().length + this.serviceRequests().length + this.contactMessages().length,
    pendingVisits: this.visits().filter((visit) => visit.status === 'en attente').length,
    pendingSubmissions: this.submissions().filter(
      (submission) => submission.status === 'en attente',
    ).length,
  }));
  readonly recentVisits = computed(() => this.visits().slice(0, 4));
  readonly recentSubmissions = computed(() => this.submissions().slice(0, 4));
  readonly recentServiceRequests = computed(() => this.serviceRequests().slice(0, 4));

  async load(): Promise<void> {
    const userId = (await this.supabase.auth.getUser()).data.user?.id ?? null;
    if (!userId) return;
    if (this.hasLoaded && this.loadedForUserId === userId) return;
    this.hasLoaded = false;
    this.loadedForUserId = null;
    this.loadError.set('');
    this.isLoading.set(true);
    try {
      const [
        profileRows,
        propertyRows,
        serviceRows,
        visitRows,
        submissionRows,
        privateRows,
        offerRows,
        contactRows,
      ] = await Promise.all([
        this.loadRows('profiles'),
        this.loadRows('properties'),
        this.loadRows('service_requests'),
        this.loadRows('visit_requests'),
        this.loadRows('property_submissions'),
        this.loadRows('property_private_details'),
        this.loadRows('service_offers'),
        this.loadRows('contact_messages'),
      ]);
      const privateByProperty = new Map(
        privateRows.map((row) => [String(row['property_id']), String(row['sensitive_info'] ?? '')]),
      );
      this.users.set(profileRows.map(mapUser));
      this.properties.set(
        propertyRows.map((row) => ({
          ...mapProperty(row),
          sensitiveInfo: privateByProperty.get(String(row['id'])) ?? mapProperty(row).sensitiveInfo,
        })),
      );
      this.serviceRequests.set(serviceRows.map(mapServiceRequest));
      this.serviceOffers.set(offerRows.map(mapServiceOffer));
      this.visits.set(visitRows.map((row) => mapVisit(row, this.users(), this.properties())));
      this.submissions.set(submissionRows.map(mapSubmission));
      this.contactMessages.set(contactRows.map(mapContactMessage));
      this.loadedForUserId = userId;
    } catch (error) {
      this.users.set([]);
      this.properties.set([]);
      this.serviceRequests.set([]);
      this.serviceOffers.set([]);
      this.visits.set([]);
      this.submissions.set([]);
      this.contactMessages.set([]);
      this.loadError.set(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les données administratives.',
      );
    } finally {
      this.hasLoaded = this.loadedForUserId === userId;
      this.isLoading.set(false);
    }
  }

  async updateVisit(id: string, status: VisitStatus, internalNote: string): Promise<void> {
    await this.update('visit_requests', id, { status, internal_note: internalNote || null });
    this.visits.update((items) =>
      items.map((visit) => (visit.id === id ? { ...visit, status, internalNote } : visit)),
    );
    this.actionMessage.set('La demande de visite a été mise à jour.');
  }

  async updateContactMessage(id: string, status: ContactMessageStatus): Promise<void> {
    const updatedAt = new Date().toISOString();
    const previous = this.contactMessages().find((item) => item.id === id);
    this.contactMessages.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status, updatedAt } : item)),
    );
    try {
      await this.update('contact_messages', id, { status, updated_at: updatedAt });
      this.actionMessage.set('La demande de contact a été mise à jour.');
    } catch (error) {
      if (previous) {
        this.contactMessages.update((items) =>
          items.map((item) => (item.id === id ? previous : item)),
        );
      }
      throw error;
    }
  }

  async markAsRead(resource: AdminReadableResource, id: string): Promise<void> {
    const readAt = new Date().toISOString();
    const previousReadAt = this.readAt(resource, id);
    if (previousReadAt) return;

    this.setReadAt(resource, id, readAt);
    try {
      await this.update(this.tableFor(resource), id, { read_at: readAt });
    } catch (error) {
      if (this.readAt(resource, id) === readAt) this.setReadAt(resource, id, undefined);
      throw error;
    }
  }

  async toggleSubscription(user: AdminUser): Promise<void> {
    const isSubscriber = !user.isSubscriber;
    await this.update('profiles', user.id, {
      is_subscriber: isSubscriber,
      subscribed_at: isSubscriber ? new Date().toISOString() : null,
    });
    this.users.update((items) =>
      items.map((item) =>
        item.id === user.id
          ? {
              ...item,
              isSubscriber,
              role: item.role === 'admin' ? 'admin' : isSubscriber ? 'abonné' : 'utilisateur',
            }
          : item,
      ),
    );
    this.actionMessage.set(isSubscriber ? 'Abonnement activé.' : 'Abonnement désactivé.');
  }

  async updateServiceRequest(
    id: string,
    status: RequestStatus,
    assignedTo: string,
    notes: string,
  ): Promise<void> {
    await this.update('service_requests', id, {
      status,
      assigned_to: assignedTo || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    });
    this.serviceRequests.update((items) =>
      items.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              assignedTo: assignedTo || undefined,
              notes: notes || undefined,
              notificationPrepared: false,
              updatedAt: new Date(),
            }
          : request,
      ),
    );
    this.actionMessage.set('La demande de service a été mise à jour.');
  }

  async saveServiceOffer(draft: AdminServiceOfferDraft): Promise<void> {
    const payload = toServiceOfferRow(draft);
    if (draft.id) {
      await this.update('service_offers', draft.id, payload);
      this.serviceOffers.update((items) =>
        items.map((item) =>
          item.id === draft.id
            ? { ...item, ...toAdminServiceOffer(draft), id: draft.id, createdAt: item.createdAt }
            : item,
        ),
      );
    } else {
      const { data, error } = await this.supabase
        .from('service_offers')
        .insert(payload)
        .select('*')
        .single();
      if (error || !data) throw error ?? new Error('Impossible de créer le service.');
      this.serviceOffers.update((items) =>
        [...items, mapServiceOffer(data)].sort((a, b) => a.displayOrder - b.displayOrder),
      );
    }
    this.actionMessage.set('Le service a été enregistré.');
  }

  async deleteServiceOffer(offer: AdminServiceOffer): Promise<void> {
    const { error } = await this.supabase.from('service_offers').delete().eq('id', offer.id);
    if (error) throw error;
    this.serviceOffers.update((items) => items.filter((item) => item.id !== offer.id));
    this.actionMessage.set('Le service a été supprimé.');
  }

  async prepareNotification(
    kind: 'visite' | 'service',
    id: string,
    message: string,
  ): Promise<void> {
    const { error } = await this.supabase.functions.invoke('admin-prepare-notification', {
      body: { entity_type: kind, entity_id: id, message },
    });
    if (error) throw error;
    this.actionMessage.set('Notification enregistrée dans le backend.');
  }

  async decideSubmission(
    submission: PropertySubmission,
    action: 'approve' | 'reject' | 'request_details',
    message = '',
  ): Promise<void> {
    const { data, error } = await this.supabase.functions.invoke('review-property-submission', {
      body: { submission_id: submission.id, action, message },
    });
    if (error) throw error;
    const result = data as {
      status: SubmissionStatus;
      message: string;
      published_property_id?: string;
    };
    const decision: SubmissionDecision = {
      id: crypto.randomUUID(),
      status: result.status,
      reason: result.message,
      decidedBy: 'Équipe RHEODYCE',
      decidedAt: new Date().toISOString(),
    };
    this.submissions.update((items) =>
      items.map((item) =>
        item.id === submission.id
          ? {
              ...item,
              status: result.status,
              rejectionReason: result.message,
              publishedPropertyId: result.published_property_id,
              decisions: [decision, ...item.decisions],
            }
          : item,
      ),
    );
    this.actionMessage.set(
      action === 'approve'
        ? 'Annonce validée et publiée.'
        : action === 'request_details'
          ? 'Demande de précisions envoyée.'
          : 'Soumission refusée et utilisateur notifié.',
    );
  }

  async saveProperty(draft: AdminPropertyDraft): Promise<AdminProperty> {
    const payload = toPropertyRow(draft);
    if (draft.id) {
      await this.update('properties', draft.id, payload);
      const property = { ...toAdminProperty(draft), id: draft.id };
      this.properties.update((items) =>
        items.map((item) => (item.id === draft.id ? property : item)),
      );
      return property;
    } else {
      const { data, error } = await this.supabase
        .from('properties')
        .insert(payload)
        .select('*')
        .single();
      if (error || !data) throw error ?? new Error('Impossible de créer l’annonce.');
      const property = mapProperty(data);
      this.properties.update((items) => [property, ...items]);
      return property;
    }
  }

  async setPropertyStatus(property: AdminProperty, status: AdminProperty['status']): Promise<void> {
    await this.update('properties', property.id, { status });
    this.properties.update((items) =>
      items.map((item) => (item.id === property.id ? { ...item, status } : item)),
    );
  }
  async setPropertyVerified(property: AdminProperty, verified: boolean): Promise<void> {
    await this.update('properties', property.id, { verified });
    this.properties.update((items) =>
      items.map((item) => (item.id === property.id ? { ...item, verified } : item)),
    );
  }
  async deleteProperty(property: AdminProperty): Promise<void> {
    const { error } = await this.supabase.from('properties').delete().eq('id', property.id);
    if (error) throw error;
    this.properties.update((items) => items.filter((item) => item.id !== property.id));
  }
  async addPhotos(property: AdminProperty, files: File[]): Promise<AdminProperty> {
    const body = new FormData();
    body.set('action', 'upload');
    body.set('property_id', property.id);
    files.forEach((file) => body.append('images', file, file.name));
    const { data, error } = await this.supabase.functions.invoke('manage-property-images', {
      body,
    });
    if (error) throw error;
    const result = data as { photos: string[]; image_url: string };
    const updated = { ...property, photos: result.photos, imageUrl: result.image_url };
    this.properties.update((items) =>
      items.map((item) => (item.id === property.id ? updated : item)),
    );
    return updated;
  }
  async removePhoto(property: AdminProperty, photoUrl: string): Promise<void> {
    const body = new FormData();
    body.set('action', 'delete');
    body.set('property_id', property.id);
    body.set('photo_url', photoUrl);
    const { data, error } = await this.supabase.functions.invoke('manage-property-images', {
      body,
    });
    if (error) throw error;
    const result = data as { photos: string[]; image_url: string | null };
    this.properties.update((items) =>
      items.map((item) =>
        item.id === property.id
          ? { ...item, photos: result.photos, imageUrl: result.image_url ?? '' }
          : item,
      ),
    );
  }

  private async loadRows(table: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Record<string, unknown>[];
  }
  private async update(table: string, id: string, payload: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
  }

  private tableFor(resource: AdminReadableResource): string {
    switch (resource) {
      case 'visits':
        return 'visit_requests';
      case 'services':
        return 'service_requests';
      case 'submissions':
        return 'property_submissions';
      case 'properties':
        return 'properties';
    }
  }

  private readAt(resource: AdminReadableResource, id: string): string | undefined {
    switch (resource) {
      case 'visits':
        return this.visits().find((item) => item.id === id)?.readAt;
      case 'services':
        return this.serviceRequests().find((item) => item.id === id)?.readAt;
      case 'submissions':
        return this.submissions().find((item) => item.id === id)?.readAt;
      case 'properties':
        return this.properties().find((item) => item.id === id)?.readAt;
    }
  }

  private setReadAt(resource: AdminReadableResource, id: string, readAt: string | undefined): void {
    const updateItem = <T extends { id: string; readAt?: string }>(items: T[]): T[] =>
      items.map((item) => (item.id === id ? { ...item, readAt } : item));
    switch (resource) {
      case 'visits':
        this.visits.update(updateItem);
        break;
      case 'services':
        this.serviceRequests.update(updateItem);
        break;
      case 'submissions':
        this.submissions.update(updateItem);
        break;
      case 'properties':
        this.properties.update(updateItem);
        break;
    }
  }
}

function mapUser(row: Record<string, unknown>): AdminUser {
  const isSubscriber = Boolean(row['is_subscriber']);
  return {
    id: String(row['id'] ?? ''),
    name: String(row['full_name'] ?? row['email'] ?? 'Utilisateur'),
    email: String(row['email'] ?? ''),
    phone: String(row['phone'] ?? '—'),
    role: row['role'] === 'admin' ? 'admin' : isSubscriber ? 'abonné' : 'utilisateur',
    isSubscriber,
    joinedAt: String(row['created_at'] ?? ''),
  };
}
function mapProperty(row: Record<string, unknown>): AdminProperty {
  const photos = Array.isArray(row['photos']) ? row['photos'].map(String) : [];
  const imageUrl = String(row['image_url'] ?? photos[0] ?? '');
  return {
    id: String(row['id'] ?? ''),
    title: String(row['title'] ?? ''),
    price: Number(row['price'] ?? 0),
    priceSuffix: row['price_suffix'] ? String(row['price_suffix']) : undefined,
    location: String(row['location'] ?? ''),
    address: String(row['address'] ?? ''),
    bedrooms: Number(row['bedrooms'] ?? 0),
    bathrooms: Number(row['bathrooms'] ?? 0),
    surface: Number(row['surface'] ?? 0),
    type: row['type'] as PropertyType,
    category: row['category'] as PropertyCategory,
    imageUrl,
    photos: photos.length ? photos : imageUrl ? [imageUrl] : [],
    status: row['status'] as AdminProperty['status'],
    featured: Boolean(row['featured']),
    verified: Boolean(row['verified']),
    description: String(row['description'] ?? ''),
    latitude: row['latitude'] == null ? undefined : Number(row['latitude']),
    longitude: row['longitude'] == null ? undefined : Number(row['longitude']),
    sensitiveInfo: '',
    ownerName: String(row['owner_name'] ?? '—'),
    readAt: row['read_at'] ? String(row['read_at']) : undefined,
    createdAt: String(row['created_at'] ?? ''),
  };
}
function mapServiceRequest(row: Record<string, unknown>): AdminServiceRequestView {
  return {
    id: String(row['id']),
    source: 'service',
    userId: String(row['user_id']),
    serviceType: row['service_type'] as ServiceType,
    status: row['status'] as RequestStatus,
    clientName: String(row['client_name'] ?? ''),
    clientEmail: String(row['client_email'] ?? ''),
    clientPhone: String(row['client_phone'] ?? ''),
    description: String(row['description'] ?? ''),
    details:
      row['details'] && typeof row['details'] === 'object' && !Array.isArray(row['details'])
        ? (row['details'] as AdminServiceRequestView['details'])
        : {},
    propertyId: row['property_id'] ? String(row['property_id']) : undefined,
    budget: row['budget'] == null ? undefined : Number(row['budget']),
    assignedTo: row['assigned_to'] ? String(row['assigned_to']) : undefined,
    notes: row['notes'] ? String(row['notes']) : undefined,
    createdAt: new Date(String(row['created_at'])),
    updatedAt: new Date(String(row['updated_at'])),
    completedAt: row['completed_at'] ? new Date(String(row['completed_at'])) : undefined,
    notificationPrepared: Boolean(row['notification_prepared']),
    readAt: row['read_at'] ? String(row['read_at']) : undefined,
  };
}
function mapServiceOffer(row: Record<string, unknown>): AdminServiceOffer {
  return {
    id: String(row['id'] ?? ''),
    slug: String(row['slug'] ?? ''),
    title: String(row['title'] ?? ''),
    eyebrow: String(row['eyebrow'] ?? ''),
    description: String(row['description'] ?? ''),
    icon: String(row['icon'] ?? '✦'),
    cta: String(row['cta'] ?? ''),
    displayOrder: Number(row['display_order'] ?? 0),
    active: Boolean(row['active']),
    createdAt: String(row['created_at'] ?? ''),
  };
}
function mapVisit(
  row: Record<string, unknown>,
  users: AdminUser[],
  properties: AdminProperty[],
): VisitRequest {
  const user = users.find((item) => item.id === row['user_id']);
  const property = properties.find((item) => item.id === row['property_id']);
  return {
    id: String(row['id']),
    userId: String(row['user_id']),
    userName: user?.name ?? 'Utilisateur',
    userEmail: user?.email ?? '',
    propertyId: String(row['property_id']),
    propertyTitle: property?.title ?? 'Annonce',
    propertyLocation: property?.location ?? '',
    propertyImageUrl: property?.imageUrl ?? '',
    requestedDate: String(row['requested_date']),
    requestedTime: String(row['requested_time']),
    status: row['status'] as VisitStatus,
    message: String(row['message'] ?? ''),
    internalNote: String(row['internal_note'] ?? ''),
    notificationPrepared: Boolean(row['notification_prepared']),
    readAt: row['read_at'] ? String(row['read_at']) : undefined,
    createdAt: String(row['created_at']),
  };
}
function mapSubmission(row: Record<string, unknown>): PropertySubmission {
  return {
    id: String(row['id']),
    ownerName: String(row['owner_name']),
    ownerEmail: String(row['owner_email']),
    title: String(row['title']),
    category: row['category'] as PropertyCategory,
    type: row['type'] as PropertyType,
    city: String(row['city']),
    address: String(row['address']),
    price: Number(row['price']),
    surface: Number(row['surface']),
    latitude: Number(row['latitude']),
    longitude: Number(row['longitude']),
    description: String(row['description']),
    photos: Array.isArray(row['photos']) ? row['photos'].map(String) : [],
    documents: Array.isArray(row['documents']) ? row['documents'].map(String) : [],
    status: row['status'] as SubmissionStatus,
    rejectionReason: String(row['rejection_reason'] ?? ''),
    submittedAt: String(row['created_at']),
    decisions: [],
    readAt: row['read_at'] ? String(row['read_at']) : undefined,
  };
}
function mapContactMessage(row: Record<string, unknown>): AdminContactMessage {
  return {
    id: String(row['id']),
    userId: row['user_id'] ? String(row['user_id']) : undefined,
    fullName: String(row['full_name'] ?? ''),
    email: String(row['email'] ?? ''),
    city: String(row['city'] ?? ''),
    need: String(row['need'] ?? 'Autre demande'),
    message: String(row['message'] ?? ''),
    status: row['status'] as AdminContactMessage['status'],
    notificationStatus: (row['notification_status'] ??
      'pending') as AdminContactMessage['notificationStatus'],
    notificationError: row['notification_error'] ? String(row['notification_error']) : undefined,
    notifiedAt: row['notified_at'] ? String(row['notified_at']) : undefined,
    createdAt: String(row['created_at'] ?? ''),
    updatedAt: String(row['updated_at'] ?? row['created_at'] ?? ''),
  };
}
function toAdminProperty(draft: AdminPropertyDraft): AdminProperty {
  return {
    ...draft,
    id: draft.id ?? '',
    price: Number(draft.price) || 0,
    surface: Number(draft.surface) || 0,
    bedrooms: Number(draft.bedrooms) || 0,
    bathrooms: Number(draft.bathrooms) || 0,
    priceSuffix: draft.priceSuffix || undefined,
    createdAt: new Date().toISOString(),
  };
}
function toPropertyRow(draft: AdminPropertyDraft): Record<string, unknown> {
  return {
    title: draft.title,
    price: Number(draft.price) || 0,
    price_suffix: draft.priceSuffix || null,
    location: draft.location,
    address: draft.address,
    bedrooms: Number(draft.bedrooms) || 0,
    bathrooms: Number(draft.bathrooms) || 0,
    surface: Number(draft.surface) || 0,
    type: draft.type,
    category: draft.category,
    image_url: draft.imageUrl || null,
    photos: draft.photos,
    status: draft.status,
    featured: draft.featured,
    verified: draft.verified,
    description: draft.description,
    latitude: draft.latitude ?? null,
    longitude: draft.longitude ?? null,
    owner_name: draft.ownerName || null,
  };
}
function toAdminServiceOffer(draft: AdminServiceOfferDraft): AdminServiceOffer {
  return {
    id: draft.id ?? '',
    slug: draft.slug.trim().toLowerCase(),
    title: draft.title.trim(),
    eyebrow: draft.eyebrow.trim(),
    description: draft.description.trim(),
    icon: draft.icon.trim() || '✦',
    cta: draft.cta.trim(),
    displayOrder: Number(draft.displayOrder) || 0,
    active: draft.active,
    createdAt: new Date().toISOString(),
  };
}
function toServiceOfferRow(draft: AdminServiceOfferDraft): Record<string, unknown> {
  const offer = toAdminServiceOffer(draft);
  return {
    slug: offer.slug,
    title: offer.title,
    eyebrow: offer.eyebrow,
    description: offer.description,
    icon: offer.icon,
    cta: offer.cta,
    display_order: offer.displayOrder,
    active: offer.active,
  };
}
