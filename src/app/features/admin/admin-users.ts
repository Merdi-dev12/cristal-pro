import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminUser, AdminUserRole } from '../../shared/models/admin.model';
import { SERVICE_TYPE_LABELS } from '../../shared/models/service-request.model';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<section>
    <header>
      <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">Utilisateurs</p>
      <h1 class="mt-2 text-3xl font-semibold">Utilisateurs</h1>
    </header>
    <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
      <div class="flex flex-wrap gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
        <input
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          class="h-11 min-w-[240px] flex-1 rounded-xl border border-[#dfe3dc] px-4 text-sm"
          placeholder="Nom, e-mail ou téléphone…"
        /><select
          [ngModel]="role()"
          (ngModelChange)="role.set($event)"
          class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
        >
          <option value="all">Tous les comptes</option>
          <option value="utilisateur">Utilisateurs</option>
          <option value="abonné">Abonnés</option>
          <option value="admin">Administrateurs</option></select
        ><span class="self-center text-xs text-rheo-muted">{{ users().length }} résultat(s)</span>
      </div>
      <div class="divide-y divide-[#edf0eb]">
        @for (user of users(); track user.id) {
          <div>
            <button
              type="button"
              class="grid w-full gap-3 px-5 py-5 text-left hover:bg-[#fafbf9] sm:grid-cols-[1.4fr_1fr_auto_auto] sm:items-center sm:px-6"
              (click)="select(user)"
            >
              <span
                ><strong class="block">{{ user.name }}</strong
                ><small class="mt-1 block text-rheo-muted"
                  >{{ user.email }} · {{ user.phone }}</small
                ></span
              ><span class="text-xs text-rheo-muted"
                >Inscrit le {{ user.joinedAt | date: 'dd MMM yyyy' }}</span
              ><span
                class="w-fit rounded-full px-3 py-1 text-[11px] font-semibold"
                [class]="roleClass(user.role)"
                >{{ user.role }}</span
              ><span>{{ selectedId() === user.id ? '⌃' : '⌄' }}</span>
            </button>
            @if (selectedId() === user.id) {
              <div class="border-t border-[#edf0eb] bg-[#fbfcfa] p-5 sm:p-6">
                <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p class="font-semibold">
                      {{ user.isSubscriber ? 'Accès premium actif' : 'Accès standard' }}
                    </p>
                    <p class="mt-1 text-xs text-rheo-muted">
                      {{ history(user).length }} demande(s) liée(s) à ce compte.
                    </p>
                  </div>
                  <button
                    type="button"
                    [disabled]="loadingId() === user.id"
                    (click)="toggle(user)"
                    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-xs font-bold disabled:opacity-60"
                  >
                    @if (loadingId() === user.id) {
                      <span
                        class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                      ></span>
                    }
                    {{ user.isSubscriber ? 'Désactiver' : 'Activer' }} l’abonnement
                  </button>
                </div>
                <div class="mt-5 grid gap-2 sm:grid-cols-2">
                  @for (request of history(user); track request.id) {
                    <div class="rounded-xl border border-[#e6ebe2] bg-white p-4 text-xs">
                      <strong>{{ request.description }}</strong
                      ><span class="mt-1 block text-rheo-muted"
                        >{{ SERVICE_TYPE_LABELS[request.serviceType] }} · {{ request.status }}</span
                      >
                    </div>
                  } @empty {
                    <p class="text-sm text-rheo-muted">Aucune demande enregistrée.</p>
                  }
                </div>
              </div>
            }
          </div>
        } @empty {
          <p class="p-12 text-center text-sm text-rheo-muted">Aucun utilisateur trouvé.</p>
        }
      </div>
    </section>
  </section>`,
})
export class AdminUsersPage {
  protected readonly admin = inject(AdminService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly search = signal('');
  protected readonly role = signal<'all' | AdminUserRole>('all');
  protected readonly selectedId = signal('');
  protected readonly loadingId = signal('');
  protected readonly users = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.admin
      .users()
      .filter(
        (u) =>
          (this.role() === 'all' || u.role === this.role()) &&
          (!q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q)),
      );
  });
  protected select(u: AdminUser): void {
    this.selectedId.set(this.selectedId() === u.id ? '' : u.id);
  }
  protected async toggle(u: AdminUser): Promise<void> {
    this.loadingId.set(u.id);
    try {
      await this.admin.toggleSubscription(u);
    } finally {
      this.loadingId.set('');
    }
  }
  protected history(u: AdminUser) {
    return this.admin
      .serviceRequests()
      .filter((r) => r.userId === u.id || r.clientEmail === u.email);
  }
  protected roleClass(r: AdminUserRole): string {
    return r === 'admin'
      ? 'bg-purple-50 text-purple-700'
      : r === 'abonné'
        ? 'bg-[#edf5d6] text-[#657b18]'
        : 'bg-gray-100 text-gray-600';
  }
}
