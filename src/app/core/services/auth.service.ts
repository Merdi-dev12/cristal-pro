import { Service, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

@Service()
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<Session | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly hasSession = this.isAuthenticated;
  readonly isAdmin = computed(() => this.session()?.user.app_metadata?.['role'] === 'admin');
  readonly isSubscriber = signal<boolean>(this.readLegacySubscriber());

  async init(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.setSession(data.session);
    this.supabase.auth.onAuthStateChange((_event, session) => this.setSession(session));
  }

  setSubscriber(value: boolean): void {
    localStorage.setItem(this.KEY, value ? '1' : '0');
    this.isSubscriber.set(value);
  }

  accessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  userEmail(): string {
    return this.session()?.user.email ?? '';
  }

  async signIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) {
      throw new Error(error?.message || 'Identifiants invalides ou compte non confirmé.');
    }
    this.setSession(data.session);
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    });
    if (error) throw new Error(error.message || 'Impossible de créer le compte.');
    if (!data.session) {
      throw new Error('Compte créé. Vérifiez votre adresse email avant de vous connecter.');
    }
    this.setSession(data.session);
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    localStorage.removeItem(this.KEY);
    this.setSession(null);
  }

  private readLegacySubscriber(): boolean {
    try {
      return localStorage.getItem(this.KEY) === '1';
    } catch {
      return false;
    }
  }

  private setSession(session: Session | null): void {
    this.session.set(session);
    this.isSubscriber.set(Boolean(session));
  }
}
