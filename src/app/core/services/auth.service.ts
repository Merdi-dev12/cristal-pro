import { Service, computed, inject, signal } from '@angular/core';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { SupabaseClientService } from './supabase-client';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SupabaseUser;
}

@Service()
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<Session | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly hasSession = this.isAuthenticated;
  readonly hasSession = this.isAuthenticated;
  readonly isAdmin = computed(() => this.session()?.user.app_metadata?.['role'] === 'admin');
  readonly isSubscriber = signal<boolean>(Boolean(this.session()?.access_token) || this.read());

  constructor() {
    const existing = this.session();
    if (existing) {
      void this.syncSupabaseClientSession(existing);
    }
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
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const body = await this.parseResponse(response, 'Identifiants invalides ou compte non confirmé.');
    if (!body['access_token']) {
      throw new Error('Identifiants invalides ou compte non confirmé.');
    }

    await this.storeSession(body as unknown as SupabaseSession);
    await this.markProfileSubscriber();
  }

  /**
   * Retourne `needsConfirmation: true` quand Supabase Auth exige une confirmation par email
   * avant d'ouvrir une session (aucune erreur n'est levée dans ce cas, l'inscription a réussi).
   */
  async signUp(email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }> {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email: email.trim(), password, data: { full_name: fullName } }),
    });

    const body = await this.parseResponse(response, 'Impossible de créer le compte.');
    if (!body['access_token']) {
      return { needsConfirmation: true };
    }

    await this.storeSession(body as unknown as SupabaseSession);
    await this.markProfileSubscriber();
    return { needsConfirmation: false };
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.KEY);
    this.session.set(null);
    this.isSubscriber.set(false);
    await this.supabase.auth.signOut();
  }

  private async markProfileSubscriber(): Promise<void> {
    const userId = this.session()?.user.id;
    if (!userId) return;

    await this.supabase
      .from('profiles')
      .update({ is_subscriber: true, subscribed_at: new Date().toISOString() })
      .eq('id', userId);
  }

  private readLegacySubscriber(): boolean {
    try {
      return localStorage.getItem(this.KEY) === '1';
    } catch {
      return false;
    }
  }

  private readSession(): SupabaseSession | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? (JSON.parse(raw) as SupabaseSession) : null;
    } catch {
      return null;
    }
  }

  private authHeaders(): HeadersInit {
    return {
      apikey: SUPABASE_CONFIG.publishableKey,
      'Content-Type': 'application/json',
    };
  }

  private async parseResponse(response: Response, fallback: string): Promise<Record<string, unknown>> {
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(
        typeof body['msg'] === 'string'
          ? body['msg']
          : typeof body['error_description'] === 'string'
            ? body['error_description']
            : fallback,
      );
    }
    return body;
  }

  private async storeSession(session: SupabaseSession): Promise<void> {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
    this.setSubscriber(true);
    await this.syncSupabaseClientSession(session);
  }

  /**
   * Garde le client supabase-js (utilisé par RheodyceDataService/ServiceRequestService pour
   * les requêtes RLS) synchronisé avec la session obtenue via l'API Auth brute ci-dessus.
   * Sans cela, ces requêtes partiraient en tant qu'utilisateur anonyme malgré la connexion.
   */
  private async syncSupabaseClientSession(session: SupabaseSession): Promise<void> {
    if (!session.refresh_token) return;
    await this.supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
}
