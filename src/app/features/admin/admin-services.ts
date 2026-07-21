import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import {
  ADMIN_REQUEST_STATUSES,
  ADMIN_SERVICE_TYPES,
  AdminServiceOffer,
  AdminServiceOfferDraft,
} from '../../shared/models/admin.model';
import {
  REQUEST_STATUS_LABELS,
  RequestStatus,
  SERVICE_TYPE_LABELS,
  ServiceType,
} from '../../shared/models/service-request.model';
@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `<section>
    <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">Services</p>
        <h1 class="mt-2 text-3xl font-semibold">Catalogue et demandes.</h1>
        <p class="mt-3 text-sm text-rheo-muted">
          Gérez l’offre publique et orientez les demandes reçues.
        </p>
      </div>
      <button
        type="button"
        class="w-fit rounded-xl bg-rheo-dark px-5 py-3 text-sm font-semibold text-white"
        (click)="newOffer()"
      >
        ＋ Nouveau service
      </button>
    </header>
    @if (editing()) {
      <section class="mt-8 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.18em] text-rheo-muted">
              {{ offerDraft.id ? 'Modifier' : 'Créer' }} un service
            </p>
            <h2 class="mt-2 text-xl font-semibold">{{ offerDraft.title || 'Nouveau service' }}</h2>
          </div>
          <button
            type="button"
            (click)="cancelOffer()"
            class="text-sm font-semibold text-rheo-muted"
          >
            Fermer ×
          </button>
        </div>
        <div class="mt-5 grid gap-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold"
              >Slug<input
                [(ngModel)]="offerDraft.slug"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
            ><label class="text-sm font-semibold"
              >Icône<input
                [(ngModel)]="offerDraft.icon"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
            /></label>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold"
              >Titre<input
                [(ngModel)]="offerDraft.title"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
            ><label class="text-sm font-semibold"
              >Catégorie<input
                [(ngModel)]="offerDraft.eyebrow"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
            /></label>
          </div>
          <label class="text-sm font-semibold"
            >Description<textarea
              [(ngModel)]="offerDraft.description"
              rows="4"
              class="mt-2 w-full rounded-xl border border-[#dfe3dc] px-4 py-3 font-normal"
            ></textarea>
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold"
              >CTA<input
                [(ngModel)]="offerDraft.cta"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
            ><label class="text-sm font-semibold"
              >Ordre<input
                type="number"
                [(ngModel)]="offerDraft.displayOrder"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
            /></label>
          </div>
          <label class="flex items-center gap-2 text-sm"
            ><input type="checkbox" [(ngModel)]="offerDraft.active" /> Visible sur le site</label
          >
          <div class="flex gap-3">
            <button
              type="button"
              [disabled]="offerLoading()"
              (click)="saveOffer()"
              class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-sm font-bold disabled:opacity-60"
            >
              @if (offerLoading()) {
                <span
                  class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                ></span>
              }
              Enregistrer
            </button>
            @if (offerDraft.id) {
              <button
                type="button"
                [disabled]="offerLoading()"
                (click)="removeOffer()"
                class="rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-700"
              >
                Supprimer
              </button>
            }
          </div>
        </div>
      </section>
    }
    <section class="mt-8 rounded-2xl border border-[#e4e6e1] bg-white">
      <div class="border-b border-[#edf0eb] p-5">
        <h2 class="font-semibold">Catalogue public</h2>
        <p class="mt-1 text-xs text-rheo-muted">{{ admin.serviceOffers().length }} service(s)</p>
      </div>
      <div class="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        @for (offer of admin.serviceOffers(); track offer.id) {
          <button
            type="button"
            (click)="editOffer(offer)"
            class="flex items-center gap-4 rounded-xl border border-[#edf0eb] p-4 text-left hover:border-rheo-accent"
          >
            <span class="grid size-12 place-items-center rounded-xl bg-[#eef2e9] text-xl">{{
              offer.icon
            }}</span
            ><span class="min-w-0 flex-1"
              ><strong class="block truncate">{{ offer.title }}</strong
              ><small class="mt-1 block truncate text-rheo-muted">/{{ offer.slug }}</small></span
            ><span
              class="rounded-full px-2 py-1 text-[10px] font-semibold"
              [class]="offer.active ? 'bg-[#edf5d6] text-[#657b18]' : 'bg-gray-100 text-gray-600'"
              >{{ offer.active ? 'Actif' : 'Masqué' }}</span
            >
          </button>
        }
      </div>
    </section>
    <header class="mt-12">
      <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">Demandes reçues</p>
      <h2 class="mt-2 text-2xl font-semibold">Suivi des dossiers.</h2>
    </header>
    <section class="mt-6 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
      <div class="flex flex-wrap gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
        <input
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          class="h-11 min-w-[240px] flex-1 rounded-xl border border-[#dfe3dc] px-4 text-sm"
          placeholder="⌕ Client, description, e-mail…"
        /><select
          [ngModel]="filterType()"
          (ngModelChange)="filterType.set($event)"
          class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm"
        >
          <option value="all">Tous les services</option>
          @for (t of serviceTypes; track t) {
            <option [value]="t">{{ SERVICE_TYPE_LABELS[t] }}</option>
          }</select
        ><select
          [ngModel]="filterStatus()"
          (ngModelChange)="filterStatus.set($event)"
          class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm"
        >
          <option value="all">Tous les statuts</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ REQUEST_STATUS_LABELS[s] }}</option>
          }
        </select>
      </div>
      <div class="divide-y divide-[#edf0eb]">
        @for (request of requests(); track request.id) {
          <a
            [routerLink]="['/admin/services/demandes', request.id]"
            class="flex items-center gap-4 px-5 py-5 hover:bg-[#fafbf9] sm:px-6"
            ><span
              class="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eef2e9] text-lg"
              >{{ icon(request.serviceType) }}</span
            ><span class="min-w-0 flex-1"
              ><strong class="block truncate">{{ request.description }}</strong
              ><span class="mt-1 block text-xs text-rheo-muted"
                >{{ request.clientName }} · {{ request.clientEmail }} ·
                {{ request.createdAt | date: 'dd MMM yyyy' }}</span
              ></span
            ><span
              class="hidden rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800 sm:block"
              >{{ REQUEST_STATUS_LABELS[request.status] }}</span
            ><span>→</span></a
          >
        } @empty {
          <p class="p-12 text-center text-sm text-rheo-muted">Aucune demande trouvée.</p>
        }
      </div>
    </section>
  </section>`,
})
export class AdminServicesPage {
  protected readonly admin = inject(AdminService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly REQUEST_STATUS_LABELS = REQUEST_STATUS_LABELS;
  protected readonly serviceTypes = ADMIN_SERVICE_TYPES;
  protected readonly statuses = ADMIN_REQUEST_STATUSES;
  protected readonly editing = signal(false);
  protected readonly offerLoading = signal(false);
  protected readonly search = signal('');
  protected readonly filterType = signal<'all' | ServiceType>('all');
  protected readonly filterStatus = signal<'all' | RequestStatus>('all');
  protected offerDraft: AdminServiceOfferDraft = draft();
  protected readonly requests = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.admin
      .serviceRequests()
      .filter(
        (r) =>
          (this.filterType() === 'all' || r.serviceType === this.filterType()) &&
          (this.filterStatus() === 'all' || r.status === this.filterStatus()) &&
          (!q || `${r.clientName} ${r.clientEmail} ${r.description}`.toLowerCase().includes(q)),
      );
  });
  protected newOffer() {
    this.offerDraft = draft();
    this.editing.set(true);
  }
  protected editOffer(o: AdminServiceOffer) {
    this.offerDraft = { ...o };
    this.editing.set(true);
  }
  protected cancelOffer() {
    this.editing.set(false);
  }
  protected async saveOffer() {
    this.offerLoading.set(true);
    try {
      await this.admin.saveServiceOffer(this.offerDraft);
      this.editing.set(false);
    } finally {
      this.offerLoading.set(false);
    }
  }
  protected async removeOffer() {
    const o = this.admin.serviceOffers().find((v) => v.id === this.offerDraft.id);
    if (!o) return;
    this.offerLoading.set(true);
    try {
      await this.admin.deleteServiceOffer(o);
      this.editing.set(false);
    } finally {
      this.offerLoading.set(false);
    }
  }
  protected icon(t: ServiceType) {
    return t === 'maintenance' ? '🛠' : t === 'decoration' ? '✦' : t === 'juridique' ? '⚖' : '🚚';
  }
}
function draft(): AdminServiceOfferDraft {
  return {
    slug: '',
    title: '',
    eyebrow: '',
    description: '',
    icon: '✦',
    cta: 'Découvrir',
    displayOrder: 0,
    active: true,
  };
}
