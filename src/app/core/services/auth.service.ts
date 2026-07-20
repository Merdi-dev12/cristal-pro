import { Service, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { SupabaseClientService } from './supabase-client';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

interface StoredSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SupabaseUser;
}

interface AuthProfile {
  role?: string;
  is_subscriber?: boolean;
}

@Service()
export class AuthService {
  private readonly SESSION_KEY = 'rheodyce:supabase-session';
  private readonly KEY = 'rheodyce:isSubscriber';
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<Session | null>(this.readSession());
  readonly profile = signal<AuthProfile | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly hasSession = this.isAuthenticated;
  readonly isAdmin = computed(() => this.session()?.user.app_metadata?.['role'] === 'admin' || this.profile()?.role === 'admin');
  readonly isSubscriber = signal<boolean>(Boolean(this.session()) || this.readLegacySubscriber());

  async init(): Promise<void> {
    const existing = this.session();
    if (existing) {
      await this.syncSupabaseClientSession(existing as unknown as StoredSession);
    }

    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      this.setSession(data.session);
      await this.loadProfile(data.session.user.id);
    }
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.setSession(session);
      if (session) void this.loadProfile(session.user.id);
    });
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

  userId(): string {
    return this.session()?.user.id ?? '';
  }

  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const body = await this.parseResponse(response, 'Identifiants invalides ou compte non confirmé.');
    if (!body['access_token']) throw new Error('Identifiants invalides ou compte non confirmé.');

    await this.storeSession(body as unknown as StoredSession);
    await this.markProfileSubscriber();
    await this.loadProfile(this.userId());
  }

  async signUp(email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }> {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email: email.trim(), password, data: { full_name: fullName } }),
    });
    const body = await this.parseResponse(response, 'Impossible de créer le compte.');
    if (!body['access_token']) return { needsConfirmation: true };

    await this.storeSession(body as unknown as StoredSession);
    await this.markProfileSubscriber();
    await this.loadProfile(this.userId());
    return { needsConfirmation: false };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.KEY);
    this.profile.set(null);
    this.setSession(null);
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

  private readSession(): Session | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  private authHeaders(): HeadersInit {
    return { apikey: SUPABASE_CONFIG.publishableKey, 'Content-Type': 'application/json' };
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

  private async storeSession(stored: StoredSession): Promise<void> {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(stored));
    this.setSession(stored as unknown as Session);
    await this.syncSupabaseClientSession(stored);
  }

  private async syncSupabaseClientSession(stored: StoredSession): Promise<void> {
    if (!stored.refresh_token) return;
    await this.supabase.auth.setSession({
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
    });
  }

  private setSession(session: Session | null): void {
    this.session.set(session);
    this.isSubscriber.set(Boolean(session));
    if (!session) this.profile.set(null);
  }

  private async loadProfile(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('profiles')
      .select('role, is_subscriber')
      .eq('id', userId)
      .maybeSingle();

    if (!data) return;
    this.profile.set(data as AuthProfile);
    if (typeof data['is_subscriber'] === 'boolean') this.isSubscriber.set(data['is_subscriber']);
  }
}
