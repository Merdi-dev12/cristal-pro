import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminIcon, AdminIconName } from '../../shared/components/admin-icon/admin-icon';

interface AdminNavItem {
  path: string;
  label: string;
  icon: AdminIconName;
  exact?: boolean;
  badge?: 'visits' | 'services' | 'contacts' | 'submissions' | 'properties';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AdminIcon],
  template: `
    <div class="min-h-screen bg-[#f3f4f2] text-rheo-dark">
      <div class="flex min-h-screen">
        <aside
          class="fixed inset-y-0 left-0 z-40 flex w-[276px] -translate-x-full flex-col border-r border-[#e4e6e1] bg-[#f7f7f6] px-5 py-5 transition-transform lg:static lg:translate-x-0"
          [class.translate-x-0]="menuOpen()"
        >
          <div class="flex items-center justify-between px-2">
            <a routerLink="/admin" class="flex items-center gap-3" (click)="closeMenu()">
              <span
                class="flex size-10 items-center justify-center rounded-xl bg-rheo-dark text-lg font-bold text-rheo-accent"
                >R</span
              >
              <span
                ><span class="block text-sm font-bold tracking-wide">RHEODYCE</span
                ><span class="block text-[10px] uppercase tracking-[0.22em] text-rheo-muted"
                  >Administration</span
                ></span
              >
            </a>
            <button
              type="button"
              class="text-2xl text-rheo-muted lg:hidden"
              (click)="closeMenu()"
              aria-label="Fermer le menu"
            >
              &times;
            </button>
          </div>

          <div
            class="mt-8 rounded-2xl border border-[#e6e7e4] bg-white p-3 shadow-[0_6px_24px_rgba(24,32,20,0.04)]"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex size-10 items-center justify-center rounded-xl bg-[#fff0db] text-sm font-bold text-[#b85b00]"
                >ER</span
              >
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">Équipe RHEODYCE</p>
                <p class="truncate text-xs text-rheo-muted">Administration centrale</p>
              </div>
              <span class="ml-auto size-2 rounded-full bg-[#65a30d]"></span>
            </div>
          </div>

          <nav class="mt-8 flex-1" aria-label="Navigation admin">
            <p class="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca39a]">
              Espace de travail
            </p>
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
                    <span class="flex size-8 items-center justify-center rounded-lg bg-[#f0f2ed]"
                      ><app-admin-icon [name]="item.icon" className="size-5"
                    /></span>
                    <span>{{ item.label }}</span>
                    @if (item.badge && badgeCount(item.badge) > 0) {
                      <span
                        class="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-rheo-accent px-2 py-0.5 text-[10px] font-extrabold text-rheo-dark"
                        >{{ badgeCount(item.badge) > 99 ? '99+' : badgeCount(item.badge) }}</span
                      >
                    }
                  </a>
                </li>
              }
            </ul>

            <p class="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca39a]">
              Raccourcis
            </p>
            <ul class="mt-3 grid gap-1">
              <li>
                <a
                  routerLink="/annonces"
                  class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark"
                  (click)="closeMenu()"
                  ><span class="flex size-8 items-center justify-center rounded-lg bg-[#f0f2ed]"
                    ><app-admin-icon name="external" className="size-5" /></span
                  >Voir le site</a
                >
              </li>
              <li>
                <a
                  routerLink="/contact"
                  class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark"
                  (click)="closeMenu()"
                  ><span class="flex size-8 items-center justify-center rounded-lg bg-[#f0f2ed]"
                    ><app-admin-icon name="support" className="size-5" /></span
                  >Support</a
                >
              </li>
            </ul>
          </nav>

          <div class="border-t border-[#e4e6e1] pt-4">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#626a60] transition hover:bg-white hover:text-rheo-dark"
              (click)="signOut()"
              [disabled]="signingOut()"
            >
              <span class="flex size-8 items-center justify-center rounded-lg bg-[#f0f2ed]"
                ><app-admin-icon name="logout" className="size-5" /></span
              >{{ signingOut() ? 'Déconnexion…' : 'Se déconnecter' }}
            </button>
          </div>
        </aside>

        @if (menuOpen()) {
          <button
            type="button"
            class="fixed inset-0 z-30 bg-black/25 lg:hidden"
            (click)="closeMenu()"
            aria-label="Fermer la navigation"
          ></button>
        }

        <main class="min-w-0 flex-1">
          @if (admin.isLoading()) {
            <div class="fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-rheo-accent/25">
              <div class="h-full w-1/3 animate-pulse bg-rheo-accent"></div>
            </div>
          }
          <header
            class="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e4e6e1] bg-[#f3f4f2]/90 px-4 backdrop-blur-md sm:px-8 lg:px-10"
          >
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-xl border border-[#dfe3dc] bg-white text-lg lg:hidden"
                (click)="toggleMenu()"
                aria-label="Ouvrir la navigation"
              >
                ☰
              </button>
              <p class="text-sm font-semibold">Administration</p>
            </div>
            <span
              class="flex size-10 items-center justify-center rounded-full bg-rheo-accent text-sm font-bold"
              >ER</span
            >
          </header>
          <div class="px-4 py-7 sm:px-8 sm:py-9 lg:px-10"><router-outlet></router-outlet></div>
          @if (admin.loadError()) {
            <div
              class="mx-4 mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:mx-8 lg:mx-10"
            >
              <p class="font-semibold">Les données admin n’ont pas pu être chargées.</p>
              <p class="mt-1 break-words">{{ admin.loadError() }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white"
                  (click)="reload()"
                >
                  Réessayer
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold"
                  (click)="signOut()"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          }
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
  protected readonly signingOut = signal(false);
  private readonly badges = computed(() => ({
    visits: this.admin.visits().filter((item) => item.status === 'en attente' && !item.readAt)
      .length,
    services: this.admin
      .serviceRequests()
      .filter((item) => item.status !== 'terminée' && item.status !== 'annulée' && !item.readAt)
      .length,
    contacts: this.admin.contactMessages().filter((item) => item.status === 'new').length,
    submissions: this.admin
      .submissions()
      .filter(
        (item) =>
          (item.status === 'en attente' || item.status === 'informations requises') && !item.readAt,
      ).length,
    properties: this.admin.properties().filter((item) => item.status === 'draft' && !item.readAt)
      .length,
  }));
  protected readonly navItems: AdminNavItem[] = [
    { path: '/admin', label: 'Vue d’ensemble', icon: 'dashboard', exact: true },
    { path: '/admin/visites', label: 'Demandes de visite', icon: 'calendar', badge: 'visits' },
    { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'users' },
    { path: '/admin/services', label: 'Demandes de services', icon: 'tools', badge: 'services' },
    { path: '/admin/contacts', label: 'Demandes de contact', icon: 'mail', badge: 'contacts' },
    {
      path: '/admin/demenagements',
      label: 'Déménagements et aménagements',
      icon: 'truck',
    },
    {
      path: '/admin/soumissions',
      label: 'Soumissions de biens',
      icon: 'clipboard',
      badge: 'submissions',
    },
    { path: '/admin/annonces', label: 'Annonces', icon: 'home', badge: 'properties' },
  ];

  constructor() {
    void this.admin.load();
  }

  protected toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.auth.signOut();
      await this.router.navigateByUrl('/connexion');
    } finally {
      this.signingOut.set(false);
    }
  }

  protected async reload(): Promise<void> {
    await this.admin.load();
  }

  protected badgeCount(key: NonNullable<AdminNavItem['badge']>): number {
    return this.badges()[key];
  }
}
