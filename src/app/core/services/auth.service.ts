import { Service, computed, signal } from '@angular/core';
import { SUPABASE_CONFIG } from '../config/supabase.config';

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
  private readonly SESSION_KEY = 'rheodyce:supabase-session';
  private readonly KEY = 'rheodyce:isSubscriber';
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<SupabaseSession | null>(this.readSession());
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly isAdmin = computed(() => this.session()?.user.app_metadata?.['role'] === 'admin');
  readonly isSubscriber = signal<boolean>(Boolean(this.session()?.access_token) || this.read());

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this.hasSession.set(!!data.session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.hasSession.set(!!session);
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

  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email: email.trim(), password }),
    });
    await this.saveResponse(response, 'Identifiants invalides ou compte non confirmé.');
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

    this.storeSession(body as unknown as SupabaseSession);
  }

  signOut(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.KEY);
    this.session.set(null);
    this.isSubscriber.set(false);
  }

  private read(): boolean {
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

  private async saveResponse(response: Response, fallback: string): Promise<void> {
    const body = await this.parseResponse(response, fallback);
    if (!body['access_token']) {
      throw new Error(fallback);
    }
    this.storeSession(body as unknown as SupabaseSession);
  }

  private async parseResponse(response: Response, fallback: string): Promise<Record<string, unknown>> {
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(typeof body['msg'] === 'string' ? body['msg'] : typeof body['error_description'] === 'string' ? body['error_description'] : fallback);
    }
    return body;
  }

  private storeSession(session: SupabaseSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
    this.setSubscriber(true);
  }
}
