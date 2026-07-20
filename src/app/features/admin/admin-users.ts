import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminUser } from '../../shared/models/admin.model';
import { SERVICE_TYPE_LABELS } from '../../shared/models/service-request.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">Utilisateurs</p><h1 class="mt-2 text-3xl font-semibold tracking-tight">La communauté RHEODYCE.</h1><p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">Consultez les rôles, gérez les abonnements manuellement et retrouvez l’historique des demandes.</p></div><div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm"><span class="font-semibold">{{ admin.stats().subscribers }}</span> <span class="text-rheo-muted">abonné(s)</span></div></header>
      <div class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white"><div class="grid grid-cols-[1.3fr_1fr_0.7fr_auto] border-b border-[#edf0eb] bg-[#f7f8f6] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b9488] sm:px-6"><span>Utilisateur</span><span>Inscription</span><span>Statut</span><span></span></div><div class="divide-y divide-[#edf0eb]">@for (user of admin.users(); track user.id) {<div><button type="button" class="grid w-full grid-cols-[1.3fr_1fr_0.7fr_auto] items-center gap-3 px-5 py-5 text-left transition hover:bg-[#fafbf9] sm:px-6" [class.bg-[#f8fbe9]]="selectedId() === user.id" (click)="select(user)"><span class="flex min-w-0 items-center gap-3"><span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8eee2] text-xs font-bold text-[#657b18]">{{ initials(user.name) }}</span><span class="min-w-0"><strong class="block truncate text-sm">{{ user.name }}</strong><small class="mt-1 block truncate text-xs text-rheo-muted">{{ user.email }}</small></span></span><span class="text-xs text-rheo-muted">{{ user.joinedAt | date:'dd MMM yyyy' }}</span><span><span class="rounded-full px-3 py-1 text-[11px] font-semibold" [class]="roleClass(user.role)">{{ user.role }}</span></span><span class="text-lg text-rheo-muted">{{ selectedId() === user.id ? '⌃' : '⌄' }}</span></button>@if (selectedUser()?.id === user.id) {<div class="border-t border-[#edf0eb] bg-[#fbfcfa] px-5 py-5 sm:px-6"><div class="grid gap-5 lg:grid-cols-[1fr_1fr_auto]"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rheo-muted">Coordonnées</p><p class="mt-2 text-sm font-semibold">{{ user.phone }}</p><p class="mt-1 text-xs text-rheo-muted">Compte créé le {{ user.joinedAt | date:'d MMMM y' }}</p></div><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rheo-muted">Abonnement</p><p class="mt-2 text-sm font-semibold">{{ user.isSubscriber ? 'Accès premium actif' : 'Accès standard' }}</p><p class="mt-1 text-xs text-rheo-muted">Modification manuelle en mode fake data</p></div><button type="button" class="h-11 rounded-xl px-4 text-xs font-bold" [class]="user.isSubscriber ? 'border border-[#f0c9c9] bg-white text-[#b42318]' : 'bg-rheo-accent text-rheo-dark'" (click)="toggleSubscription(user)">{{ user.isSubscriber ? 'Désactiver l’abonnement' : 'Activer l’abonnement' }}</button></div><div class="mt-6"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rheo-muted">Historique des demandes</p><div class="mt-3 grid gap-2">@for (request of history(user); track request.id) {<div class="flex items-center justify-between gap-4 rounded-xl border border-[#e6ebe2] bg-white px-4 py-3"><span class="min-w-0"><span class="block truncate text-sm font-semibold">{{ request.description }}</span><span class="mt-1 block text-xs text-rheo-muted">{{ SERVICE_TYPE_LABELS[request.serviceType] }} · {{ request.createdAt | date:'dd/MM/yyyy' }}</span></span><span class="rounded-full bg-[#f1f3ef] px-3 py-1 text-[11px] font-semibold text-[#667064]">{{ request.status }}</span></div>} @empty {<p class="rounded-xl bg-white px-4 py-3 text-sm text-rheo-muted">Aucune demande de service enregistrée.</p>}</div></div></div>}</div>} @empty {<div class="p-10 text-center text-sm text-rheo-muted">Aucun utilisateur.</div>}</div></div>
    </section>
  `,
})
export class AdminUsersPage {
  protected readonly admin = inject(AdminService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly selectedId = signal('');
  protected readonly selectedUser = computed(() => this.admin.users().find((user) => user.id === this.selectedId()) ?? null);

  protected select(user: AdminUser): void { this.selectedId.set(this.selectedId() === user.id ? '' : user.id); }
  protected async toggleSubscription(user: AdminUser): Promise<void> { await this.admin.toggleSubscription(user); }
  protected history(user: AdminUser) { return this.admin.serviceRequests().filter((request) => request.userId === user.id || request.clientEmail === user.email); }
  protected initials(name: string): string { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
  protected roleClass(role: string): string { return role === 'admin' ? 'bg-[#eee9fb] text-[#7050a2]' : role === 'abonné' ? 'bg-[#edf5d6] text-[#657b18]' : 'bg-[#f1f3ef] text-[#667064]'; }
}
