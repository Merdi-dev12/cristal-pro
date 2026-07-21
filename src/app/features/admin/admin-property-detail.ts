import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminProperty, AdminPropertyDraft } from '../../shared/models/admin.model';
import { AdminIcon } from '../../shared/components/admin-icon/admin-icon';

@Component({
  selector: 'app-admin-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminIcon],
  template: `
    <section class="mx-auto w-full max-w-6xl">
      <a
        routerLink="/admin/annonces"
        class="text-sm font-semibold text-rheo-muted hover:text-rheo-dark"
        >← Retour aux annonces</a
      >
      @if (property(); as item) {
        <header class="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.2em] text-rheo-muted">
              Gestion de l’annonce
            </p>
            <h1 class="mt-2 text-3xl font-semibold">{{ item.title }}</h1>
            <p class="mt-2 text-sm text-rheo-muted">
              {{ item.location }} · créée le {{ item.createdAt | date: 'dd MMM yyyy' }}
            </p>
          </div>
          <a
            [routerLink]="['/annonces', item.id]"
            target="_blank"
            class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm font-semibold"
            >Voir sur le site <app-admin-icon name="external" className="size-4"
          /></a>
        </header>
        @if (error()) {
          <p class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
        }
        @if (saved()) {
          <p class="mt-5 rounded-xl bg-[#f1f8dd] p-4 text-sm text-[#52651a]">
            Les modifications ont été enregistrées.
          </p>
        }
        <section class="mt-8 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">Photos</h2>
              <p class="mt-1 text-sm text-rheo-muted">Cliquez sur une image pour l’agrandir.</p>
            </div>
            <span class="text-xs text-rheo-muted">{{ draft.photos.length }}/12</span>
          </div>
          <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (photo of draft.photos; track photo) {
              <div class="group relative">
                <button
                  type="button"
                  class="w-full overflow-hidden rounded-2xl"
                  (click)="lightbox.set(photo)"
                >
                  <img
                    [src]="photo"
                    alt="Photo du bien"
                    class="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                  /></button
                ><button
                  type="button"
                  [disabled]="loading() !== ''"
                  (click)="removePhoto(item, photo)"
                  class="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white text-red-700 shadow"
                >
                  ×
                </button>
              </div>
            } @empty {
              <div
                class="col-span-full grid min-h-44 place-items-center rounded-2xl bg-[#f3f4f1] text-sm text-rheo-muted"
              >
                Aucune photo
              </div>
            }
          </div>
          <label
            class="mt-4 flex cursor-pointer justify-center rounded-xl border-2 border-dashed border-[#dfe3dc] p-4 text-sm font-semibold hover:border-rheo-accent"
          >
            @if (loading() === 'upload') {
              <span class="inline-flex items-center gap-2"
                ><span
                  class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                ></span
                >Import en cours…</span
              >
            } @else {
              <span class="inline-flex items-center gap-2"
                ><app-admin-icon name="upload" className="size-5" />Ajouter des photos</span
              >
            }
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              class="sr-only"
              [disabled]="loading() !== ''"
              (change)="addPhotos(item, $event)"
          /></label>
        </section>
        <form
          class="mt-6 rounded-3xl border border-[#e4e6e1] bg-white p-5 sm:p-7"
          (ngSubmit)="save()"
        >
          <h2 class="text-xl font-semibold">Informations de l’annonce</h2>
          <div class="mt-5 grid gap-4">
            <label class="text-sm font-semibold"
              >Titre<input
                [(ngModel)]="draft.title"
                name="title"
                class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
            /></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="text-sm font-semibold"
                >Transaction<select
                  [(ngModel)]="draft.type"
                  name="type"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal"
                >
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select></label
              ><label class="text-sm font-semibold"
                >Catégorie<select
                  [(ngModel)]="draft.category"
                  name="category"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal"
                >
                  <option value="maison">Maison</option>
                  <option value="appartement">Appartement</option>
                  <option value="residence">Résidence</option>
                  <option value="terrain">Terrain</option>
                </select></label
              >
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="text-sm font-semibold"
                >Ville / quartier<input
                  [(ngModel)]="draft.location"
                  name="location"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
              ><label class="text-sm font-semibold"
                >Adresse<input
                  [(ngModel)]="draft.address"
                  name="address"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
              /></label>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label class="text-sm font-semibold"
                >Prix<input
                  type="number"
                  [(ngModel)]="draft.price"
                  name="price"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
              ><label class="text-sm font-semibold"
                >Surface<input
                  type="number"
                  [(ngModel)]="draft.surface"
                  name="surface"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
              ><label class="text-sm font-semibold"
                >Chambres<input
                  type="number"
                  [(ngModel)]="draft.bedrooms"
                  name="bedrooms"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label
              ><label class="text-sm font-semibold"
                >Salles d’eau<input
                  type="number"
                  [(ngModel)]="draft.bathrooms"
                  name="bathrooms"
                  class="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal"
              /></label>
            </div>
            <label class="text-sm font-semibold"
              >Description<textarea
                [(ngModel)]="draft.description"
                name="description"
                rows="6"
                class="mt-2 w-full rounded-xl border border-[#dfe3dc] px-4 py-3 font-normal"
              ></textarea></label
            ><label class="text-sm font-semibold"
              >Informations sensibles<textarea
                [(ngModel)]="draft.sensitiveInfo"
                name="sensitive"
                rows="3"
                class="mt-2 w-full rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 font-normal"
              ></textarea>
            </label>
            <div class="flex flex-wrap gap-5 text-sm">
              <label class="flex items-center gap-2"
                ><input type="checkbox" [(ngModel)]="draft.verified" name="verified" />
                Vérifiée</label
              ><label class="flex items-center gap-2"
                ><input type="checkbox" [(ngModel)]="draft.featured" name="featured" /> Mise en
                avant</label
              ><label class="flex items-center gap-2"
                >Statut
                <select
                  [(ngModel)]="draft.status"
                  name="status"
                  class="rounded-lg border border-[#dfe3dc] px-3 py-2"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publiée</option>
                  <option value="archived">Archivée</option>
                </select></label
              >
            </div>
            @if (draft.latitude != null && draft.longitude != null) {
              <a
                [href]="mapUrl()"
                target="_blank"
                rel="noopener"
                class="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#657b18]"
                ><app-admin-icon name="pin" className="size-5" />Voir la position enregistrée sur la
                carte <app-admin-icon name="external" className="size-4"
              /></a>
            }
            <div class="flex flex-col gap-3 sm:flex-row">
              <button
                [disabled]="loading() !== ''"
                class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rheo-accent px-5 text-sm font-bold disabled:opacity-60"
              >
                @if (loading() === 'save') {
                  <span
                    class="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                  ></span>
                }
                Enregistrer l’annonce</button
              ><button
                type="button"
                [disabled]="loading() !== ''"
                (click)="remove(item)"
                class="min-h-12 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          </div>
        </form>
      } @else if (admin.isLoading()) {
        <div class="mt-8 h-96 animate-pulse rounded-3xl bg-white"></div>
      } @else {
        <p class="mt-8 rounded-2xl bg-white p-12 text-center">Annonce introuvable.</p>
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
export class AdminPropertyDetailPage {
  protected readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly property = computed(
    () => this.admin.properties().find((p) => p.id === this.id) ?? null,
  );
  protected draft: AdminPropertyDraft = emptyDraft();
  protected readonly loading = signal('');
  protected readonly error = signal('');
  protected readonly saved = signal(false);
  protected readonly lightbox = signal('');
  private markedAsRead = false;
  constructor() {
    effect(() => {
      const p = this.property();
      if (p) {
        this.draft = { ...p, photos: [...p.photos], priceSuffix: p.priceSuffix ?? '' };
        if (!p.readAt && !this.markedAsRead) {
          this.markedAsRead = true;
          void this.admin.markAsRead('properties', p.id).catch(() => {
            this.markedAsRead = false;
          });
        }
      }
    });
  }
  protected async save(): Promise<void> {
    this.loading.set('save');
    this.saved.set(false);
    this.error.set('');
    try {
      await this.admin.saveProperty(this.draft);
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async addPhotos(item: AdminProperty, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    this.loading.set('upload');
    try {
      await this.admin.addPhotos(item, files);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Import impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async removePhoto(item: AdminProperty, photo: string): Promise<void> {
    this.loading.set('photo');
    try {
      await this.admin.removePhoto(item, photo);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Suppression impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected async remove(item: AdminProperty): Promise<void> {
    if (!window.confirm('Supprimer définitivement cette annonce ?')) return;
    this.loading.set('delete');
    try {
      await this.admin.deleteProperty(item);
      await this.router.navigateByUrl('/admin/annonces');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Suppression impossible.');
    } finally {
      this.loading.set('');
    }
  }
  protected mapUrl(): string {
    return `https://www.openstreetmap.org/?mlat=${this.draft.latitude}&mlon=${this.draft.longitude}#map=17/${this.draft.latitude}/${this.draft.longitude}`;
  }
}
function emptyDraft(): AdminPropertyDraft {
  return {
    title: '',
    price: 0,
    priceSuffix: '',
    location: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    surface: 0,
    type: 'vente',
    category: 'maison',
    imageUrl: '',
    photos: [],
    status: 'draft',
    featured: false,
    verified: false,
    description: '',
    sensitiveInfo: '',
    ownerName: '',
  };
}
