import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  readonly route: string;
  readonly fragment?: string;
  readonly label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class Header {
  protected readonly isScrolled = signal(typeof window !== 'undefined' && window.location.pathname !== '/');
  protected readonly isMenuOpen = signal(false);
  protected readonly navLinks: readonly NavLink[] = [
    { route: '/', fragment: 'about', label: 'Qui sommes-nous ?' },
    { route: '/', fragment: 'services', label: 'Nos Services' },
    { route: '/prestations', label: 'Prestations' },
    { route: '/', fragment: 'faq', label: 'FAQ' },
    { route: '/contact', label: 'Contact' },
  ];

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isScrolled.set(window.location.pathname !== '/' || window.scrollY > 32);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }
}
