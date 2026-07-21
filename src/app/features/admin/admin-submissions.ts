import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { SubmissionStatus } from '../../shared/models/admin.model';

@Component({
  selector: 'app-admin-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">
            Soumissions de biens
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Vérifier avant de publier.</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">
            Chaque dossier s’ouvre dans une page complète pour examiner confortablement les images
            et les documents.
          </p>
        </div>
        <div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm">
          <span class="font-semibold">{{ admin.stats().pendingSubmissions }}</span>
          <span class="text-rheo-muted">à vérifier</span>
        </div>
      </header>

      <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
        <div class="flex flex-wrap items-center gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
          <label class="relative min-w-[240px] flex-1"
            ><span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rheo-muted"
              >⌕</span
            ><input
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              class="h-11 w-full rounded-xl border border-[#dfe3dc] pl-9 pr-3 text-sm outline-none focus:border-rheo-dark"
              placeholder="Rechercher par bien, propriétaire, ville…"
          /></label>
          <select
            [ngModel]="filter()"
            (ngModelChange)="filter.set($event)"
            class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="en attente">À vérifier</option>
            <option value="informations requises">Précisions demandées</option>
            <option value="publiée">Publiées</option>
            <option value="refusée">Refusées</option>
          </select>
          <span class="text-xs text-rheo-muted">{{ filtered().length }} résultat(s)</span>
        </div>
        @if (admin.isLoading()) {
          <div class="grid gap-3 p-5">
            @for (item of [1, 2, 3]; track item) {
              <div class="h-24 animate-pulse rounded-2xl bg-[#f0f2ee]"></div>
            }
          </div>
        } @else {
          <div class="divide-y divide-[#edf0eb]">
            @for (submission of filtered(); track submission.id) {
              <a
                [routerLink]="['/admin/soumissions', submission.id]"
                class="group grid gap-4 px-5 py-5 transition hover:bg-[#fafbf9] sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <div
                  class="grid h-[72px] grid-cols-2 gap-1 overflow-hidden rounded-xl bg-[#edf0eb]"
                >
                  @for (photo of submission.photos.slice(0, 4); track photo) {
                    <img [src]="photo" alt="" class="h-full min-h-0 w-full object-cover" />
                  } @empty {
                    <span class="col-span-2 grid place-items-center text-2xl">🏠</span>
                  }
                </div>
                <span class="min-w-0"
                  ><span class="flex flex-wrap items-center gap-2"
                    ><strong class="truncate text-sm sm:text-base">{{ submission.title }}</strong
                    ><span
                      class="rounded-full px-3 py-1 text-[11px] font-semibold"
                      [class]="statusClass(submission.status)"
                      >{{ submission.status }}</span
                    ></span
                  ><span class="mt-1 block truncate text-sm text-rheo-muted"
                    >{{ submission.ownerName }} · {{ submission.city }} ·
                    {{ submission.address }}</span
                  ><span class="mt-2 block text-xs text-[#7a8375]"
                    >Reçue le {{ submission.submittedAt | date: 'dd MMM yyyy à HH:mm' }}</span
                  ></span
                >
                <span class="flex items-center gap-2 text-xs font-semibold text-[#657b18]"
                  >Examiner
                  <span class="text-lg transition group-hover:translate-x-1">→</span></span
                >
              </a>
            } @empty {
              <div class="p-12 text-center">
                <span class="text-4xl">⌕</span>
                <p class="mt-3 text-sm font-semibold">Aucun dossier trouvé</p>
                <p class="mt-1 text-xs text-rheo-muted">Modifiez la recherche ou les filtres.</p>
              </div>
            }
          </div>
        }
      </section>
    </section>
  `,
})
export class AdminSubmissionsPage {
  protected readonly admin = inject(AdminService);
  protected readonly search = signal('');
  protected readonly filter = signal<'all' | SubmissionStatus>('all');
  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.admin
      .submissions()
      .filter(
        (item) =>
          (this.filter() === 'all' || item.status === this.filter()) &&
          (!query ||
            `${item.title} ${item.ownerName} ${item.ownerEmail} ${item.city} ${item.address}`
              .toLowerCase()
              .includes(query)),
      );
  });
  protected statusClass(status: SubmissionStatus): string {
    return status === 'publiée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'refusée'
        ? 'bg-red-50 text-red-700'
        : status === 'informations requises'
          ? 'bg-[#eef0d7] text-[#65751c]'
          : 'bg-amber-50 text-amber-800';
  }
}
