import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[#f3f4f2] text-rheo-dark">
      <div class="flex min-h-screen">
        <aside
          class="fixed inset-y-0 left-0 z-40 flex w-[276px] -translate-x-full flex-col border-r border-[#e4e6e1] bg-[#f7f7f6] px-5 py-5 transition-transform lg:static lg:translate-x-0"
          [class.translate-x-0]="menuOpen()"
        >
          <div class="flex items-center justify-between px-2">
            <a routerLink="/admin" class="flex items-center gap-3" (click)="closeMenu()">
              <span class="flex size-10 items-center justify-center rounded-xl bg-rheo-dark text-lg font-bold text-rheo-accent">R</span>
              <span><span class="block text-sm font-bold tracking-wide">RHEODYCE</span><span class="block text-[10px] uppercase tracking-[0.22em] text-rheo-muted">Administration</span></span>
            </a>
            <button type="button" class="text-2xl text-rheo-muted lg:hidden" (click)="closeMenu()" aria-label="Fermer le menu">&times;</button>
          </div>

          <div class="mt-8 rounded-2xl border border-[#e6e7e4] bg-white p-3 shadow-[0_6px_24px_rgba(24,32,20,0.04)]">
            <div class="flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-xl bg-[#fff0db] text-sm font-bold text-[#b85b00]">ER</span>
              <div class="min-w-0"><p class="truncate text-sm font-semibold">Équipe RHEODYCE</p><p class="truncate text-xs text-rheo-muted">Administration centrale</p></div>
              <span class="ml-auto size-2 rounded-full bg-[#65a30d]"></span>
            </div>
          </div>

          <nav class="mt-8 flex-1" aria-label="Navigation admin">
            <p class="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca39a]">Espace de travail</p>
            <ul class="mt-3 grid gap-1">
              @for (item of navItems; track item.path) {
                <li>
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="bg-white font-semibold text-rheo-dark shadow-[0_4px_14px_rgba(24,32,20,0.05)]"
                    [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                    class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark"
                    (click)="closeMenu()"
                  >
                    <span class="flex size-7 items-center justify-center rounded-lg bg-[#ebeee9] text-xs font-bold" aria-hidden="true">{{ item.icon }}</span>
                    <span>{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>

            <p class="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca39a]">Raccourcis</p>
            <ul class="mt-3 grid gap-1">
              <li><a routerLink="/annonces" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark" (click)="closeMenu()"><span class="flex size-7 items-center justify-center rounded-lg bg-[#ebeee9] text-xs" aria-hidden="true">↗</span>Voir le site</a></li>
              <li><a routerLink="/contact" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark" (click)="closeMenu()"><span class="flex size-7 items-center justify-center rounded-lg bg-[#ebeee9] text-xs" aria-hidden="true">?</span>Support</a></li>
            </ul>
          </nav>

          <div class="border-t border-[#e4e6e1] pt-4">
            <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark" (click)="signOut()">
              <span class="flex size-7 items-center justify-center rounded-lg bg-[#ebeee9] text-xs" aria-hidden="true">↪</span>Se déconnecter
            </button>
          </div>
        </aside>

        @if (menuOpen()) { <button type="button" class="fixed inset-0 z-30 bg-black/25 lg:hidden" (click)="closeMenu()" aria-label="Fermer la navigation"></button> }

        <main class="min-w-0 flex-1">
          <header class="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e4e6e1] bg-[#f3f4f2]/90 px-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div class="flex items-center gap-3"><button type="button" class="flex size-10 items-center justify-center rounded-xl border border-[#dfe3dc] bg-white text-lg lg:hidden" (click)="toggleMenu()" aria-label="Ouvrir la navigation">☰</button><div><p class="text-xs font-semibold uppercase tracking-[0.18em] text-rheo-muted">Panel admin</p><p class="mt-0.5 text-sm font-semibold">Opérations RHEODYCE</p></div></div>
            <div class="flex items-center gap-3"><span class="hidden rounded-full border border-[#dfe3dc] bg-white px-4 py-2 text-xs text-rheo-muted sm:inline-flex">Données sécurisées</span><span class="flex size-10 items-center justify-center rounded-full bg-rheo-accent text-sm font-bold">ER</span></div>
          </header>
          <div class="px-4 py-7 sm:px-8 sm:py-9 lg:px-10"><router-outlet></router-outlet></div>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutPage {
  protected readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly navItems: AdminNavItem[] = [
    { path: '/admin', label: 'Vue d’ensemble', icon: '⌂', exact: true },
    { path: '/admin/visites', label: 'Demandes de visite', icon: '◎' },
    { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: '♙' },
    { path: '/admin/services', label: 'Demandes de services', icon: '▣' },
    { path: '/admin/demenagements', label: 'Déménagements', icon: '↗' },
    { path: '/admin/soumissions', label: 'Soumissions de biens', icon: '▤' },
    { path: '/admin/annonces', label: 'Annonces', icon: '⌑' },
  ];

  constructor() {
    void this.admin.load();
  }

  protected toggleMenu(): void { this.menuOpen.update((value) => !value); }
  protected closeMenu(): void { this.menuOpen.set(false); }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/connexion');
  }
}
