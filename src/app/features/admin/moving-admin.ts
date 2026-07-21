import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MovingRequestService } from '../../core/services/moving-request.service';
import { MovingRequest, MovingRequestStatus } from '../../shared/models/moving-request.model';

@Component({
  selector: 'app-moving-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">
            Opérations terrain
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Déménagements et aménagements</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">
            Affectez un partenaire et mettez à jour le statut de chaque demande.
          </p>
        </div>
        <a
          routerLink="/demenagement"
          class="inline-flex w-fit rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm font-semibold text-rheo-dark transition hover:bg-[#f8faf7]"
          >Voir le formulaire</a
        >
      </header>

      @if (error()) {
        <p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</p>
      }

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (metric of metrics(); track metric.label) {
          <article class="rounded-2xl border border-[#e4e6e1] bg-white p-5">
            <p class="text-sm text-rheo-muted">{{ metric.label }}</p>
            <p class="mt-4 text-3xl font-semibold">{{ metric.value }}</p>
            <p class="mt-2 text-xs text-rheo-muted">{{ metric.caption }}</p>
          </article>
        }
      </div>

      <div class="mt-8 flex flex-wrap gap-3 rounded-2xl border border-[#e4e6e1] bg-white p-4">
        <input
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          class="h-11 min-w-[240px] flex-1 rounded-xl border border-[#dfe3dc] px-4 text-sm"
          placeholder="Adresse, demandeur ou partenaire…"
        /><select
          [ngModel]="filterStatus()"
          (ngModelChange)="filterStatus.set($event)"
          class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
        >
          <option value="all">Tous les statuts</option>
          <option value="reçue">En attente</option>
          <option value="en traitement">En traitement</option>
          <option value="assignée">Assignées</option>
          <option value="terminée">Terminées</option>
          <option value="annulée">Annulées</option></select
        ><span class="self-center text-xs text-rheo-muted"
          >{{ filteredRequests().length }} résultat(s)</span
        >
      </div>

      <div class="mt-4 grid gap-4">
        @for (request of filteredRequests(); track request.id) {
          <article
            class="min-w-0 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6"
          >
            <div class="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full px-3 py-1 text-[11px] font-semibold"
                    [class]="statusClass(request.status)"
                    >{{ statusLabel(request.status) }}</span
                  ><span class="text-xs text-rheo-muted"
                    >Demande du {{ request.createdAt | date: 'dd/MM/yyyy' }}</span
                  >
                </div>
                <button
                  type="button"
                  (click)="toggleDetails(request.id)"
                  class="mt-3 flex w-full items-start justify-between gap-4 text-left"
                  [attr.aria-expanded]="expandedId() === request.id"
                >
                  <span class="break-words text-xl font-semibold tracking-tight">
                    {{ request.departureAddress }} <span class="text-rheo-muted">→</span>
                    {{ request.arrivalAddress }}
                  </span>
                  <span class="shrink-0 text-sm font-semibold text-[#657b18]">
                    {{ expandedId() === request.id ? 'Masquer' : 'Voir les détails' }}
                  </span>
                </button>
                <div class="mt-4 grid gap-3 text-sm text-rheo-muted sm:grid-cols-4">
                  <span class="min-w-0"
                    ><strong class="block text-[10px] uppercase tracking-wide text-[#899286]"
                      >Date</strong
                    ><span class="mt-1 block text-rheo-dark">{{
                      request.movingDate | date: 'dd/MM/yyyy'
                    }}</span></span
                  >
                  <span class="min-w-0"
                    ><strong class="block text-[10px] uppercase tracking-wide text-[#899286]"
                      >Volume</strong
                    ><span class="mt-1 block text-rheo-dark"
                      >{{ request.estimatedVolume }} m³</span
                    ></span
                  >
                  <span class="min-w-0"
                    ><strong class="block text-[10px] uppercase tracking-wide text-[#899286]"
                      >Accès</strong
                    ><span class="mt-1 block break-words text-rheo-dark"
                      >Étage {{ request.floor }} ·
                      {{ request.hasElevator ? 'Ascenseur' : 'Escaliers' }}</span
                    ></span
                  >
                  <span class="min-w-0"
                    ><strong class="block text-[10px] uppercase tracking-wide text-[#899286]"
                      >Demandeur</strong
                    ><span class="mt-1 block truncate text-rheo-dark">{{
                      request.userName
                    }}</span></span
                  >
                </div>
                @if (request.routeDistanceKm || request.routeDurationMinutes) {
                  <p class="mt-4 text-xs text-rheo-muted">
                    Trajet indicatif : {{ request.routeDistanceKm || '—' }} km ·
                    {{ request.routeDurationMinutes || '—' }} min
                  </p>
                }
                @if (expandedId() === request.id) {
                  <section class="mt-5 rounded-2xl border border-[#e4e6e1] bg-[#f8faf7] p-4 sm:p-5">
                    <h3 class="text-sm font-semibold text-rheo-dark">Informations complètes</h3>
                    <div class="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p class="text-xs text-rheo-muted">Demandeur</p>
                        <p class="mt-1 font-semibold text-rheo-dark">{{ request.userName }}</p>
                        @if (request.userEmail) {
                          <a
                            [href]="'mailto:' + request.userEmail"
                            class="mt-1 block break-all text-[#657b18]"
                            >{{ request.userEmail }}</a
                          >
                        }
                        @if (request.userPhone) {
                          <a
                            [href]="'tel:' + request.userPhone"
                            class="mt-1 block text-[#657b18]"
                            >{{ request.userPhone }}</a
                          >
                        }
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Départ</p>
                        <p class="mt-1 break-words font-medium text-rheo-dark">
                          {{ request.departureAddress }}
                        </p>
                        <p class="mt-1 text-xs text-rheo-muted">
                          {{ coordinatesLabel(request.departureCoordinates) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Arrivée</p>
                        <p class="mt-1 break-words font-medium text-rheo-dark">
                          {{ request.arrivalAddress }}
                        </p>
                        <p class="mt-1 text-xs text-rheo-muted">
                          {{ coordinatesLabel(request.arrivalCoordinates) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Déménagement et aménagement prévus</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.movingDate | date: 'EEEE d MMMM y' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Logistique</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.estimatedVolume }} m³ · étage {{ request.floor }}
                        </p>
                        <p class="mt-1 text-xs text-rheo-muted">
                          {{ request.hasElevator ? 'Ascenseur disponible' : 'Accès par escaliers' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Trajet estimé</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.routeDistanceKm ?? '—' }} km ·
                          {{ request.routeDurationMinutes ?? '—' }} min
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Demande créée</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.createdAt | date: 'dd/MM/yyyy à HH:mm' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Dernière mise à jour</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.updatedAt | date: 'dd/MM/yyyy à HH:mm' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-rheo-muted">Partenaire affecté</p>
                        <p class="mt-1 font-medium text-rheo-dark">
                          {{ request.assignedPartnerId || 'Aucun partenaire' }}
                        </p>
                      </div>
                    </div>
                  </section>
                }
              </div>

              <div class="grid min-w-0 w-full gap-3 xl:w-[430px] xl:max-w-full xl:shrink-0">
                <label class="min-w-0 text-xs font-semibold text-rheo-muted"
                  >Statut<select
                    [(ngModel)]="request.status"
                    [name]="'status-' + request.id"
                    class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm outline-none focus:border-rheo-dark"
                  >
                    <option value="reçue">En attente</option>
                    <option value="en traitement">En traitement</option>
                    <option value="assignée">Assignée</option>
                    <option value="terminée">Terminée</option>
                    <option value="annulée">Annulée</option>
                  </select></label
                >
                <div class="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input
                    [(ngModel)]="request.assignedPartnerId"
                    [name]="'partner-' + request.id"
                    class="h-11 min-w-0 w-full rounded-xl border border-[#dfe3dc] px-3 text-sm outline-none focus:border-rheo-dark"
                    placeholder="Partenaire"
                  /><input
                    [(ngModel)]="request.adminNotes"
                    [name]="'note-' + request.id"
                    class="h-11 min-w-0 w-full rounded-xl border border-[#dfe3dc] px-3 text-sm outline-none focus:border-rheo-dark"
                    placeholder="Note interne"
                  /><button
                    type="button"
                    (click)="save(request)"
                    [disabled]="savingId() === request.id"
                    class="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-4 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover disabled:opacity-60"
                  >
                    @if (savingId() === request.id) {
                      <span
                        class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                      ></span>
                      Enregistrement…
                    } @else {
                      Enregistrer
                    }
                  </button>
                </div>
              </div>
            </div>
            @if (savedId() === request.id) {
              <p class="mt-4 rounded-xl bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]">
                Affectation, statut et note enregistrés.
              </p>
            }
            @if (request.adminNotes) {
              <p class="mt-4 rounded-xl bg-[#f6f7f4] px-4 py-3 text-sm text-[#646d61]">
                Note équipe : {{ request.adminNotes }}
              </p>
            }
          </article>
        } @empty {
          @if (!loading()) {
            <div
              class="rounded-2xl border border-dashed border-[#d5dbd0] bg-white p-10 text-center text-sm text-rheo-muted"
            >
              Aucune demande de déménagement et d’aménagement.
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class MovingAdminPage implements OnInit {
  private readonly movingRequests = inject(MovingRequestService);
  protected readonly requests = signal<MovingRequest[]>([]);
  protected readonly search = signal('');
  protected readonly filterStatus = signal<'all' | MovingRequestStatus>('all');
  protected readonly filteredRequests = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.requests().filter(
      (request) =>
        (this.filterStatus() === 'all' || request.status === this.filterStatus()) &&
        (!query ||
          `${request.departureAddress} ${request.arrivalAddress} ${request.userName} ${request.userEmail ?? ''} ${request.assignedPartnerId ?? ''}`
            .toLowerCase()
            .includes(query)),
    );
  });
  protected readonly loading = signal(true);
  protected readonly savingId = signal('');
  protected readonly savedId = signal('');
  protected readonly expandedId = signal('');
  protected readonly error = signal('');
  protected readonly isDemo = signal(false);
  protected readonly pendingCount = computed(
    () =>
      this.requests().filter(
        (request) =>
          request.status === 'reçue' ||
          request.status === 'en attente' ||
          request.status === 'en traitement',
      ).length,
  );
  protected readonly assignedCount = computed(
    () => this.requests().filter((request) => request.status === 'assignée').length,
  );
  protected readonly completedCount = computed(
    () => this.requests().filter((request) => request.status === 'terminée').length,
  );
  protected readonly metrics = () => [
    { label: 'Dossiers', value: this.requests().length, caption: 'Toutes les demandes' },
    { label: 'À traiter', value: this.pendingCount(), caption: 'En attente d’affectation' },
    { label: 'Assignés', value: this.assignedCount(), caption: 'Partenaire terrain affecté' },
    { label: 'Terminés', value: this.completedCount(), caption: 'Dossiers clôturés' },
  ];

  async ngOnInit(): Promise<void> {
    try {
      const requests = await this.movingRequests.listForAdmin();
      this.requests.set(requests);
    } catch {
      this.error.set('Impossible de charger les demandes de déménagement et d’aménagement.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(request: MovingRequest): Promise<void> {
    this.savingId.set(request.id);
    this.savedId.set('');
    try {
      const updated = await this.movingRequests.assignForAdmin(
        request.id,
        request.assignedPartnerId ?? '',
        request.adminNotes ?? '',
        request.status,
      );
      this.requests.update((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      this.savedId.set(request.id);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      this.savingId.set('');
    }
  }

  protected statusLabel(status: MovingRequestStatus): string {
    return status === 'reçue' || status === 'en attente'
      ? 'En attente'
      : status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected toggleDetails(id: string): void {
    this.expandedId.update((current) => (current === id ? '' : id));
  }

  protected coordinatesLabel(coordinates: MovingRequest['departureCoordinates']): string {
    return coordinates
      ? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`
      : 'Coordonnées non disponibles';
  }

  protected statusClass(status: MovingRequestStatus): string {
    return status === 'terminée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'annulée'
        ? 'bg-[#fff0f0] text-[#b42318]'
        : status === 'assignée'
          ? 'bg-[#eee9fb] text-[#7050a2]'
          : 'bg-[#fff4d9] text-[#946200]';
  }
}
