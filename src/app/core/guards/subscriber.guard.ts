import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const subscriberGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isSubscriber()
    ? true
    : router.createUrlTree(['/abonnement'], {
        queryParams: { access: 'subscription-required', redirect: state.url },
        fragment: 'plans',
      });
};
