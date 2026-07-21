import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';

import { Header } from './header';

@Component({ template: '' })
class TestPage {}

const publicRoutes = [
  '/',
  '/annonces',
  '/location-vente',
  '/services',
  '/abonnement',
  '/faq',
  '/contact',
] as const;

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter(
          publicRoutes.map((path) => ({
            path: path.slice(1),
            component: TestPage,
          })),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose a working desktop link for every public section', async () => {
    const router = TestBed.inject(Router);
    const navigation = fixture.nativeElement.querySelector(
      'nav[aria-label="Navigation principale"]',
    ) as HTMLElement;

    for (const path of publicRoutes) {
      const link = navigation.querySelector(`a[href="${path}"]`) as HTMLAnchorElement | null;

      expect(link, `Lien manquant pour ${path}`).not.toBeNull();
      link?.click();
      await fixture.whenStable();
      expect(router.url).toBe(path);
    }
  });

  it('should expose the same destinations in the mobile menu', () => {
    const menuButton = fixture.nativeElement.querySelector(
      'button[aria-controls="mobile-navigation"]',
    ) as HTMLButtonElement;
    menuButton.click();
    fixture.detectChanges();

    const navigation = fixture.nativeElement.querySelector('#mobile-navigation') as HTMLElement;
    for (const path of publicRoutes) {
      expect(
        navigation.querySelector(`a[href="${path}"]`),
        `Lien mobile manquant pour ${path}`,
      ).not.toBeNull();
    }
  });
});
