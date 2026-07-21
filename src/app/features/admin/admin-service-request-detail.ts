import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ServiceRequestService } from '../../core/services/service-request.service';
import { AdminServiceRequestView } from '../../shared/models/admin.model';
import {
  REQUEST_STATUS_LABELS,
  RequestStatus,
  SERVICE_TYPE_LABELS,
  ServiceRequestDocument,
} from '../../shared/models/service-request.model';
@Component({
  selector: 'app-admin-service-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `<section class="mx-auto max-w-5xl">
    <a routerLink="/admin/services" class="text-sm font-semibold text-rheo-muted"
      >← Retour aux services</a
    >
    @if (request(); as item) {
      <header class="mt-6">
        <p class="text-xs font-bold uppercase tracking-[.2em] text-rheo-muted">
          {{ SERVICE_TYPE_LABELS[item.serviceType] }}
        </p>
        <h1 class="mt-2 text-3xl font-semibold">{{ item.description }}</h1>
        <p class="mt-2 text-sm text-rheo-muted">
          Reçue le {{ item.createdAt | date: 'dd MMMM yyyy à HH:mm' }}
        </p>
      </header>
      @if (error()) {
        <p class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
      }
      @if (saved()) {
        <p class="mt-5 rounded-xl bg-[#f1f8dd] p-4 text-sm text-[#52651a]">
          Le dossier a été mis à jour.
        </p>
      }
      <section class="mt-8 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
        <dl class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">Client</dt>
            <dd class="mt-1 font-semibold">{{ item.clientName }}</dd>
          </div>
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">E-mail</dt>
            <dd class="mt-1 truncate font-semibold">{{ item.clientEmail }}</dd>
          </div>
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">Téléphone</dt>
            <dd class="mt-1 font-semibold">{{ item.clientPhone }}</dd>
          </div>
        </dl>
        @if (item.documents.length) {
          <div class="mt-6">
            <p class="text-xs font-bold uppercase tracking-[.16em] text-rheo-muted">
              Pièces jointes
            </p>
            <ul class="mt-3 grid gap-2 sm:grid-cols-2">
              @for (document of item.documents; track document.path) {
                <li
                  class="flex items-center justify-between gap-3 rounded-xl border border-[#e4e6e1] p-3"
                >
                  <span class="min-w-0 truncate text-sm font-semibold">{{ document.name }}</span>
                  <button
                    type="button"
                    [disabled]="openingDocument() === document.path"
                    (click)="openDocument(document)"
                    class="shrink-0 rounded-lg bg-[#111711] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {{ openingDocument() === document.path ? 'Ouverture…' : 'Ouvrir' }}
                  </button>
                </li>
              }
            </ul>
          </div>
        }
        <div class="mt-6 grid gap-4">
          <label class="text-sm font-semibold"
            >Statut<select
              [(ngModel)]="status"
              class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4"
            >
              @for (s of statuses; track s) {
                <option [value]="s">{{ REQUEST_STATUS_LABELS[s] }}</option>
              }
            </select></label
          ><label class="text-sm font-semibold"
            >Partenaire assigné<input
              [(ngModel)]="assigned"
              class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
          ><label class="text-sm font-semibold"
            >Notes internes<textarea
              [(ngModel)]="notes"
              rows="5"
              class="mt-2 w-full rounded-xl border border-[#dfe3dc] px-4 py-3 font-normal"
            ></textarea>
          </label>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              [disabled]="loading() !== ''"
              (click)="save(item)"
              class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-sm font-bold disabled:opacity-60"
            >
              @if (loading() === 'save') {
                <span
                  class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                ></span>
              }
              Enregistrer</button
            ><button
              type="button"
              [disabled]="loading() !== ''"
              (click)="notify(item)"
              class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] px-5 text-sm font-semibold disabled:opacity-60"
            >
              @if (loading() === 'notify') {
                <span
                  class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                ></span>
              }
              Préparer la notification
            </button>
          </div>
        </div>
      </section>
    } @else {
      <div class="mt-8 h-80 animate-pulse rounded-3xl bg-white"></div>
    }
  </section>`,
})
export class AdminServiceRequestDetailPage {
  protected readonly admin = inject(AdminService);
  private readonly requests = inject(ServiceRequestService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly REQUEST_STATUS_LABELS = REQUEST_STATUS_LABELS;
  protected readonly statuses = RequestStatusValues;
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly request = computed(
    () => this.admin.serviceRequests().find((r) => r.id === this.id) ?? null,
  );
  protected status: RequestStatus = 'reçue';
  protected assigned = '';
  protected notes = '';
  protected readonly loading = signal('');
  protected readonly error = signal('');
  protected readonly saved = signal(false);
  protected readonly openingDocument = signal<string | null>(null);
  private markedAsRead = false;
  constructor() {
    effect(() => {
      const r = this.request();
      if (r) {
        this.status = r.status;
        this.assigned = r.assignedTo ?? '';
        this.notes = r.notes ?? '';
        if (!r.readAt && !this.markedAsRead) {
          this.markedAsRead = true;
          void this.admin.markAsRead('services', r.id).catch(() => {
            this.markedAsRead = false;
          });
        }
      }
    });
  }
  protected async save(r: AdminServiceRequestView) {
    this.loading.set('save');
    this.saved.set(false);
    try {
      await this.admin.updateServiceRequest(r.id, this.status, this.assigned, this.notes);
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async notify(r: AdminServiceRequestView) {
    this.loading.set('notify');
    try {
      await this.admin.prepareNotification(
        'service',
        r.id,
        `Bonjour ${r.clientName}, votre demande est suivie par RHEODYCE.`,
      );
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Notification impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async openDocument(document: ServiceRequestDocument): Promise<void> {
    this.openingDocument.set(document.path);
    try {
      window.open(await this.requests.getDocumentUrl(document), '_blank', 'noopener,noreferrer');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Ouverture du document impossible.');
    } finally {
      this.openingDocument.set(null);
    }
  }
}
const RequestStatusValues: RequestStatus[] = [
  'reçue',
  'en traitement',
  'assignée',
  'terminée',
  'annulée',
];
