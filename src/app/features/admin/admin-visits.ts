import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { VisitStatus } from '../../shared/models/admin.model';

@Component({
  selector: 'app-admin-visits',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">
            Demandes de visite
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Organiser les rendez-vous.</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">
            Recherchez une demande puis ouvrez son suivi dans une page dédiée.
          </p>
        </div>
        <div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm">
          <strong>{{ admin.stats().pendingVisits }}</strong>
          <span class="text-rheo-muted">à confirmer</span>
        </div>
      </header>
      <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
        <div class="flex flex-wrap gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
          <label class="relative min-w-[240px] flex-1"
            ><span class="absolute left-3 top-3 text-rheo-muted">⌕</span
            ><input
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              class="h-11 w-full rounded-xl border border-[#dfe3dc] pl-9 pr-3 text-sm"
              placeholder="Rechercher un client ou un bien…" /></label
          ><select
            [ngModel]="filter()"
            (ngModelChange)="filter.set($event)"
            class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="confirmée">Confirmées</option>
            <option value="terminée">Terminées</option>
            <option value="annulée">Annulées</option></select
          ><span class="self-center text-xs text-rheo-muted"
            >{{ filtered().length }} résultat(s)</span
          >
        </div>
        @if (admin.isLoading()) {
          <div class="grid gap-3 p-5">
            @for (item of [1, 2, 3]; track item) {
              <div class="h-20 animate-pulse rounded-xl bg-[#f0f2ee]"></div>
            }
          </div>
        } @else {
          <div class="divide-y divide-[#edf0eb]">
            @for (visit of filtered(); track visit.id) {
              <a
                [routerLink]="['/admin/visites', visit.id]"
                class="group flex items-center gap-4 px-5 py-5 transition hover:bg-[#fafbf9] sm:px-6"
                ><img
                  [src]="visit.propertyImageUrl || '/assets/hero_img.png'"
                  alt=""
                  class="size-16 shrink-0 rounded-xl object-cover"
                /><span class="min-w-0 flex-1"
                  ><span class="flex flex-wrap gap-2"
                    ><strong class="truncate text-sm sm:text-base">{{ visit.userName }}</strong
                    ><span
                      class="rounded-full px-3 py-1 text-[11px] font-semibold"
                      [class]="statusClass(visit.status)"
                      >{{ visit.status }}</span
                    ></span
                  ><span class="mt-1 block truncate text-sm text-rheo-muted"
                    >{{ visit.propertyTitle }} · {{ visit.propertyLocation }}</span
                  ><span class="mt-2 block text-xs text-[#7a8375]"
                    >📅 {{ visit.requestedDate | date: 'dd MMMM yyyy' }} à
                    {{ visit.requestedTime }}</span
                  ></span
                ><span class="hidden text-sm font-semibold text-[#657b18] sm:block"
                  >Ouvrir →</span
                ></a
              >
            } @empty {
              <div class="p-12 text-center text-sm text-rheo-muted">
                Aucune visite ne correspond à la recherche.
              </div>
            }
          </div>
        }
      </section>
    </section>
  `,
})
export class AdminVisitsPage {
  protected readonly admin = inject(AdminService);
  protected readonly search = signal('');
  protected readonly filter = signal<'all' | VisitStatus>('all');
  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.admin
      .visits()
      .filter(
        (v) =>
          (this.filter() === 'all' || v.status === this.filter()) &&
          (!q ||
            `${v.userName} ${v.userEmail} ${v.propertyTitle} ${v.propertyLocation}`
              .toLowerCase()
              .includes(q)),
      );
  });
  protected statusClass(status: VisitStatus): string {
    return status === 'terminée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'annulée'
        ? 'bg-red-50 text-red-700'
        : status === 'confirmée'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-amber-50 text-amber-800';
  }
}
