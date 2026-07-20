import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminContactMessage, ContactMessageStatus } from '../../shared/models/admin.model';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">
            Boîte de réception
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Demandes de contact.</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">
            Consultez les demandes envoyées depuis le site et suivez leur traitement par l’équipe.
          </p>
        </div>
        <div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm">
          <span class="font-semibold">{{ unreadCount() }}</span>
          <span class="text-rheo-muted"> nouvelle(s)</span>
        </div>
      </header>

      @if (admin.actionMessage()) {
        <div
          class="mt-5 rounded-2xl border border-[#dbe6b4] bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]"
        >
          {{ admin.actionMessage() }}
        </div>
      }

      <div class="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
          <div
            class="flex flex-wrap items-center gap-2 border-b border-[#edf0eb] px-5 py-4 sm:px-6"
          >
            <select
              [ngModel]="filterStatus()"
              (ngModelChange)="filterStatus.set($event)"
              class="h-10 rounded-xl border border-[#dfe3dc] bg-white px-3 text-xs font-semibold outline-none"
              aria-label="Filtrer les demandes de contact"
            >
              <option value="all">Toutes les demandes</option>
              <option value="new">Nouvelles</option>
              <option value="read">Lues</option>
              <option value="archived">Archivées</option>
            </select>
            <span class="ml-auto text-xs text-rheo-muted"
              >{{ filteredMessages().length }} résultat(s)</span
            >
          </div>

          <div class="divide-y divide-[#edf0eb]">
            @for (request of filteredMessages(); track request.id) {
              <button
                type="button"
                class="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-[#fafbf9] sm:px-6"
                [class.bg-[#f8fbe9]]="request.id === selectedId()"
                (click)="select(request)"
              >
                <span
                  class="mt-1 size-2.5 shrink-0 rounded-full"
                  [class]="request.status === 'new' ? 'bg-rheo-accent' : 'bg-[#d7dcd4]'"
                  aria-hidden="true"
                ></span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-3">
                    <strong class="truncate text-sm">{{ request.fullName }}</strong>
                    <small class="shrink-0 text-[11px] text-rheo-muted">{{
                      request.createdAt | date: 'dd/MM/yyyy HH:mm'
                    }}</small>
                  </span>
                  <span class="mt-1 block truncate text-xs font-semibold text-[#657b18]">{{
                    request.need
                  }}</span>
                  <span class="mt-1 block truncate text-xs text-rheo-muted">{{
                    request.message
                  }}</span>
                </span>
              </button>
            } @empty {
              <div class="p-10 text-center text-sm text-rheo-muted">
                Aucune demande de contact pour ce filtre.
              </div>
            }
          </div>
        </section>

        @if (selectedMessage(); as request) {
          <aside class="h-fit rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-rheo-muted">
                  {{ request.need }}
                </p>
                <h2 class="mt-2 text-xl font-semibold">{{ request.fullName }}</h2>
                <p class="mt-1 text-xs text-rheo-muted">
                  Reçue le {{ request.createdAt | date: 'dd MMMM yyyy à HH:mm' }}
                </p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-[11px] font-semibold"
                [class]="statusClass(request.status)"
              >
                {{ statusLabel(request.status) }}
              </span>
            </div>

            <dl class="mt-6 grid gap-3 rounded-xl bg-[#f7f8f5] p-4 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-rheo-muted">E-mail</dt>
                <dd class="min-w-0 truncate font-semibold">{{ request.email }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-rheo-muted">Ville</dt>
                <dd class="font-semibold">{{ request.city || 'Non précisée' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-rheo-muted">Alerte e-mail</dt>
                <dd
                  class="font-semibold"
                  [class.text-[#657b18]]="request.notificationStatus === 'sent'"
                  [class.text-[#b42318]]="request.notificationStatus === 'failed'"
                >
                  {{ notificationLabel(request) }}
                </dd>
              </div>
            </dl>

            <div class="mt-5 rounded-xl border border-[#e4e6e1] p-4">
              <p class="whitespace-pre-wrap text-sm leading-7 text-rheo-dark">
                {{ request.message }}
              </p>
            </div>

            @if (request.notificationStatus === 'failed' && request.notificationError) {
              <p class="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                Notification non envoyée : {{ request.notificationError }}
              </p>
            }

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                [href]="'mailto:' + request.email"
                class="flex h-11 items-center justify-center rounded-xl bg-rheo-accent px-4 text-sm font-bold text-rheo-dark hover:bg-rheo-accent-hover"
                >Répondre par e-mail</a
              >
              <button
                type="button"
                class="h-11 rounded-xl border border-[#dfe3dc] px-4 text-sm font-semibold hover:bg-[#f6f7f4]"
                (click)="archive(request)"
              >
                Archiver
              </button>
            </div>
          </aside>
        } @else {
          <aside
            class="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-[#d5dbd0] bg-white p-8 text-center"
          >
            <div>
              <span class="text-4xl">✉</span>
              <h2 class="mt-4 font-semibold">Sélectionnez une demande</h2>
              <p class="mt-2 max-w-xs text-sm leading-6 text-rheo-muted">
                Les coordonnées, le message et l’état de la notification apparaîtront ici.
              </p>
            </div>
          </aside>
        }
      </div>
    </section>
  `,
})
export class AdminContactPage {
  protected readonly admin = inject(AdminService);
  protected readonly selectedId = signal('');
  protected readonly filterStatus = signal<'all' | ContactMessageStatus>('all');
  protected readonly unreadCount = computed(
    () => this.admin.contactMessages().filter((request) => request.status === 'new').length,
  );
  protected readonly filteredMessages = computed(() =>
    this.admin
      .contactMessages()
      .filter((request) => this.filterStatus() === 'all' || request.status === this.filterStatus()),
  );
  protected readonly selectedMessage = computed(
    () => this.admin.contactMessages().find((request) => request.id === this.selectedId()) ?? null,
  );

  protected async select(request: AdminContactMessage): Promise<void> {
    this.selectedId.set(request.id);
    if (request.status === 'new') await this.admin.updateContactMessage(request.id, 'read');
  }

  protected async archive(request: AdminContactMessage): Promise<void> {
    await this.admin.updateContactMessage(request.id, 'archived');
  }

  protected statusLabel(status: ContactMessageStatus): string {
    return status === 'new' ? 'Nouvelle' : status === 'read' ? 'Lue' : 'Archivée';
  }

  protected statusClass(status: ContactMessageStatus): string {
    return status === 'new'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'read'
        ? 'bg-[#e8f1fb] text-[#28639a]'
        : 'bg-[#f1f3ef] text-[#667064]';
  }

  protected notificationLabel(request: AdminContactMessage): string {
    return request.notificationStatus === 'sent'
      ? 'Envoyée'
      : request.notificationStatus === 'failed'
        ? 'Échec'
        : 'En attente';
  }
}
