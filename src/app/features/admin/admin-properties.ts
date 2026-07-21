import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminProperty } from '../../shared/models/admin.model';
import { AdminIcon } from '../../shared/components/admin-icon/admin-icon';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminIcon],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">Annonces</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Gestion des annonces</h1>
        </div>
        <a
          routerLink="/admin/annonces/nouvelle"
          class="inline-flex w-fit items-center gap-2 rounded-xl bg-rheo-dark px-5 py-3 text-sm font-semibold text-white"
          ><app-admin-icon name="plus" className="size-5" />Créer une annonce</a
        >
      </header>
      <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
        <div class="flex flex-wrap gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
          <label class="relative min-w-[240px] flex-1"
            ><span class="absolute left-3 top-3 text-rheo-muted"
              ><app-admin-icon name="search" className="size-5" /></span
            ><input
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              class="h-11 w-full rounded-xl border border-[#dfe3dc] pl-9 pr-3 text-sm"
              placeholder="Titre, ville, adresse, propriétaire…" /></label
          ><select
            [ngModel]="status()"
            (ngModelChange)="status.set($event)"
            class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivées</option></select
          ><select
            [ngModel]="type()"
            (ngModelChange)="type.set($event)"
            class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
          >
            <option value="all">Vente et location</option>
            <option value="vente">Vente</option>
            <option value="location">Location</option></select
          ><span class="self-center text-xs text-rheo-muted"
            >{{ filtered().length }} résultat(s)</span
          >
        </div>
        @if (admin.isLoading()) {
          <div class="grid gap-3 p-5">
            @for (i of [1, 2, 3]; track i) {
              <div class="h-24 animate-pulse rounded-xl bg-[#f0f2ee]"></div>
            }
          </div>
        } @else {
          <div class="divide-y divide-[#edf0eb]">
            @for (item of filtered(); track item.id) {
              <a
                [routerLink]="['/admin/annonces', item.id]"
                class="group flex items-center gap-4 px-5 py-5 transition hover:bg-[#fafbf9] sm:px-6"
                ><img
                  [src]="item.imageUrl || '/assets/hero_img.png'"
                  alt=""
                  class="size-20 shrink-0 rounded-xl object-cover" /><span class="min-w-0 flex-1"
                  ><span class="flex flex-wrap items-center gap-2"
                    ><strong class="truncate text-sm sm:text-base">{{ item.title }}</strong
                    ><span
                      class="rounded-full px-3 py-1 text-[11px] font-semibold"
                      [class]="statusClass(item.status)"
                      >{{ label(item.status) }}</span
                    >
                    @if (item.verified) {
                      <span
                        class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
                        >✓ Vérifiée</span
                      >
                    }</span
                  ><span class="mt-1 block truncate text-sm text-rheo-muted"
                    ><span class="inline-flex items-center gap-1.5"
                      ><app-admin-icon name="pin" className="size-4" />{{ item.location }} ·
                      {{ item.address }}</span
                    ></span
                  ><span class="mt-2 block text-xs text-[#7a8375]"
                    >{{ item.price | number }} USD{{ item.priceSuffix }} · {{ item.surface }} m² ·
                    {{ item.ownerName }}</span
                  ></span
                ><span class="hidden items-center gap-1 font-semibold text-[#657b18] sm:flex"
                  >Gérer <app-admin-icon name="arrow-right" className="size-4" /></span
              ></a>
            } @empty {
              <div class="p-12 text-center text-sm text-rheo-muted">
                Aucune annonce ne correspond aux filtres.
              </div>
            }
          </div>
        }
      </section>
    </section>
  `,
})
export class AdminPropertiesPage {
  protected readonly admin = inject(AdminService);
  protected readonly search = signal('');
  protected readonly status = signal<'all' | AdminProperty['status']>('all');
  protected readonly type = signal<'all' | AdminProperty['type']>('all');
  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.admin
      .properties()
      .filter(
        (p) =>
          (this.status() === 'all' || p.status === this.status()) &&
          (this.type() === 'all' || p.type === this.type()) &&
          (!q || `${p.title} ${p.location} ${p.address} ${p.ownerName}`.toLowerCase().includes(q)),
      );
  });
  protected label(status: AdminProperty['status']): string {
    return status === 'published' ? 'Publiée' : status === 'draft' ? 'Brouillon' : 'Archivée';
  }
  protected statusClass(status: AdminProperty['status']): string {
    return status === 'published'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'archived'
        ? 'bg-gray-100 text-gray-600'
        : 'bg-amber-50 text-amber-800';
  }
}
