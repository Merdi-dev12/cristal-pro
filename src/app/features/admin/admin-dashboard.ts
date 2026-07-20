import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { SERVICE_TYPE_LABELS } from '../../shared/models/service-request.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">Vue d’ensemble</p><h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Bonjour, équipe RHEODYCE.</h1><p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">Pilotez les annonces, les utilisateurs et les demandes depuis un seul espace.</p></div><a routerLink="/admin/annonces" class="inline-flex w-fit items-center gap-2 rounded-xl bg-rheo-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#323a31]">Créer une annonce <span aria-hidden="true">+</span></a></div>

      @if (admin.usingDemoData()) { <div class="mt-7 flex items-start gap-3 rounded-2xl border border-[#dbe6b4] bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]"><span class="mt-0.5 font-bold">i</span><p><strong>Mode démonstration.</strong> Les actions sont prêtes à être reliées à Supabase ; les données affichées servent à valider le parcours admin.</p></div> }
      @if (admin.actionMessage()) { <div class="mt-4 rounded-2xl border border-[#dbe6b4] bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]">{{ admin.actionMessage() }}</div> }

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (metric of metrics(); track metric.label) { <article class="rounded-2xl border border-[#e4e6e1] bg-white p-5 shadow-[0_6px_24px_rgba(24,32,20,0.03)]"><div class="flex items-start justify-between"><p class="text-sm text-rheo-muted">{{ metric.label }}</p><span class="flex size-8 items-center justify-center rounded-lg" [class]="metric.tone">{{ metric.icon }}</span></div><p class="mt-5 text-3xl font-semibold tracking-tight">{{ metric.value }}</p><p class="mt-2 text-xs text-[#71806a]">{{ metric.caption }}</p></article> }
      </div>

      <div class="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white"><div class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6"><div><h2 class="font-semibold">Demandes récentes</h2><p class="mt-1 text-xs text-rheo-muted">Les dernières sollicitations à traiter</p></div><a routerLink="/admin/services" class="text-xs font-semibold text-[#63751c] hover:underline">Tout voir</a></div><div class="divide-y divide-[#edf0eb]">@for (request of admin.recentServiceRequests(); track request.id) {<a routerLink="/admin/services" class="flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafbf9] sm:px-6"><span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2e9] text-sm">{{ serviceIcon(request.serviceType) }}</span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ request.description }}</span><span class="mt-1 block text-xs text-rheo-muted">{{ SERVICE_TYPE_LABELS[request.serviceType] }} · {{ request.clientName }}</span></span><span class="hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex" [class]="statusClass(request.status)">{{ request.status }}</span><span class="text-rheo-muted">›</span></a>} @empty {<p class="p-8 text-sm text-rheo-muted">Aucune demande récente.</p>}</div></section>
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white"><div class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6"><div><h2 class="font-semibold">Soumissions de biens</h2><p class="mt-1 text-xs text-rheo-muted">À vérifier par l’équipe</p></div><a routerLink="/admin/soumissions" class="text-xs font-semibold text-[#63751c] hover:underline">Ouvrir</a></div><div class="divide-y divide-[#edf0eb]">@for (submission of admin.recentSubmissions(); track submission.id) {<a routerLink="/admin/soumissions" class="block px-5 py-4 transition hover:bg-[#fafbf9] sm:px-6"><div class="flex items-start justify-between gap-4"><span class="min-w-0"><span class="block truncate text-sm font-semibold">{{ submission.title }}</span><span class="mt-1 block text-xs text-rheo-muted">{{ submission.city }} · {{ submission.ownerName }}</span></span><span class="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold" [class]="submissionClass(submission.status)">{{ submission.status }}</span></div></a>} @empty {<p class="p-8 text-sm text-rheo-muted">Aucune soumission récente.</p>}</div></section>
      </div>

      <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white"><div class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6"><div><h2 class="font-semibold">Visites récentes</h2><p class="mt-1 text-xs text-rheo-muted">Les rendez-vous à confirmer</p></div><a routerLink="/admin/visites" class="text-xs font-semibold text-[#63751c] hover:underline">Gérer les visites</a></div><div class="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">@for (visit of admin.recentVisits(); track visit.id) {<a routerLink="/admin/visites" class="rounded-xl border border-[#edf0eb] p-4 transition hover:border-rheo-accent hover:bg-[#fafbf9]"><div class="flex items-center justify-between gap-3"><span class="text-xs font-semibold text-rheo-muted">{{ visit.requestedDate | date:'dd/MM' }} · {{ visit.requestedTime }}</span><span class="size-2 rounded-full" [class]="visit.status === 'en attente' ? 'bg-[#f0b429]' : 'bg-[#8db534]'"></span></div><p class="mt-3 truncate text-sm font-semibold">{{ visit.propertyTitle }}</p><p class="mt-1 truncate text-xs text-rheo-muted">{{ visit.userName }}</p><span class="mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold" [class]="submissionClass(visit.status)">{{ visit.status }}</span></a>} @empty {<p class="text-sm text-rheo-muted">Aucune visite récente.</p>}</div></section>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><a routerLink="/admin/visites" class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"><span class="text-2xl">◎</span><h3 class="mt-4 font-semibold">Traiter les visites</h3><p class="mt-1 text-xs text-rheo-muted">{{ admin.stats().pendingVisits }} en attente</p></a><a routerLink="/admin/utilisateurs" class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"><span class="text-2xl">♙</span><h3 class="mt-4 font-semibold">Gérer les utilisateurs</h3><p class="mt-1 text-xs text-rheo-muted">Abonnements et historique</p></a><a routerLink="/admin/services" class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"><span class="text-2xl">▣</span><h3 class="mt-4 font-semibold">Affecter un partenaire</h3><p class="mt-1 text-xs text-rheo-muted">Suivre le traitement</p></a><a routerLink="/admin/demenagements" class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"><span class="text-2xl">↗</span><h3 class="mt-4 font-semibold">Déménagements</h3><p class="mt-1 text-xs text-rheo-muted">Partenaires et itinéraires</p></a><a routerLink="/admin/annonces" class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"><span class="text-2xl">⌑</span><h3 class="mt-4 font-semibold">Gérer les annonces</h3><p class="mt-1 text-xs text-rheo-muted">Publication et vérification</p></a></div>
    </section>
  `,
})
export class AdminDashboardPage {
  protected readonly admin = inject(AdminService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly metrics = () => [
    { label: 'Annonces', value: this.admin.stats().properties, caption: 'biens dans le catalogue', icon: '⌑', tone: 'bg-[#edf5d6] text-[#657b18]' },
    { label: 'Utilisateurs', value: this.admin.stats().users, caption: 'comptes inscrits', icon: '♙', tone: 'bg-[#e8f1fb] text-[#28639a]' },
    { label: 'Abonnés', value: this.admin.stats().subscribers, caption: 'accès premium actif', icon: '★', tone: 'bg-[#fff0db] text-[#b85b00]' },
    { label: 'Demandes', value: this.admin.stats().requests, caption: 'visites et services', icon: '▣', tone: 'bg-[#eee9fb] text-[#7050a2]' },
  ];

  protected serviceIcon(type: string): string { return type === 'maintenance' ? '⌁' : type === 'decoration' ? '✦' : type === 'juridique' ? '§' : '↗'; }
  protected statusClass(status: string): string { return status === 'terminée' ? 'bg-[#edf5d6] text-[#657b18]' : status === 'annulée' ? 'bg-[#fff0f0] text-[#b42318]' : 'bg-[#fff4d9] text-[#946200]'; }
  protected submissionClass(status: string): string { return status === 'refusée' ? 'bg-[#fff0f0] text-[#b42318]' : status === 'en attente' ? 'bg-[#fff4d9] text-[#946200]' : 'bg-[#edf5d6] text-[#657b18]'; }
}
