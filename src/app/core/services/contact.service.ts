import { Service, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseClientService } from './supabase-client';

export interface ContactMessageDTO {
  full_name: string;
  email: string;
  city: string;
  need: string;
  message: string;
}

@Service()
export class ContactService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  async submit(payload: ContactMessageDTO): Promise<void> {
    const { error } = await this.supabase.functions.invoke('contact-submit', {
      body: payload,
    });

    if (error) throw error;

    const userId = this.auth.userId();
    if (!userId) return;

    const { error: requestError } = await this.supabase
      .from('contact_requests')
      .insert({
        user_id: userId,
        full_name: payload.full_name,
        email: payload.email,
        city: payload.city || null,
        need: payload.need,
        message: payload.message,
      });

    if (requestError) throw requestError;
  }
}
