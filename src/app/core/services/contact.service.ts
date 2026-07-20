import { Service, inject } from '@angular/core';
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

  async submit(payload: ContactMessageDTO): Promise<void> {
    const { error } = await this.supabase.functions.invoke('contact-submit', {
      body: payload,
    });

    if (error) throw error;
  }
}
