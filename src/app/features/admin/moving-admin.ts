import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MovingRequestService } from '../../core/services/moving-request.service';
import { MovingRequest } from '../../shared/models/moving-request.model';

@Component({
  selector: 'app-moving-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-20 pt-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header class="flex flex-col justify-between gap-5 border-b border-rheo-border pb-8 sm:flex-row sm:items-end">
          <div><p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Administration</p><h1 class="mt-3 text-4xl font-semibold tracking-tight text-rheo-dark">Affecter les déménagements.</h1><p class="mt-4 text-sm leading-7 text-rheo-muted">Cette vue est réservée aux administrateurs et prépare l’affectation des partenaires terrain.</p></div>
          <a routerLink="/demenagement" class="inline-flex w-fit rounded-[18px] border border-[#d7e0ed] bg-white px-5 py-3 text-sm font-semibold text-rheo-dark">Voir le formulaire</a>
        </header>
        @if (error()) { <p class="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</p> }
        <div class="mt-10 grid gap-4">
          @for (request of requests(); track request.id) {
            <article class="rounded-[26px] border border-rheo-border bg-white p-5 sm:p-7">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><p class="text-xs font-semibold uppercase tracking-[0.18em] text-rheo-muted">{{ request.movingDate | date:'dd/MM/yyyy' }} · {{ request.status }}</p><h2 class="mt-2 text-xl font-semibold text-rheo-dark">{{ request.departureAddress }} → {{ request.arrivalAddress }}</h2><p class="mt-2 text-sm text-rheo-muted">{{ request.estimatedVolume }} m³ · étage {{ request.floor }} · {{ request.hasElevator ? 'ascenseur' : 'escaliers' }}</p></div>
                <div class="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto] lg:max-w-xl">
                  <input [(ngModel)]="request.assignedPartnerId" [name]="'partner-' + request.id" class="h-11 rounded-xl border border-[#d7e0ed] px-3 text-sm outline-none focus:border-rheo-dark" placeholder="ID partenaire" />
                  <input [(ngModel)]="request.adminNotes" [name]="'note-' + request.id" class="h-11 rounded-xl border border-[#d7e0ed] px-3 text-sm outline-none focus:border-rheo-dark" placeholder="Note interne" />
                  <button type="button" (click)="assign(request)" [disabled]="savingId() === request.id" class="h-11 rounded-xl bg-rheo-accent px-4 text-sm font-bold text-rheo-dark disabled:opacity-60">Enregistrer</button>
                </div>
              </div>
              @if (savedId() === request.id) { <p class="mt-4 text-sm text-[#38500d]">Affectation enregistrée.</p> }
            </article>
          } @empty { @if (!loading()) { <div class="rounded-[26px] border border-rheo-border bg-white p-8 text-sm text-rheo-muted">Aucune demande à traiter.</div> } }
        </div>
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

  async ngOnInit(): Promise<void> {
    try {
      this.requests.set(await this.movingRequests.listForAdmin());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Accès administrateur refusé.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async assign(request: MovingRequest): Promise<void> {
    this.savingId.set(request.id);
    this.savedId.set('');
    try {
      const updated = await this.movingRequests.assignForAdmin(request.id, request.assignedPartnerId ?? '', request.adminNotes ?? '');
      this.requests.update((items) => items.map((item) => item.id === updated.id ? updated : item));
      this.savedId.set(request.id);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Affectation impossible.');
    } finally {
      this.savingId.set('');
    }
  }
}
