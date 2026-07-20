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
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">Demandes de visite</p><h1 class="mt-2 text-3xl font-semibold tracking-tight">Les visites à organiser.</h1><p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">Visualisez l’annonce, le demandeur et préparez le suivi de chaque rendez-vous.</p></div><div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm"><span class="font-semibold">{{ admin.stats().pendingVisits }}</span> <span class="text-rheo-muted">en attente</span></div></header>

      <div class="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0eb] px-5 py-4 sm:px-6"><div class="flex items-center gap-2"><button type="button" class="rounded-full px-3 py-2 text-xs font-semibold" [class]="filter() === 'all' ? 'bg-rheo-dark text-white' : 'bg-[#f3f5f1] text-rheo-muted'" (click)="filter.set('all')">Toutes</button><button type="button" class="rounded-full px-3 py-2 text-xs font-semibold" [class]="filter() === 'en attente' ? 'bg-rheo-dark text-white' : 'bg-[#f3f5f1] text-rheo-muted'" (click)="filter.set('en attente')">En attente</button><button type="button" class="rounded-full px-3 py-2 text-xs font-semibold" [class]="filter() === 'confirmée' ? 'bg-rheo-dark text-white' : 'bg-[#f3f5f1] text-rheo-muted'" (click)="filter.set('confirmée')">Confirmées</button></div><span class="text-xs text-rheo-muted">{{ filteredVisits().length }} demande(s)</span></div><div class="divide-y divide-[#edf0eb]">@for (visit of filteredVisits(); track visit.id) {<button type="button" class="block w-full px-5 py-5 text-left transition hover:bg-[#fafbf9] sm:px-6" [class.bg-[#f8fbe9]]="selectedId() === visit.id" (click)="select(visit)"><div class="flex items-start gap-4"><img [src]="visit.propertyImageUrl || '/assets/hero_img.png'" alt="" class="size-12 shrink-0 rounded-xl object-cover"><span class="min-w-0 flex-1"><span class="flex flex-wrap items-center gap-2"><strong class="truncate text-sm">{{ visit.userName }}</strong><span class="text-xs text-rheo-muted">{{ visit.createdAt | date:'dd MMM yyyy' }}</span></span><span class="mt-1 block truncate text-sm text-rheo-muted">{{ visit.propertyTitle }}</span><span class="mt-2 block text-xs text-[#7a8375]">{{ visit.requestedDate | date:'dd/MM/yyyy' }} · {{ visit.requestedTime }}</span></span><span class="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold" [class]="statusClass(visit.status)">{{ visit.status }}</span></div></button>} @empty {<div class="p-10 text-center text-sm text-rheo-muted">Aucune demande pour ce filtre.</div>}</div></section>

        @if (selectedVisit(); as visit) {<aside class="rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.18em] text-rheo-muted">Détail de la demande</p><h2 class="mt-2 text-xl font-semibold">Visite {{ visit.propertyTitle }}</h2></div><span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="statusClass(visit.status)">{{ visit.status }}</span></div><div class="mt-6 flex gap-4 rounded-2xl bg-[#f6f7f4] p-3"><img [src]="visit.propertyImageUrl || '/assets/hero_img.png'" alt="" class="size-16 rounded-xl object-cover"><div class="min-w-0"><p class="truncate text-sm font-semibold">{{ visit.propertyTitle }}</p><p class="mt-1 text-xs text-rheo-muted">{{ visit.propertyLocation }}</p><a routerLink="/annonces" class="mt-2 inline-block text-xs font-semibold text-[#657b18] hover:underline">Voir l’annonce concernée ↗</a></div></div><div class="mt-5 rounded-2xl border border-[#edf0eb] p-4"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rheo-muted">Utilisateur demandeur</p><p class="mt-2 text-sm font-semibold">{{ visit.userName }}</p><p class="mt-1 text-xs text-rheo-muted">{{ visit.userEmail }}</p><p class="mt-1 text-xs text-rheo-muted">Rendez-vous : {{ visit.requestedDate | date:'EEEE d MMMM y' }} à {{ visit.requestedTime }}</p></div>@if (visit.message) {<p class="mt-5 rounded-xl bg-[#f6f7f4] px-4 py-3 text-sm leading-6 text-[#646d61]">« {{ visit.message }} »</p>}<div class="mt-6 grid gap-3"><label class="text-xs font-semibold text-rheo-muted">Statut<select [ngModel]="draftStatus()" (ngModelChange)="draftStatus.set($event)" class="mt-2 h-11 w-full rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm outline-none focus:border-rheo-dark"><option value="en attente">En attente</option><option value="confirmée">Confirmée</option><option value="annulée">Annulée</option><option value="terminée">Terminée</option></select></label><label class="text-xs font-semibold text-rheo-muted">Note interne RHEODYCE<textarea [ngModel]="draftNote()" (ngModelChange)="draftNote.set($event)" rows="3" class="mt-2 w-full resize-none rounded-xl border border-[#dfe3dc] bg-white px-3 py-3 text-sm outline-none focus:border-rheo-dark" placeholder="Ex. Confirmer avec le gardien..."></textarea></label><button type="button" class="h-11 rounded-xl bg-rheo-accent text-sm font-bold transition hover:bg-rheo-accent-hover" (click)="save(visit)">Enregistrer le suivi</button><button type="button" class="h-11 rounded-xl border border-[#dfe3dc] text-sm font-semibold transition hover:bg-[#f6f7f4]" (click)="prepareNotification(visit)">{{ visit.notificationPrepared ? 'Notification préparée ✓' : 'Préparer la notification utilisateur' }}</button></div></aside>} @else {<aside class="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-[#d5dbd0] bg-white p-8 text-center"><div><span class="text-4xl">◎</span><h2 class="mt-4 font-semibold">Sélectionnez une demande</h2><p class="mt-2 max-w-xs text-sm leading-6 text-rheo-muted">Les détails du rendez-vous et les actions de suivi apparaîtront ici.</p></div></aside>}
      </div>
    </section>
  `,
})
export class AdminVisitsPage {
  protected readonly admin = inject(AdminService);
  protected readonly filter = signal<'all' | VisitStatus>('all');
  protected readonly selectedId = signal('');
  protected readonly draftStatus = signal<VisitStatus>('en attente');
  protected readonly draftNote = signal('');
  protected readonly filteredVisits = computed(() => {
    const current = this.filter();
    return current === 'all' ? this.admin.visits() : this.admin.visits().filter((visit) => visit.status === current);
  });
  protected readonly selectedVisit = computed(() => this.admin.visits().find((visit) => visit.id === this.selectedId()) ?? null);

  protected select(visit: { id: string; status: VisitStatus; internalNote: string }): void {
    this.selectedId.set(visit.id);
    this.draftStatus.set(visit.status);
    this.draftNote.set(visit.internalNote);
  }

  protected async save(visit: { id: string }): Promise<void> {
    await this.admin.updateVisit(visit.id, this.draftStatus(), this.draftNote());
  }

  protected async prepareNotification(visit: { id: string; userName: string; propertyTitle: string }): Promise<void> {
    await this.admin.prepareNotification('visite', visit.id, `Bonjour ${visit.userName}, votre demande de visite pour « ${visit.propertyTitle} » est en cours de traitement par RHEODYCE.`);
  }

  protected statusClass(status: VisitStatus): string { return status === 'confirmée' ? 'bg-[#edf5d6] text-[#657b18]' : status === 'terminée' ? 'bg-[#e8f1fb] text-[#28639a]' : status === 'annulée' ? 'bg-[#fff0f0] text-[#b42318]' : 'bg-[#fff4d9] text-[#946200]'; }
}
