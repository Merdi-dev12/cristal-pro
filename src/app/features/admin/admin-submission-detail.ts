import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { PropertySubmission, SubmissionStatus } from '../../shared/models/admin.model';
import { AdminIcon } from '../../shared/components/admin-icon/admin-icon';

@Component({
  selector: 'app-admin-submission-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminIcon],
  template: `
    <section class="mx-auto w-full max-w-6xl">
      <a
        routerLink="/admin/soumissions"
        class="inline-flex items-center gap-2 text-sm font-semibold text-rheo-muted hover:text-rheo-dark"
        >← Retour aux soumissions</a
      >
      @if (submission(); as item) {
        <header class="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.2em] text-rheo-muted">
              Dossier de soumission
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{{ item.title }}</h1>
            <p class="mt-2 text-sm text-rheo-muted">{{ item.city }} · {{ item.address }}</p>
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
        @if (admin.actionMessage()) {
          <p class="mt-5 rounded-xl bg-[#f1f8dd] p-4 text-sm text-[#52651a]">
            {{ admin.actionMessage() }}
          </p>
        }

        <section class="mt-8 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (photo of item.photos; track photo; let index = $index) {
              <button
                type="button"
                class="group relative overflow-hidden rounded-2xl bg-[#eef0eb]"
                (click)="lightbox.set(photo)"
              >
                <img
                  [src]="photo"
                  [alt]="'Photo ' + (index + 1) + ' du bien'"
                  class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                /><span
                  class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white"
                  >Agrandir ⛶</span
                >
              </button>
            } @empty {
              <div
                class="col-span-full grid min-h-64 place-items-center rounded-2xl bg-[#f3f4f1] text-sm text-rheo-muted"
              >
                Aucune photo fournie
              </div>
            }
          </div>
        </section>

        <section class="mt-6 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
          <h2 class="text-xl font-semibold">Informations du bien</h2>
          <p class="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#596057]">
            {{ item.description }}
          </p>
          <dl class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl bg-[#f6f7f4] p-4">
              <dt class="text-xs text-rheo-muted">Propriétaire</dt>
              <dd class="mt-1 font-semibold">{{ item.ownerName }}</dd>
              <dd class="mt-1 text-xs text-rheo-muted">{{ item.ownerEmail }}</dd>
            </div>
            <div class="rounded-xl bg-[#f6f7f4] p-4">
              <dt class="text-xs text-rheo-muted">Transaction</dt>
              <dd class="mt-1 font-semibold">{{ item.type }} · {{ item.category }}</dd>
            </div>
            <div class="rounded-xl bg-[#f6f7f4] p-4">
              <dt class="text-xs text-rheo-muted">Prix</dt>
              <dd class="mt-1 font-semibold">{{ item.price | number }} USD</dd>
            </div>
            <div class="rounded-xl bg-[#f6f7f4] p-4">
              <dt class="text-xs text-rheo-muted">Surface</dt>
              <dd class="mt-1 font-semibold">{{ item.surface | number }} m²</dd>
            </div>
          </dl>
          <a
            [href]="mapUrl(item)"
            target="_blank"
            rel="noopener"
            class="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#dfe3dc] px-4 py-3 text-sm font-semibold hover:bg-[#f6f7f4]"
            ><app-admin-icon name="pin" className="size-5" />Voir la localisation sur la carte
            <app-admin-icon name="external" className="size-4"
          /></a>
        </section>

        @if (item.documents.length) {
          <section class="mt-6 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
            <h2 class="text-xl font-semibold">Documents justificatifs</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              @for (document of item.documents; track document; let index = $index) {
                <a
                  [href]="document"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center justify-between rounded-xl border border-[#e4e6e1] p-4 text-sm font-semibold hover:border-rheo-accent"
                  ><span class="flex items-center gap-2"
                    ><app-admin-icon name="file" className="size-5" />Document {{ index + 1 }}</span
                  ><span class="flex items-center gap-1"
                    >Ouvrir <app-admin-icon name="external" className="size-4" /></span
                ></a>
              }
            </div>
          </section>
        }

        @if (item.status === 'en attente' || item.status === 'informations requises') {
          <section class="mt-6 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
            <h2 class="text-xl font-semibold">Décision de l’équipe</h2>
            <p class="mt-1 text-sm text-rheo-muted">
              Un retour visuel est affiché pendant chaque opération.
            </p>
            <textarea
              [(ngModel)]="message"
              rows="4"
              class="mt-5 w-full resize-y rounded-xl border border-[#dfe3dc] px-4 py-3 text-sm outline-none focus:border-rheo-dark"
              placeholder="Message à transmettre au propriétaire"
            ></textarea>
            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                [disabled]="loading() !== ''"
                (click)="decide(item, 'approve')"
                class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-sm font-bold disabled:opacity-60"
              >
                @if (loading() === 'approve') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                  ></span>
                }
                Valider et publier</button
              ><button
                type="button"
                [disabled]="loading() !== ''"
                (click)="decide(item, 'request_details')"
                class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-300 px-5 text-sm font-semibold text-amber-800 disabled:opacity-60"
              >
                @if (loading() === 'request_details') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800"
                  ></span>
                }
                Demander des précisions</button
              ><button
                type="button"
                [disabled]="loading() !== ''"
                (click)="decide(item, 'reject')"
                class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                @if (loading() === 'reject') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-red-700/20 border-t-red-700"
                  ></span>
                }
                Refuser
              </button>
            </div>
          </section>
        }
      } @else if (admin.isLoading()) {
        <div class="mt-8 h-96 animate-pulse rounded-3xl bg-white"></div>
      } @else {
        <div class="mt-8 rounded-3xl bg-white p-12 text-center">
          <p class="font-semibold">Dossier introuvable.</p>
          <a routerLink="/admin/soumissions" class="mt-4 inline-block text-sm underline"
            >Retour à la liste</a
          >
        </div>
      }
    </section>
    @if (lightbox()) {
      <div
        class="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4"
        (click)="lightbox.set('')"
      >
        <button
          type="button"
          class="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-2xl"
          aria-label="Fermer"
        >
          ×</button
        ><img
          [src]="lightbox()"
          alt="Photo agrandie"
          class="max-h-[90vh] max-w-[95vw] object-contain"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
})
export class AdminSubmissionDetailPage {
  protected readonly admin = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly submission = computed(
    () => this.admin.submissions().find((item) => item.id === this.id) ?? null,
  );
  protected readonly lightbox = signal('');
  protected readonly loading = signal('');
  protected readonly error = signal('');
  protected message = '';
  private markedAsRead = false;
  constructor() {
    effect(() => {
      const item = this.submission();
      if (item && !item.readAt && !this.markedAsRead) {
        this.markedAsRead = true;
        void this.admin.markAsRead('submissions', item.id).catch(() => {
          this.markedAsRead = false;
        });
      }
    });
  }
  protected async decide(
    item: PropertySubmission,
    action: 'approve' | 'reject' | 'request_details',
  ): Promise<void> {
    if (action !== 'approve' && !this.message.trim()) {
      this.error.set('Ajoutez un message avant d’envoyer cette décision.');
      return;
    }
    this.error.set('');
    this.loading.set(action);
    try {
      await this.admin.decideSubmission(item, action, this.message.trim());
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'La décision n’a pas pu être enregistrée.',
      );
    } finally {
      this.loading.set('');
    }
  }
  protected mapUrl(item: PropertySubmission): string {
    return `https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=17/${item.latitude}/${item.longitude}`;
  }
  protected statusClass(status: SubmissionStatus): string {
    return status === 'publiée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'refusée'
        ? 'bg-red-50 text-red-700'
        : status === 'informations requises'
          ? 'bg-[#eef0d7] text-[#65751c]'
          : 'bg-amber-50 text-amber-800';
  }
}
