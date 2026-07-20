import { Service, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { MovingRequest, MovingRequestInput } from '../../shared/models/moving-request.model';

interface ApiError {
  error?: string;
}

@Service()
export class MovingRequestService {
  private readonly auth = inject(AuthService);
  private readonly endpoint = `${SUPABASE_CONFIG.url}/functions/v1/create-moving-request`;

  async create(input: MovingRequestInput): Promise<MovingRequest> {
    return this.request<MovingRequest>('', {
      method: 'POST',
      body: JSON.stringify(this.toApiPayload(input)),
    });
  }

  async listMine(): Promise<MovingRequest[]> {
    return this.request<MovingRequest[]>('');
  }

  async listForAdmin(): Promise<MovingRequest[]> {
    return this.request<MovingRequest[]>('?scope=admin');
  }

  async assignForAdmin(id: string, assignedPartnerId: string, adminNotes: string, status = 'assignée'): Promise<MovingRequest> {
    return this.request<MovingRequest>('', {
      method: 'PATCH',
      body: JSON.stringify({ id, assigned_partner_id: assignedPartnerId, admin_notes: adminNotes, status: status === 'en attente' ? 'reçue' : status }),
    });
  }

  private async request<T>(suffix: string, init: RequestInit = {}): Promise<T> {
    const token = this.auth.accessToken();
    if (!token) {
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }

    const response = await fetch(`${this.endpoint}${suffix}`, {
      ...init,
      headers: {
        apikey: SUPABASE_CONFIG.publishableKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    const body = (await response.json().catch(() => ({}))) as T & ApiError;
    if (!response.ok) {
      throw new Error(body.error || 'Impossible de traiter cette demande.');
    }

    return body as T;
  }

  private toApiPayload(input: MovingRequestInput): Record<string, unknown> {
    return {
      departure_address: input.departureAddress.trim(),
      arrival_address: input.arrivalAddress.trim(),
      moving_date: input.movingDate,
      estimated_volume: input.estimatedVolume,
      floor: input.floor,
      has_elevator: input.hasElevator,
      departure_coordinates: input.departureCoordinates ?? null,
      arrival_coordinates: input.arrivalCoordinates ?? null,
      route_distance_km: input.routeDistanceKm ?? null,
      route_duration_minutes: input.routeDurationMinutes ?? null,
    };
  }
}
