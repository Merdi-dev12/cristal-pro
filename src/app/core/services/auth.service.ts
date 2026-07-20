import { Service, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

@Service()
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';
  private readonly supabase = inject(SupabaseClientService).client;

  readonly isSubscriber = signal<boolean>(this.read());

  constructor() {
    // no-op
  }

  setSubscriber(value: boolean): void {
    localStorage.setItem(this.KEY, value ? '1' : '0');
    this.isSubscriber.set(value);
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.markProfileSubscriber();
  }

  async signUp(email: string, password: string, fullName: string): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    await this.markProfileSubscriber();
  }

  private async markProfileSubscriber(): Promise<void> {
    const { data } = await this.supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    await this.supabase
      .from('profiles')
      .update({ is_subscriber: true, subscribed_at: new Date().toISOString() })
      .eq('id', user.id);

    this.setSubscriber(true);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(this.KEY) === '1';
    } catch {
      return false;
    }
  }
}
