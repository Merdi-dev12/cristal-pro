import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminContactMessage, ContactMessageStatus } from '../../shared/models/admin.model';
@Component({
  selector: 'app-admin-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<section class="mx-auto w-full max-w-5xl">
    <a routerLink="/admin/contacts" class="text-sm font-semibold text-rheo-muted"
      >← Retour aux contacts</a
    >
    @if (message(); as item) {
      <header class="mt-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-rheo-muted">{{ item.need }}</p>
          <h1 class="mt-2 text-3xl font-semibold">{{ item.fullName }}</h1>
          <p class="mt-2 text-sm text-rheo-muted">
            Reçu le {{ item.createdAt | date: 'dd MMMM yyyy à HH:mm' }}
          </p>
        </div>
        <span
          class="h-fit w-fit rounded-full px-4 py-2 text-xs font-semibold"
          [class]="statusClass(item.status)"
          >{{ label(item.status) }}</span
        >
      </header>
      @if (error()) {
        <p class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
      }
      <section class="mt-8 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-8">
        <dl class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">E-mail</dt>
            <dd class="mt-1 truncate font-semibold">{{ item.email }}</dd>
          </div>
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">Ville</dt>
            <dd class="mt-1 font-semibold">{{ item.city || 'Non précisée' }}</dd>
          </div>
          <div class="rounded-xl bg-[#f6f7f4] p-4">
            <dt class="text-xs text-rheo-muted">Notification</dt>
            <dd class="mt-1 font-semibold">{{ item.notificationStatus }}</dd>
          </div>
        </dl>
        <div class="mt-6 rounded-2xl border border-[#e4e6e1] p-5">
          <p class="whitespace-pre-wrap text-base leading-8">{{ item.message }}</p>
        </div>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            [href]="'mailto:' + item.email"
            class="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-rheo-accent px-5 text-sm font-bold"
            >✉ Répondre par e-mail</a
          ><button
            type="button"
            [disabled]="loading()"
            (click)="archive(item)"
            class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] px-5 text-sm font-semibold disabled:opacity-60"
          >
            @if (loading()) {
              <span
                class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
              ></span>
            }
            Archiver
          </button>
        </div>
      </section>
    } @else if (admin.isLoading()) {
      <div class="mt-8 h-80 animate-pulse rounded-3xl bg-white"></div>
    } @else {
      <p class="mt-8 rounded-2xl bg-white p-10 text-center">Message introuvable.</p>
    }
  </section>`,
})
export class AdminContactDetailPage {
  protected readonly admin = inject(AdminService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly message = computed(
    () => this.admin.contactMessages().find((m) => m.id === this.id) ?? null,
  );
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  private marked = false;
  constructor() {
    effect(() => {
      const item = this.message();
      if (item?.status === 'new' && !this.marked) {
        this.marked = true;
        void this.markRead(item);
      }
    });
  }
  private async markRead(item: AdminContactMessage): Promise<void> {
    try {
      await this.admin.updateContactMessage(item.id, 'read');
    } catch {}
  }
  protected async archive(item: AdminContactMessage): Promise<void> {
    this.loading.set(true);
    try {
      await this.admin.updateContactMessage(item.id, 'archived');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Archivage impossible.');
    } finally {
      this.loading.set(false);
    }
  }
  protected label(s: ContactMessageStatus): string {
    return s === 'new' ? 'Nouvelle' : s === 'read' ? 'Lue' : 'Archivée';
  }
  protected statusClass(s: ContactMessageStatus): string {
    return s === 'new'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : s === 'read'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-gray-100 text-gray-600';
  }
}
