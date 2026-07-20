import { Service, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { AuthService } from './auth.service';
import { CANCELLABLE_STATUSES, ServiceRequest } from '../../shared/models/service-request.model';

@Service()
export class ServiceRequestService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly requests = signal<ServiceRequest[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = this.auth.hasSession;

  async loadMyRequests(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.requests.set((data ?? []).map((row) => this.mapFromRow(row)));
    } catch {
      this.error.set('Impossible de charger vos demandes pour le moment.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getRequest(id: string): Promise<ServiceRequest | null> {
    const cached = this.requests().find((request) => request.id === id);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('service_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapFromRow(data);
  }

  canCancel(request: ServiceRequest): boolean {
    return CANCELLABLE_STATUSES.includes(request.status);
  }

  async cancelRequest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('service_requests')
      .update({ status: 'annulée' })
      .eq('id', id);

    if (error) throw error;

    this.requests.update((requests) =>
      requests.map((request) => (request.id === id ? { ...request, status: 'annulée' } : request)),
    );
  }

  private mapFromRow(row: Record<string, unknown>): ServiceRequest {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      serviceType: row['service_type'] as ServiceRequest['serviceType'],
      status: row['status'] as ServiceRequest['status'],
      clientName: row['client_name'] as string,
      clientEmail: row['client_email'] as string,
      clientPhone: row['client_phone'] as string,
      description: row['description'] as string,
      propertyId: (row['property_id'] as string) ?? undefined,
      budget: row['budget'] !== null ? Number(row['budget']) : undefined,
      assignedTo: (row['assigned_to'] as string) ?? undefined,
      notes: (row['notes'] as string) ?? undefined,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
      completedAt: row['completed_at'] ? new Date(row['completed_at'] as string) : undefined,
    };
  }
}
