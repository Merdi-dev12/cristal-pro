import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

interface NavLink {
  readonly route: string;
  readonly key: string;
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
  readonly #router = inject(Router);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isScrolled = signal(typeof window !== 'undefined' && window.location.pathname !== '/');
  protected readonly activeNav = signal('');
  protected readonly isMenuOpen = signal(false);
  protected readonly navLinks: readonly NavLink[] = [
    { route: '/', key: 'about', fragment: 'about', label: 'Qui sommes-nous ?' },
    { route: '/', key: 'services', fragment: 'services', label: 'Nos Services' },
    { route: '/prestations', key: 'prestations', label: 'Prestations' },
    { route: '/', key: 'faq', fragment: 'faq', label: 'FAQ' },
    { route: '/contact', key: 'contact', label: 'Contact' },
  ];

  constructor() {
    this.#router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.syncAppearance());
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.syncAppearance();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Node && !this.#host.nativeElement.contains(target)) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  protected isActive(link: NavLink): boolean {
    return this.activeNav() === link.key;
  }

  private syncAppearance(): void {
    this.isScrolled.set(window.location.pathname !== '/' || window.scrollY > 32);

    const path = this.#router.url.split(/[?#]/, 1)[0];
    if (path === '/prestations') {
      this.activeNav.set('prestations');
      return;
    }
    if (path === '/contact' || path === '/devis') {
      this.activeNav.set('contact');
      return;
    }

    const fragment = this.#router.parseUrl(this.#router.url).fragment;
    let active = ['about', 'services', 'faq'].includes(fragment ?? '') ? fragment ?? '' : '';
    for (const section of ['about', 'services', 'faq']) {
      const element = document.getElementById(section);
      if (element && element.getBoundingClientRect().top <= Math.min(180, window.innerHeight * 0.3)) {
        active = section;
      }
    }
    this.activeNav.set(active);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }
}
