import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { subscriberGuard } from './subscriber.guard';

describe('subscriberGuard', () => {
  const isSubscriber = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isSubscriber } }],
    });
  });

  it('allows access when the subscription is active', () => {
    isSubscriber.set(true);

    const result = TestBed.runInInjectionContext(() =>
      subscriberGuard({} as never, { url: '/annonces/bien-1' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects to payment when the subscription is inactive', () => {
    isSubscriber.set(false);
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() =>
      subscriberGuard({} as never, { url: '/annonces/bien-1' } as never),
    );

    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/abonnement?access=subscription-required&redirect=%2Fannonces%2Fbien-1#plans',
    );
  });
});
