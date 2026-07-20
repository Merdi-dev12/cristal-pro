import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminProperty, AdminPropertyDraft } from '../../shared/models/admin.model';
import { PropertyCategory, PropertyType } from '../../shared/models/property.model';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">Annonces</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Le catalogue, à jour.</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-rheo-muted">
            Créez, publiez, vérifiez et protégez les informations sensibles de chaque bien.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex w-fit items-center gap-2 rounded-xl bg-rheo-dark px-4 py-3 text-sm font-semibold text-white hover:bg-[#323a31]"
          (click)="newProperty()"
        >
          Nouvelle annonce <span class="text-rheo-accent">+</span>
        </button>
      </header>

      <div class="mt-8 grid gap-6 xl:grid-cols-2">
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
          <div
            class="flex flex-wrap items-center gap-2 border-b border-[#edf0eb] px-5 py-4 sm:px-6"
          >
            <input
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              class="h-10 min-w-[180px] flex-1 rounded-xl border border-[#dfe3dc] px-3 text-xs outline-none focus:border-rheo-dark"
              placeholder="Rechercher une annonce..."
            /><select
              [ngModel]="filterStatus()"
              (ngModelChange)="filterStatus.set($event)"
              class="h-10 rounded-xl border border-[#dfe3dc] bg-white px-3 text-xs font-semibold outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiées</option>
              <option value="draft">Brouillons</option>
              <option value="archived">Archivées</option>
            </select>
          </div>
          <div class="divide-y divide-[#edf0eb]">
            @for (property of filteredProperties(); track property.id) {
              <div
                class="flex items-center gap-3 px-5 py-4 transition hover:bg-[#fafbf9] sm:px-6"
                [class.bg-[#f8fbe9]]="selectedId() === property.id"
              >
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-3 text-left"
                  (click)="editProperty(property)"
                >
                  <img
                    [src]="property.imageUrl || '/assets/hero_img.png'"
                    alt=""
                    class="size-12 shrink-0 rounded-xl object-cover"
                  /><span class="min-w-0"
                    ><strong class="block truncate text-sm">{{ property.title }}</strong
                    ><span class="mt-1 block truncate text-xs text-rheo-muted"
                      >{{ property.location }} · {{ property.price | number }} $</span
                    ><span
                      class="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold"
                      [class]="statusClass(property.status)"
                      >{{
                        property.status === 'published'
                          ? 'publiée'
                          : property.status === 'draft'
                            ? 'brouillon'
                            : 'archivée'
                      }}</span
                    ></span
                  >
                </button>
                <button
                  type="button"
                  class="rounded-lg px-2 py-2 text-xs font-semibold text-[#667064] hover:bg-[#edf0eb]"
                  [title]="property.status === 'published' ? 'Dépublier' : 'Publier'"
                  (click)="togglePublication(property)"
                >
                  {{ property.status === 'published' ? '◉' : '○' }}
                </button>
              </div>
            } @empty {
              <div class="p-10 text-center text-sm text-rheo-muted">Aucune annonce trouvée.</div>
            }
          </div>
        </section>

        <aside class="rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-rheo-muted">
                {{ draft.id ? 'Modifier l’annonce' : 'Créer une annonce' }}
              </p>
              <h2 class="mt-2 text-xl font-semibold">
                {{ draft.id ? draft.title : 'Nouvelle fiche bien' }}
              </h2>
            </div>
            @if (draft.id) {
              <button
                type="button"
                class="text-xs font-semibold text-[#b42318] hover:underline"
                (click)="removeCurrent()"
              >
                Supprimer
              </button>
            }
          </div>
          @if (actionError()) {
            <p class="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{{ actionError() }}</p>
          }
          <div class="mt-6 grid gap-3">
            <label class="text-xs font-semibold text-rheo-muted"
              >Titre<input
                [(ngModel)]="draft.title"
                class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm outline-none focus:border-rheo-dark"
                placeholder="Ex. Villa contemporaine à Binza"
            /></label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="text-xs font-semibold text-rheo-muted"
                >Transaction<select
                  [(ngModel)]="draft.type"
                  class="mt-2 h-11 w-full rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm"
                >
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select></label
              ><label class="text-xs font-semibold text-rheo-muted"
                >Catégorie<select
                  [(ngModel)]="draft.category"
                  class="mt-2 h-11 w-full rounded-xl border border-[#dfe3dc] bg-white px-3 text-sm"
                >
                  <option value="maison">Maison</option>
                  <option value="appartement">Appartement</option>
                  <option value="residence">Résidence</option>
                  <option value="terrain">Terrain</option>
                </select></label
              >
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Prix<input
                  type="number"
                  [(ngModel)]="draft.price"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm" /></label
              ><label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Suffixe<input
                  [(ngModel)]="draft.priceSuffix"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm"
                  placeholder="/mois" /></label
              ><label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Surface<input
                  type="number"
                  [(ngModel)]="draft.surface"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm"
              /></label>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="text-xs font-semibold text-rheo-muted"
                >Ville / quartier<input
                  [(ngModel)]="draft.location"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm" /></label
              ><label class="text-xs font-semibold text-rheo-muted"
                >Adresse<input
                  [(ngModel)]="draft.address"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm"
              /></label>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Chambres<input
                  type="number"
                  [(ngModel)]="draft.bedrooms"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm" /></label
              ><label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Salles de bain<input
                  type="number"
                  [(ngModel)]="draft.bathrooms"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm" /></label
              ><label class="min-w-0 text-xs font-semibold text-rheo-muted"
                >Propriétaire<input
                  [(ngModel)]="draft.ownerName"
                  class="mt-2 h-11 w-full min-w-0 rounded-xl border border-[#dfe3dc] px-3 text-sm"
              /></label>
            </div>
            <label class="text-xs font-semibold text-rheo-muted"
              >Description<textarea
                [(ngModel)]="draft.description"
                rows="3"
                class="mt-2 w-full resize-y rounded-xl border border-[#dfe3dc] px-3 py-3 text-sm"
              ></textarea>
            </label>
            <label class="text-xs font-semibold text-rheo-muted"
              >Informations sensibles réservées aux abonnés<textarea
                [(ngModel)]="draft.sensitiveInfo"
                rows="2"
                class="mt-2 w-full resize-y rounded-xl border border-[#ead8ae] bg-[#fffcf3] px-3 py-3 text-sm"
                placeholder="Coordonnées, code d’accès, documents..."
              ></textarea>
            </label>
            <div class="flex flex-wrap gap-4 text-xs">
              <label class="inline-flex items-center gap-2"
                ><input type="checkbox" [(ngModel)]="draft.verified" class="accent-[#657b18]" />
                Annonce vérifiée</label
              ><label class="inline-flex items-center gap-2"
                ><input type="checkbox" [(ngModel)]="draft.featured" class="accent-[#657b18]" />
                Mise en avant</label
              ><label class="inline-flex items-center gap-2"
                ><span>Statut</span
                ><select
                  [(ngModel)]="draft.status"
                  class="rounded-lg border border-[#dfe3dc] px-2 py-1"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publiée</option>
                  <option value="archived">Archivée</option>
                </select></label
              >
            </div>
            <button
              type="button"
              class="mt-2 h-11 rounded-xl bg-rheo-accent text-sm font-bold hover:bg-rheo-accent-hover"
              (click)="save()"
            >
              Enregistrer l’annonce
            </button>
          </div>

          <div class="mt-7 border-t border-[#edf0eb] pt-5">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-rheo-muted">
                Photos
              </p>
              <span class="text-[10px] text-rheo-muted">{{ draft.photos.length }}/12</span>
            </div>
            @if (draft.photos.length) {
              <div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                @for (photo of draft.photos; track photo) {
                  <div class="group relative">
                    <img
                      [src]="photo"
                      alt=""
                      class="aspect-square w-full rounded-xl object-cover"
                    /><button
                      type="button"
                      class="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white/95 text-xs text-[#b42318] shadow"
                      (click)="removePhoto(photo)"
                      aria-label="Supprimer la photo"
                    >
                      ×
                    </button>
                  </div>
                }
              </div>
            }
            @if (draft.id) {
              <label
                class="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#dfe3dc] px-4 py-4 text-xs font-semibold transition hover:border-rheo-accent hover:bg-[#fbfdeb]"
                >{{ uploading() ? 'Upload en cours…' : 'Choisir une ou plusieurs images'
                }}<input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  class="sr-only"
                  [disabled]="uploading()"
                  (change)="addPhotos($event)"
              /></label>
            } @else {
              <p class="mt-3 rounded-xl bg-rheo-bg p-3 text-xs leading-5 text-rheo-muted">
                Enregistrez d’abord la fiche, puis ajoutez ses images.
              </p>
            }
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class AdminPropertiesPage {
  protected readonly admin = inject(AdminService);
  protected readonly search = signal('');
  protected readonly filterStatus = signal<'all' | AdminProperty['status']>('all');
  protected readonly selectedId = signal('');
  protected readonly uploading = signal(false);
  protected readonly actionError = signal('');
  protected draft: AdminPropertyDraft = createDraft();
  protected readonly filteredProperties = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.filterStatus();
    return this.admin
      .properties()
      .filter(
        (property) =>
          (!query || `${property.title} ${property.location}`.toLowerCase().includes(query)) &&
          (status === 'all' || property.status === status),
      );
  });

  protected newProperty(): void {
    this.draft = createDraft();
    this.selectedId.set('');
    this.actionError.set('');
  }
  protected editProperty(property: AdminProperty): void {
    this.selectedId.set(property.id);
    this.draft = {
      ...property,
      photos: [...property.photos],
      priceSuffix: property.priceSuffix ?? '',
    };
    this.actionError.set('');
  }
  protected async save(): Promise<void> {
    try {
      const property = await this.admin.saveProperty(this.draft);
      this.editProperty(property);
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    }
  }
  protected async togglePublication(property: AdminProperty): Promise<void> {
    await this.admin.setPropertyStatus(
      property,
      property.status === 'published' ? 'draft' : 'published',
    );
  }
  protected async removeCurrent(): Promise<void> {
    const property = this.currentProperty();
    if (!property) return;
    await this.admin.deleteProperty(property);
    this.newProperty();
  }

  protected async addPhotos(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const property = this.currentProperty();
    if (!property || !files.length) return;
    if (
      files.some(
        (file) =>
          !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) ||
          file.size > 6 * 1024 * 1024,
      )
    ) {
      this.actionError.set(
        'Choisissez uniquement des images JPG, PNG, WebP ou AVIF de 6 Mo maximum.',
      );
      return;
    }
    this.uploading.set(true);
    this.actionError.set('');
    try {
      const updated = await this.admin.addPhotos(property, files);
      this.editProperty(updated);
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    } finally {
      this.uploading.set(false);
    }
  }

  protected async removePhoto(photo: string): Promise<void> {
    const property = this.currentProperty();
    if (!property) return;
    try {
      await this.admin.removePhoto(property, photo);
      const updated = this.currentProperty();
      if (updated) this.editProperty(updated);
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    }
  }
  private currentProperty(): AdminProperty | undefined {
    return this.admin.properties().find((item) => item.id === this.draft.id);
  }
  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'L’opération a échoué.';
  }
  protected statusClass(status: AdminProperty['status']): string {
    return status === 'published'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'archived'
        ? 'bg-[#f1f3ef] text-[#667064]'
        : 'bg-[#fff4d9] text-[#946200]';
  }
}

function createDraft(): AdminPropertyDraft {
  return {
    title: '',
    price: 0,
    priceSuffix: '',
    location: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    surface: 0,
    type: 'vente' as PropertyType,
    category: 'maison' as PropertyCategory,
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
