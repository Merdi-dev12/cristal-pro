import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Scroll } from '../../core/services/scroll';
import { AuthService } from '../../core/services/auth.service';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  private readonly scrollService = inject(Scroll);
  private readonly auth = inject(AuthService);
  protected readonly isScrolled = this.scrollService.isScrolled;
  protected readonly hasSession = this.auth.hasSession;
  protected readonly isHome = signal(this.isHomeUrl(this.router.url));

  protected readonly navLinks = signal<NavLink[]>([
    { path: '/', label: 'Accueil' },
    { path: '/annonces', label: 'Annonces' },
    { path: '/location-vente', label: 'Location & Vente' },
    { path: '/services', label: 'Services' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ]);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isHome.set(this.isHomeUrl(event.urlAfterRedirects));
    });
  }

  private isHomeUrl(url: string): boolean {
    return url.split('?')[0] === '/';
  }
}
