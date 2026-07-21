import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import type { SubscriptionPlan } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './subscription.html',
})
export class SubscriptionPage implements OnInit {
  private readonly subscription = inject(SubscriptionService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly plans = this.subscription.plans;
  protected readonly isSubscriber = this.auth.isSubscriber;
  protected readonly requestedPlan = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly accessRequired =
    this.route.snapshot.queryParamMap.get('access') === 'subscription-required';

  async ngOnInit(): Promise<void> {
    await this.subscription.loadPlans();
  }

  protected async subscribe(plan: SubscriptionPlan): Promise<void> {
    this.error.set('');
    try {
      await this.subscription.requestSubscription(plan);
      if (plan.price > 0) this.requestedPlan.set(plan.id);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Impossible d’enregistrer votre demande.',
      );
    }
  }
}
