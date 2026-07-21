import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { VisitRequest, VisitStatus } from '../../shared/models/admin.model';
import { AdminIcon } from '../../shared/components/admin-icon/admin-icon';

@Component({
  selector: 'app-admin-visit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminIcon],
  template: `
    <section class="mx-auto w-full max-w-5xl">
      <a
        routerLink="/admin/visites"
        class="text-sm font-semibold text-rheo-muted hover:text-rheo-dark"
        >← Retour aux visites</a
      >
      @if (visit(); as item) {
        <header class="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.2em] text-rheo-muted">
              Détail de la visite
            </p>
            <h1 class="mt-2 text-3xl font-semibold">{{ item.propertyTitle }}</h1>
            <p class="mt-2 text-sm text-rheo-muted">Demandée par {{ item.userName }}</p>
          </div>
          <span
            class="w-fit rounded-full px-4 py-2 text-xs font-semibold"
            [class]="statusClass(item.status)"
            >{{ item.status }}</span
          >
        </header>
        @if (error()) {
          <p class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
        }
        @if (saved()) {
          <p class="mt-5 rounded-xl bg-[#f1f8dd] p-4 text-sm text-[#52651a]">
            Le suivi a été enregistré.
          </p>
        }
        <section class="mt-8 overflow-hidden rounded-3xl border border-[#e4e6e1] bg-white">
          <img
            [src]="item.propertyImageUrl || '/assets/hero_img.png'"
            alt="Bien à visiter"
            class="max-h-[520px] w-full object-cover"
          />
          <div class="p-5 sm:p-7">
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-xl bg-[#f6f7f4] p-4">
                <p class="text-xs text-rheo-muted">Rendez-vous souhaité</p>
                <p class="mt-1 font-semibold">{{ item.requestedDate | date: 'EEEE d MMMM y' }}</p>
                <p class="mt-1 text-sm">{{ item.requestedTime }}</p>
              </div>
              <div class="rounded-xl bg-[#f6f7f4] p-4">
                <p class="text-xs text-rheo-muted">Demandeur</p>
                <p class="mt-1 font-semibold">{{ item.userName }}</p>
                <a
                  [href]="'mailto:' + item.userEmail"
                  class="mt-1 block truncate text-sm text-[#657b18]"
                  >{{ item.userEmail }}</a
                >
              </div>
              <div class="rounded-xl bg-[#f6f7f4] p-4">
                <p class="text-xs text-rheo-muted">Bien</p>
                <p class="mt-1 font-semibold">{{ item.propertyLocation }}</p>
                <a
                  [routerLink]="['/admin/annonces', item.propertyId]"
                  class="mt-1 inline-flex items-center gap-1 text-sm text-[#657b18]"
                  >Voir l’annonce <app-admin-icon name="arrow-right" className="size-4"
                /></a>
              </div>
            </div>
            @if (item.message) {
              <div class="mt-5 rounded-xl border border-[#e4e6e1] p-4">
                <p class="text-xs font-bold uppercase tracking-[.15em] text-rheo-muted">Message</p>
                <p class="mt-2 whitespace-pre-wrap text-sm leading-7">{{ item.message }}</p>
              </div>
            }
          </div>
        </section>
        <section class="mt-6 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
          <h2 class="text-xl font-semibold">Suivi interne</h2>
          <div class="mt-5 grid gap-4">
            <label class="text-sm font-semibold"
              >Statut<select
                [(ngModel)]="draftStatus"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4"
              >
                <option value="en attente">En attente</option>
                <option value="confirmée">Confirmée</option>
                <option value="annulée">Annulée</option>
                <option value="terminée">Terminée</option>
              </select></label
            ><label class="text-sm font-semibold"
              >Note interne<textarea
                [(ngModel)]="draftNote"
                rows="5"
                class="mt-2 w-full rounded-xl border border-[#dfe3dc] px-4 py-3 font-normal"
                placeholder="Informations utiles pour l’équipe…"
              ></textarea>
            </label>
            <div class="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                [disabled]="loading() !== ''"
                (click)="save(item)"
                class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-sm font-bold disabled:opacity-60"
              >
                @if (loading() === 'save') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                  ></span>
                }
                Enregistrer le suivi</button
              ><button
                type="button"
                [disabled]="loading() !== ''"
                (click)="notify(item)"
                class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] px-5 text-sm font-semibold disabled:opacity-60"
              >
                @if (loading() === 'notify') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                  ></span>
                }
                Préparer la notification
              </button>
            </div>
          </div>
        </section>
      } @else if (admin.isLoading()) {
        <div class="mt-8 h-96 animate-pulse rounded-3xl bg-white"></div>
      } @else {
        <p class="mt-8 rounded-2xl bg-white p-10 text-center">Demande introuvable.</p>
      }
    </section>
  `,
})
export class AdminVisitDetailPage {
  protected readonly admin = inject(AdminService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly visit = computed(
    () => this.admin.visits().find((v) => v.id === this.id) ?? null,
  );
  protected readonly loading = signal('');
  protected readonly error = signal('');
  protected readonly saved = signal(false);
  protected draftStatus: VisitStatus = 'en attente';
  protected draftNote = '';
  private markedAsRead = false;
  constructor() {
    effect(() => {
      const item = this.visit();
      if (item) {
        this.draftStatus = item.status;
        this.draftNote = item.internalNote;
        if (!item.readAt && !this.markedAsRead) {
          this.markedAsRead = true;
          void this.admin.markAsRead('visits', item.id).catch(() => {
            this.markedAsRead = false;
          });
        }
      }
    });
  }
  protected async save(item: VisitRequest): Promise<void> {
    this.loading.set('save');
    this.error.set('');
    this.saved.set(false);
    try {
      await this.admin.updateVisit(item.id, this.draftStatus, this.draftNote);
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async notify(item: VisitRequest): Promise<void> {
    this.loading.set('notify');
    this.error.set('');
    try {
      await this.admin.prepareNotification(
        'visite',
        item.id,
        `Bonjour ${item.userName}, votre visite pour « ${item.propertyTitle} » est suivie par RHEODYCE.`,
      );
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Notification impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected statusClass(status: VisitStatus): string {
    return status === 'terminée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'annulée'
        ? 'bg-red-50 text-red-700'
        : status === 'confirmée'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-amber-50 text-amber-800';
  }
}
