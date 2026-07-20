import { Component, computed, inject, signal } from '@angular/core';
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
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly isHome = signal(this.isHomeUrl(this.router.url));
  protected readonly isMenuOpen = signal(false);
  protected readonly isProfileMenuOpen = signal(false);
  protected readonly profileImageUrl = computed(() => {
    const metadata = this.auth.session()?.user.user_metadata;
    const avatarUrl = metadata?.['avatar_url'] ?? metadata?.['picture'];
    return typeof avatarUrl === 'string' ? avatarUrl : '';
  });
  protected readonly userInitials = computed(() => {
    const name = this.auth.session()?.user.user_metadata?.['full_name'];
    const email = this.auth.userEmail();
    const label = typeof name === 'string' && name.trim() ? name : email;
    return (
      label
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'U'
    );
  });

  protected readonly navLinks = signal<NavLink[]>([
    { path: '/', label: 'Accueil' },
    { path: '/annonces', label: 'Annonces' },
    { path: '/location-vente', label: 'Location & Vente' },
    { path: '/services', label: 'Services' },
    { path: '/abonnement', label: 'Abonnement' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isHome.set(this.isHomeUrl(event.urlAfterRedirects));
        this.isMenuOpen.set(false);
        this.isProfileMenuOpen.set(false);
      });
  }

  protected toggleMenu(): void {
    this.isProfileMenuOpen.set(false);
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected toggleProfileMenu(): void {
    this.isMenuOpen.set(false);
    this.isProfileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    this.isProfileMenuOpen.set(false);
    this.isMenuOpen.set(false);
    await this.auth.signOut();
    await this.router.navigateByUrl('/connexion');
  }

  private isHomeUrl(url: string): boolean {
    return url.split('?')[0] === '/';
  }
}
