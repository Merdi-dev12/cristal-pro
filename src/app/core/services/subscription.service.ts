import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseClientService } from './supabase-client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export interface SubscriptionRequest {
  id: string;
  planId: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseClientService).client;

  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly isLoading = signal(false);

  async loadPlans(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.from('subscription_plans').select('*').eq('active', true).order('display_order');
      if (error) throw error;
      this.plans.set((data ?? []).map((row) => ({
        id: String(row['slug']), name: String(row['name']), price: Number(row['price']), period: String(row['period']),
        description: String(row['description']), features: Array.isArray(row['features']) ? row['features'].map(String) : [],
        highlighted: Boolean(row['highlighted']), badge: row['badge'] ? String(row['badge']) : undefined,
      })));
    } finally {
      this.isLoading.set(false);
    }
  }

  async requestSubscription(plan: SubscriptionPlan): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('Connectez-vous pour demander un abonnement.');
    if (plan.price === 0) return;
    const { error } = await this.supabase.from('subscription_requests').insert({ user_id: userId, plan_slug: plan.id });
    if (error) throw error;
  }
}
