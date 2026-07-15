import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Scroll } from '../../core/services/scroll'; 


interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html'
})
export class Header {
  private readonly scrollService = inject(Scroll);
  protected readonly isScrolled = this.scrollService.isScrolled;

  protected readonly navLinks = signal<NavLink[]>([
    { path: '/', label: 'Accueil' },
    { path: '/about', label: 'A propos' },
    { path: '/annonces', label: 'Annonces' },
    { path: '/services', label: 'Services' },
    { path: '/tarifs', label: 'Tarifs' }
  ]);
}