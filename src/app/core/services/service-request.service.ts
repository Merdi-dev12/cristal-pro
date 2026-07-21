import { Service, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { AuthService } from './auth.service';
import {
  CANCELLABLE_STATUSES,
  CreateServiceRequestInput,
  ServiceRequest,
  ServiceRequestDocument,
  ServiceRequestEvent,
} from '../../shared/models/service-request.model';

const DOCUMENT_BUCKET = 'service-request-documents';

@Service()
export class ServiceRequestService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly requests = signal<ServiceRequest[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = this.auth.hasSession;

  async createRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('Connectez-vous pour envoyer une demande.');
    const requestId = crypto.randomUUID();
    const uploadedDocuments: ServiceRequestDocument[] = [];

    try {
      for (const file of input.documents ?? []) {
        const path = `${userId}/${requestId}/${crypto.randomUUID()}-${this.safeFileName(file.name)}`;
        const { error: uploadError } = await this.supabase.storage
          .from(DOCUMENT_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedDocuments.push({ path, name: file.name, mimeType: file.type, size: file.size });
      }

      const { data, error } = await this.supabase.functions.invoke('create-service-request', {
        body: {
          request_id: requestId,
          service_type: input.serviceType,
          client_name: input.clientName.trim(),
          client_email: input.clientEmail.trim(),
          client_phone: input.clientPhone.trim(),
          description: input.description.trim(),
          details: input.details,
          budget: input.budget ?? null,
          documents: uploadedDocuments,
        },
      });

      if (error) throw error;
      const request = this.mapFromRow(data as Record<string, unknown>);
      this.requests.update((requests) => [request, ...requests]);
      return request;
    } catch (error) {
      if (uploadedDocuments.length) {
        await this.supabase.storage
          .from(DOCUMENT_BUCKET)
          .remove(uploadedDocuments.map((document) => document.path));
      }
      throw error;
    }
  }

  async getDocumentUrl(document: ServiceRequestDocument): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(document.path, 120);
    if (error) throw error;
    return data.signedUrl;
  }

  async loadMyRequests(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const userId = this.auth.userId();
      if (!userId) {
        this.requests.set([]);
        return;
      }

      const { data, error } = await this.supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const [moving, submissions, contacts] = await Promise.all([
        this.supabase.from('moving_requests').select('*').eq('user_id', userId),
        this.supabase.from('property_submissions').select('*').eq('owner_id', userId),
        this.supabase.from('contact_messages').select('*').eq('user_id', userId),
      ]);
      if (moving.error) throw moving.error;
      if (submissions.error) throw submissions.error;
      if (contacts.error) throw contacts.error;

      this.requests.set(
        [
          ...(data ?? []).map((row: Record<string, unknown>) => this.mapFromRow(row)),
          ...(moving.data ?? []).map((row: Record<string, unknown>) => this.mapMovingRequest(row)),
          ...(submissions.data ?? []).map((row: Record<string, unknown>) =>
            this.mapPropertySubmission(row),
          ),
          ...(contacts.data ?? []).map((row: Record<string, unknown>) =>
            this.mapContactRequest(row),
          ),
        ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
      );
    } catch {
      this.error.set('Impossible de charger vos demandes pour le moment.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getRequest(id: string): Promise<ServiceRequest | null> {
    const cached = this.requests().find((request) => request.id === id);
    if (cached) return cached;

    const userId = this.auth.userId();
    if (!userId) return null;

    const { data, error } = await this.supabase
      .from('service_requests')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapFromRow(data as Record<string, unknown>);
  }

  async getRequestEvents(id: string): Promise<ServiceRequestEvent[]> {
    const { data, error } = await this.supabase
      .from('service_request_events')
      .select('id, service_request_id, status, message, created_at')
      .eq('service_request_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row['id']),
      requestId: String(row['service_request_id']),
      status: row['status'] as ServiceRequestEvent['status'],
      message: String(row['message'] ?? ''),
      createdAt: new Date(String(row['created_at'])),
    }));
  }

  canCancel(request: ServiceRequest): boolean {
    return CANCELLABLE_STATUSES.includes(request.status);
  }

  async cancelRequest(id: string): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('Session utilisateur introuvable.');

    const { error } = await this.supabase
      .from('service_requests')
      .update({ status: 'annulée' })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    this.requests.update((requests) =>
      requests.map((request) => (request.id === id ? { ...request, status: 'annulée' } : request)),
    );
  }

  private mapFromRow(row: Record<string, unknown>): ServiceRequest {
    return {
      id: row['id'] as string,
      source: 'service',
      userId: row['user_id'] as string,
      serviceType: row['service_type'] as ServiceRequest['serviceType'],
      status: row['status'] as ServiceRequest['status'],
      clientName: row['client_name'] as string,
      clientEmail: row['client_email'] as string,
      clientPhone: row['client_phone'] as string,
      description: row['description'] as string,
      details: this.toDetails(row['details']),
      documents: this.toDocuments(row['documents']),
      propertyId: (row['property_id'] as string) ?? undefined,
      budget: row['budget'] !== null ? Number(row['budget']) : undefined,
      assignedTo: (row['assigned_to'] as string) ?? undefined,
      notes: (row['notes'] as string) ?? undefined,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
      completedAt: row['completed_at'] ? new Date(row['completed_at'] as string) : undefined,
    };
  }

  private mapMovingRequest(row: Record<string, unknown>): ServiceRequest {
    return {
      id: String(row['id']),
      source: 'moving',
      userId: String(row['user_id']),
      serviceType: 'demenagement',
      status: this.toRequestStatus(row['status']),
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: `Déménagement de ${String(row['departure_address'])} à ${String(row['arrival_address'])}`,
      details: {},
      documents: [],
      notes: row['admin_notes'] ? String(row['admin_notes']) : undefined,
      createdAt: new Date(String(row['created_at'])),
      updatedAt: new Date(String(row['updated_at'])),
    };
  }

  private mapPropertySubmission(row: Record<string, unknown>): ServiceRequest {
    return {
      id: String(row['id']),
      source: 'property-submission',
      userId: String(row['owner_id']),
      serviceType: 'annonce',
      status: this.toRequestStatus(row['status']),
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: `Annonce proposée : ${String(row['title'])}`,
      details: {},
      documents: [],
      notes: row['admin_message'] ? String(row['admin_message']) : undefined,
      createdAt: new Date(String(row['created_at'])),
      updatedAt: new Date(String(row['updated_at'])),
    };
  }

  private mapContactRequest(row: Record<string, unknown>): ServiceRequest {
    return {
      id: String(row['id']),
      source: 'contact',
      userId: String(row['user_id']),
      serviceType: 'contact',
      status: this.toRequestStatus(row['status']),
      clientName: String(row['full_name']),
      clientEmail: String(row['email']),
      clientPhone: '',
      description: `${String(row['need'])} : ${String(row['message'])}`,
      details: {},
      documents: [],
      createdAt: new Date(String(row['created_at'])),
      updatedAt: new Date(String(row['updated_at'])),
    };
  }

  private toRequestStatus(value: unknown): ServiceRequest['status'] {
    switch (String(value)) {
      case 'terminée':
      case 'publiée':
        return 'terminée';
      case 'annulée':
      case 'refusée':
        return 'annulée';
      case 'en traitement':
      case 'informations requises':
        return 'en traitement';
      case 'assignée':
        return 'assignée';
      default:
        return 'reçue';
    }
  }

  private toDetails(value: unknown): ServiceRequest['details'] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value as ServiceRequest['details'];
  }

  private toDocuments(value: unknown): ServiceRequestDocument[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      if (!row['path'] || !row['name']) return [];
      return [
        {
          path: String(row['path']),
          name: String(row['name']),
          mimeType: String(row['mimeType'] ?? ''),
          size: Number(row['size'] ?? 0),
        },
      ];
    });
  }

  private safeFileName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(-120);
  }
}
