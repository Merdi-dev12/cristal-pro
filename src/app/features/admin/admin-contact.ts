import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ContactMessageStatus } from '../../shared/models/admin.model';
import { AdminIcon } from '../../shared/components/admin-icon/admin-icon';
@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminIcon],
  template: ` <section>
    <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[.2em] text-rheo-muted">
          Boîte de réception
        </p>
        <h1 class="mt-2 text-3xl font-semibold">Demandes de contact</h1>
      </div>
      <div class="rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-sm">
        <strong>{{ unreadCount() }}</strong> <span class="text-rheo-muted">nouvelle(s)</span>
      </div>
    </header>
    <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
      <div class="flex flex-wrap gap-3 border-b border-[#edf0eb] p-4 sm:p-5">
        <label class="relative min-w-[240px] flex-1"
          ><span class="absolute left-3 top-3"
            ><app-admin-icon name="search" className="size-5" /></span
          ><input
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            class="h-11 w-full rounded-xl border border-[#dfe3dc] pl-9 pr-3 text-sm"
            placeholder="Nom, e-mail, besoin, message…" /></label
        ><select
          [ngModel]="filter()"
          (ngModelChange)="filter.set($event)"
          class="h-11 rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm font-semibold"
        >
          <option value="all">Toutes</option>
          <option value="new">Nouvelles</option>
          <option value="read">Lues</option>
          <option value="archived">Archivées</option></select
        ><span class="self-center text-xs text-rheo-muted"
          >{{ messages().length }} résultat(s)</span
        >
      </div>
      <div class="divide-y divide-[#edf0eb]">
        @for (item of messages(); track item.id) {
          <a
            [routerLink]="['/admin/contacts', item.id]"
            class="group flex items-start gap-4 px-5 py-5 hover:bg-[#fafbf9] sm:px-6"
            ><span
              class="mt-2 size-2.5 shrink-0 rounded-full"
              [class]="item.status === 'new' ? 'bg-rheo-accent' : 'bg-gray-300'"
            ></span
            ><span class="min-w-0 flex-1"
              ><span class="flex flex-wrap justify-between gap-2"
                ><strong>{{ item.fullName }}</strong
                ><small class="text-rheo-muted">{{
                  item.createdAt | date: 'dd/MM/yyyy HH:mm'
                }}</small></span
              ><span class="mt-1 block text-xs font-semibold text-[#657b18]"
                >{{ item.need }} · {{ item.city || 'Ville non précisée' }}</span
              ><span class="mt-2 block truncate text-sm text-rheo-muted">{{
                item.message
              }}</span></span
            ><span
              class="hidden items-center gap-1 self-center font-semibold text-[#657b18] sm:flex"
              >Lire <app-admin-icon name="arrow-right" className="size-4" /></span
          ></a>
        } @empty {
          <p class="p-12 text-center text-sm text-rheo-muted">Aucun message trouvé.</p>
        }
      </div>
    </section>
  </section>`,
})
export class AdminContactPage {
  protected readonly admin = inject(AdminService);
  protected readonly search = signal('');
  protected readonly filter = signal<'all' | ContactMessageStatus>('all');
  protected readonly unreadCount = computed(
    () => this.admin.contactMessages().filter((m) => m.status === 'new').length,
  );
  protected readonly messages = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.admin
      .contactMessages()
      .filter(
        (m) =>
          (this.filter() === 'all' || m.status === this.filter()) &&
          (!q ||
            `${m.fullName} ${m.email} ${m.city} ${m.need} ${m.message}`.toLowerCase().includes(q)),
      );
  });
}
