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

  /**
   * Retourne `needsConfirmation: true` quand Supabase Auth exige une confirmation par email
   * avant d'ouvrir une session (aucune erreur n'est levée dans ce cas, l'inscription a réussi).
   */
  async signUp(email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    if (!data.session) {
      return { needsConfirmation: true };
    }

    await this.markProfileSubscriber();
    return { needsConfirmation: false };
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

    const body = await this.parseResponse(response, 'Impossible de créer le compte.');
    if (!body['access_token']) {
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
