import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a clickable phone number', () => {
    const phoneLink = fixture.nativeElement.querySelector(
      'a[href="tel:+243974960149"]',
    ) as HTMLAnchorElement | null;

    expect(phoneLink).not.toBeNull();
    expect(phoneLink?.textContent?.trim()).toBe('+243 974 960 149');
  });

  it('should provide a clickable email address', () => {
    const emailLink = fixture.nativeElement.querySelector(
      'a[href="mailto:reh.tssimba@gmail.com"]',
    ) as HTMLAnchorElement | null;

    expect(emailLink).not.toBeNull();
    expect(emailLink?.textContent?.trim()).toBe('reh.tssimba@gmail.com');
  });

  it('should link every public navigation item to its route', () => {
    const expectedRoutes = [
      '/annonces',
      '/location-vente',
      '/contact',
      '/faq',
      '/demenagement',
      '/abonnement',
    ];

    for (const route of expectedRoutes) {
      const link = fixture.nativeElement.querySelector(
        `a[href="${route}"]`,
      ) as HTMLAnchorElement | null;
      expect(link, `Lien manquant pour ${route}`).not.toBeNull();
    }
  });
});
