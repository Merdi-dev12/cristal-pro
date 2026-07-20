import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import type { SubscriptionPlan } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './subscription.html',
})
export class SubscriptionPage {
  private readonly subscription = inject(SubscriptionService);
  private readonly auth = inject(AuthService);

  protected readonly plans = this.subscription.plans;
  protected readonly isSubscriber = this.auth.isSubscriber;
  protected readonly activatedPlan = signal<string | null>(null);

  protected subscribe(plan: SubscriptionPlan): void {
    this.subscription.activateFake(plan);
    if (plan.id !== 'preview') this.activatedPlan.set(plan.id);
  }
}
