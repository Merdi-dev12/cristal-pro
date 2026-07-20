import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

interface AuthProfile {
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  is_subscriber?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<Session | null>(null);
  readonly profile = signal<AuthProfile | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly hasSession = this.isAuthenticated;
  readonly isAdmin = computed(
    () =>
      this.session()?.user.app_metadata?.['role'] === 'admin' || this.profile()?.role === 'admin',
  );
  readonly isSubscriber = computed(() => this.profile()?.is_subscriber === true);

  async init(): Promise<void> {
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

  /**
   * Redirige vers Google. Au retour, `onAuthStateChange` (ci-dessus) adopte automatiquement
   * la session créée par supabase-js — aucune action supplémentaire n'est nécessaire ici.
   */
  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    this.setSession(data.session);
    await this.loadProfile(data.user.id);
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.session || !data.user) return { needsConfirmation: true };
    this.setSession(data.session);
    await this.loadProfile(data.user.id);
    return { needsConfirmation: false };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.profile.set(null);
    this.setSession(null);
  }

  async updateProfile(fullName: string, phone: string): Promise<void> {
    const userId = this.userId();
    if (!userId) throw new Error('Session utilisateur introuvable.');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const { error } = await this.supabase
      .from('profiles')
      .update({
        full_name: cleanName,
        phone: cleanPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    const { error: authError } = await this.supabase.auth.updateUser({
      data: { full_name: cleanName },
    });
    if (authError) throw authError;

    this.profile.update((profile) => ({
      ...(profile ?? {}),
      full_name: cleanName,
      phone: cleanPhone,
    }));
  }

  private setSession(session: Session | null): void {
    const previousUserId = this.session()?.user.id;
    const nextUserId = session?.user.id;
    this.session.set(session);
    if (!session || previousUserId !== nextUserId) this.profile.set(null);
  }

  private async loadProfile(userId: string): Promise<void> {
    this.profile.set(null);
    const { data } = await this.supabase
      .from('profiles')
      .select('email, full_name, phone, role, is_subscriber')
      .eq('id', userId)
      .maybeSingle();

    if (!data || this.session()?.user.id !== userId) return;
    this.profile.set(data as AuthProfile);
  }
}
