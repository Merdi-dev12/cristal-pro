import { Component, HostListener, signal } from '@angular/core';

interface NavLink {
  readonly href: string;
  readonly label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
})
export class Header {
  protected readonly isScrolled = signal(false);
  protected readonly isMenuOpen = signal(false);
  protected readonly navLinks: readonly NavLink[] = [
    { href: '#services', label: 'Nos Services' },
    { href: '#about', label: 'Qui sommes-nous' },
    { href: '#services', label: 'Nos Services' },
    { href: '#contact', label: 'Contact' },
  ];

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 32);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }
}
