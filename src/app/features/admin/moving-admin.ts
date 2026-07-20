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
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">Opérations terrain</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Déménagements.</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">Suivez les itinéraires, affectez un partenaire et accompagnez chaque demande jusqu’à la clôture.</p>
        </div>
        <a routerLink="/demenagement" class="inline-flex w-fit rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm font-semibold text-rheo-dark transition hover:bg-[#f8faf7]">Voir le formulaire</a>
      </header>

      @if (error()) { <p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</p> }

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (metric of metrics(); track metric.label) {
          <article class="rounded-2xl border border-[#e4e6e1] bg-white p-5"><p class="text-sm text-rheo-muted">{{ metric.label }}</p><p class="mt-4 text-3xl font-semibold">{{ metric.value }}</p><p class="mt-2 text-xs text-rheo-muted">{{ metric.caption }}</p></article>
        }
      </div>

      <div class="mt-8 grid gap-4">
        @for (request of requests(); track request.id) {
          <article class="min-w-0 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6">
            <div class="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2"><span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="statusClass(request.status)">{{ statusLabel(request.status) }}</span><span class="text-xs text-rheo-muted">Demande du {{ request.createdAt | date:'dd/MM/yyyy' }}</span></div>
                <h2 class="mt-3 break-words text-xl font-semibold tracking-tight">{{ request.departureAddress }} <span class="text-rheo-muted">→</span> {{ request.arrivalAddress }}</h2>
                <div class="mt-4 grid gap-3 text-sm text-rheo-muted sm:grid-cols-4">
                  <span class="min-w-0"><strong class="block text-[10px] uppercase tracking-wide text-[#899286]">Date</strong><span class="mt-1 block text-rheo-dark">{{ request.movingDate | date:'dd/MM/yyyy' }}</span></span>
                  <span class="min-w-0"><strong class="block text-[10px] uppercase tracking-wide text-[#899286]">Volume</strong><span class="mt-1 block text-rheo-dark">{{ request.estimatedVolume }} m³</span></span>
                  <span class="min-w-0"><strong class="block text-[10px] uppercase tracking-wide text-[#899286]">Accès</strong><span class="mt-1 block break-words text-rheo-dark">Étage {{ request.floor }} · {{ request.hasElevator ? 'Ascenseur' : 'Escaliers' }}</span></span>
                  <span class="min-w-0"><strong class="block text-[10px] uppercase tracking-wide text-[#899286]">Demandeur</strong><span class="mt-1 block truncate text-rheo-dark">{{ request.userId }}</span></span>
                </div>
                @if (request.routeDistanceKm || request.routeDurationMinutes) { <p class="mt-4 text-xs text-rheo-muted">Trajet indicatif : {{ request.routeDistanceKm || '—' }} km · {{ request.routeDurationMinutes || '—' }} min</p> }
              </div>

              <div class="grid min-w-0 w-full gap-3 xl:w-[430px] xl:max-w-full xl:shrink-0">
                <label class="min-w-0 text-xs font-semibold text-rheo-muted">Statut<select [(ngModel)]="request.status" [name]="'status-' + request.id" class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm outline-none focus:border-rheo-dark"><option value="reçue">En attente</option><option value="en traitement">En traitement</option><option value="assignée">Assignée</option><option value="terminée">Terminée</option><option value="annulée">Annulée</option></select></label>
                <div class="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><input [(ngModel)]="request.assignedPartnerId" [name]="'partner-' + request.id" class="h-11 min-w-0 w-full rounded-xl border border-[#dfe3dc] px-3 text-sm outline-none focus:border-rheo-dark" placeholder="Partenaire"><input [(ngModel)]="request.adminNotes" [name]="'note-' + request.id" class="h-11 min-w-0 w-full rounded-xl border border-[#dfe3dc] px-3 text-sm outline-none focus:border-rheo-dark" placeholder="Note interne"><button type="button" (click)="save(request)" [disabled]="savingId() === request.id" class="h-11 min-w-0 rounded-xl bg-rheo-accent px-4 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover disabled:opacity-60">Enregistrer</button></div>
              </div>
            </div>
            @if (savedId() === request.id) { <p class="mt-4 rounded-xl bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]">Affectation, statut et note enregistrés.</p> }
            @if (request.adminNotes) { <p class="mt-4 rounded-xl bg-[#f6f7f4] px-4 py-3 text-sm text-[#646d61]">Note équipe : {{ request.adminNotes }}</p> }
          </article>
        } @empty {
          @if (!loading()) { <div class="rounded-2xl border border-dashed border-[#d5dbd0] bg-white p-10 text-center text-sm text-rheo-muted">Aucune demande de déménagement.</div> }
        }
      </div>
    </section>
  `,
})
export class MovingAdminPage implements OnInit {
  private readonly movingRequests = inject(MovingRequestService);
  protected readonly requests = signal<MovingRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly savingId = signal('');
  protected readonly savedId = signal('');
  protected readonly error = signal('');
  protected readonly isDemo = signal(false);
  protected readonly pendingCount = computed(() => this.requests().filter((request) => request.status === 'reçue' || request.status === 'en attente' || request.status === 'en traitement').length);
  protected readonly assignedCount = computed(() => this.requests().filter((request) => request.status === 'assignée').length);
  protected readonly completedCount = computed(() => this.requests().filter((request) => request.status === 'terminée').length);
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
      this.error.set('Impossible de charger les demandes de déménagement.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(request: MovingRequest): Promise<void> {
    this.savingId.set(request.id);
    this.savedId.set('');
    try {
      const updated = await this.movingRequests.assignForAdmin(request.id, request.assignedPartnerId ?? '', request.adminNotes ?? '', request.status);
      this.requests.update((items) => items.map((item) => item.id === updated.id ? updated : item));
      this.savedId.set(request.id);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      this.savingId.set('');
    }
  }

  protected statusLabel(status: MovingRequestStatus): string { return status === 'reçue' || status === 'en attente' ? 'En attente' : status.charAt(0).toUpperCase() + status.slice(1); }
  protected statusClass(status: MovingRequestStatus): string { return status === 'terminée' ? 'bg-[#edf5d6] text-[#657b18]' : status === 'annulée' ? 'bg-[#fff0f0] text-[#b42318]' : status === 'assignée' ? 'bg-[#eee9fb] text-[#7050a2]' : 'bg-[#fff4d9] text-[#946200]'; }
}
