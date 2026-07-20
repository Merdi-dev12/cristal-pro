import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PropertySubmissionService } from '../../core/services/property-submission.service';
import { PropertyCategory, PropertyType } from '../../shared/models/property.model';

interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-property-submission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="min-h-screen bg-rheo-bg pb-20 pt-28">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <a
          routerLink="/location-vente"
          class="text-sm font-semibold text-rheo-muted hover:text-rheo-dark"
          >← Location & Vente</a
        >
        <header class="mt-6 max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[.22em] text-rheo-muted">
            Déposer une annonce
          </p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
            Proposez votre bien.
          </h1>
          <p class="mt-4 leading-7 text-rheo-muted">
            Votre annonce est vérifiée par RHEODYCE avant publication. Vous recevrez la décision
            dans Mes demandes.
          </p>
        </header>

        @if (!auth.isAuthenticated()) {
          <div class="mt-8 rounded-3xl border border-rheo-border bg-white p-8 text-center">
            <p class="font-semibold">Connectez-vous pour déposer une annonce.</p>
            <a
              routerLink="/connexion"
              class="mt-5 inline-flex rounded-xl bg-rheo-accent px-5 py-3 font-bold"
              >Se connecter</a
            >
          </div>
        } @else {
          <form
            class="mt-8 grid gap-6 rounded-[30px] border border-rheo-border bg-white p-5 sm:p-8"
            (ngSubmit)="submit()"
          >
            @if (error()) {
              <p class="rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
            }
            @if (message()) {
              <p class="rounded-xl bg-[#eff8d8] p-4 text-sm text-[#38500d]">{{ message() }}</p>
            }

            <label class="grid gap-2 text-sm font-semibold"
              >Titre
              <input
                [(ngModel)]="title"
                name="title"
                required
                class="min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal outline-none focus:border-rheo-dark"
                placeholder="Ex. Appartement lumineux à Gombe"
              />
            </label>

            <div class="grid gap-5 sm:grid-cols-2">
              <label class="grid gap-2 text-sm font-semibold"
                >Transaction
                <select
                  [(ngModel)]="type"
                  name="type"
                  class="min-w-0 rounded-xl border border-rheo-border bg-white px-4 py-3 font-normal"
                >
                  <option value="location">Location</option>
                  <option value="vente">Vente</option>
                </select>
              </label>
              <label class="grid gap-2 text-sm font-semibold"
                >Type de bien
                <select
                  [(ngModel)]="category"
                  name="category"
                  class="min-w-0 rounded-xl border border-rheo-border bg-white px-4 py-3 font-normal"
                >
                  <option value="maison">Maison</option>
                  <option value="appartement">Appartement</option>
                  <option value="residence">Résidence</option>
                  <option value="terrain">Terrain</option>
                </select>
              </label>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <label class="grid gap-2 text-sm font-semibold"
                >Ville<input
                  [(ngModel)]="city"
                  name="city"
                  required
                  class="min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
                  placeholder="Kinshasa"
              /></label>
              <label class="grid gap-2 text-sm font-semibold"
                >Adresse<input
                  [(ngModel)]="address"
                  name="address"
                  required
                  class="min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
                  placeholder="Commune, quartier"
              /></label>
            </div>

            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label class="grid min-w-0 gap-2 text-sm font-semibold"
                >Prix (USD)<input
                  [(ngModel)]="price"
                  name="price"
                  type="number"
                  min="0"
                  required
                  class="w-full min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
              /></label>
              <label class="grid min-w-0 gap-2 text-sm font-semibold"
                >Surface m²<input
                  [(ngModel)]="surface"
                  name="surface"
                  type="number"
                  min="1"
                  required
                  class="w-full min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
              /></label>
              <label class="grid min-w-0 gap-2 text-sm font-semibold"
                >Chambres<input
                  [(ngModel)]="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  class="w-full min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
              /></label>
              <label class="grid min-w-0 gap-2 text-sm font-semibold"
                >Salles d’eau<input
                  [(ngModel)]="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  class="w-full min-w-0 rounded-xl border border-rheo-border px-4 py-3 font-normal"
              /></label>
            </div>

            <label class="grid gap-2 text-sm font-semibold"
              >Description
              <textarea
                [(ngModel)]="description"
                name="description"
                required
                rows="6"
                class="resize-y rounded-xl border border-rheo-border px-4 py-3 font-normal"
                placeholder="Décrivez le bien, ses atouts et les conditions."
              ></textarea>
            </label>

            <fieldset class="grid gap-3">
              <div>
                <legend class="text-sm font-semibold">Photos du bien</legend>
                <p class="mt-1 text-xs leading-5 text-rheo-muted">
                  1 à 12 images · JPG, PNG, WebP ou AVIF · 6 Mo maximum par image.
                </p>
              </div>
              <label
                class="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8ddd4] bg-[#fafbf9] px-5 py-6 text-center transition hover:border-rheo-accent hover:bg-[#fbfdeb]"
              >
                <span class="text-2xl" aria-hidden="true">＋</span
                ><strong class="mt-2 text-sm">Choisir des images</strong
                ><span class="mt-1 text-xs text-rheo-muted"
                  >Vous pouvez en sélectionner plusieurs à la fois</span
                >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  class="sr-only"
                  (change)="selectPhotos($event)"
                />
              </label>
              @if (photos().length) {
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  @for (photo of photos(); track photo.previewUrl) {
                    <figure
                      class="group relative overflow-hidden rounded-2xl border border-rheo-border bg-rheo-bg"
                    >
                      <img
                        [src]="photo.previewUrl"
                        [alt]="photo.file.name"
                        class="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        class="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-lg text-red-700 shadow"
                        (click)="removePhoto(photo)"
                        [attr.aria-label]="'Retirer ' + photo.file.name"
                      >
                        ×
                      </button>
                      <figcaption class="truncate px-3 py-2 text-[11px] text-rheo-muted">
                        {{ photo.file.name }}
                      </figcaption>
                    </figure>
                  }
                </div>
              }
            </fieldset>

            <fieldset class="grid gap-3">
              <div>
                <legend class="text-sm font-semibold">
                  Documents justificatifs
                  <span class="font-normal text-rheo-muted">(optionnel)</span>
                </legend>
                <p class="mt-1 text-xs leading-5 text-rheo-muted">
                  PDF ou image · 8 fichiers maximum · 10 Mo par fichier. Ils restent privés.
                </p>
              </div>
              <label
                class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-rheo-border px-4 py-3 text-sm transition hover:bg-rheo-bg"
              >
                <span class="font-semibold">Choisir des documents</span
                ><span class="text-xs text-rheo-muted">{{
                  documents().length ? documents().length + ' sélectionné(s)' : 'Aucun fichier'
                }}</span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  multiple
                  class="sr-only"
                  (change)="selectDocuments($event)"
                />
              </label>
              @if (documents().length) {
                <ul class="grid gap-2">
                  @for (document of documents(); track document.name) {
                    <li
                      class="flex items-center justify-between gap-3 rounded-xl bg-rheo-bg px-4 py-3 text-xs"
                    >
                      <span class="min-w-0 truncate">{{ document.name }}</span
                      ><button
                        type="button"
                        class="font-bold text-red-700"
                        (click)="removeDocument(document)"
                      >
                        Retirer
                      </button>
                    </li>
                  }
                </ul>
              }
            </fieldset>

            <button
              [disabled]="loading()"
              class="rounded-xl bg-rheo-accent px-6 py-3.5 text-sm font-bold text-rheo-dark disabled:opacity-60"
            >
              {{ loading() ? 'Envoi des fichiers…' : 'Envoyer pour validation' }}
            </button>
          </form>
        }
      </div>
    </section>
  `,
})
export class PropertySubmissionFormPage implements OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly submissions = inject(PropertySubmissionService);
  private readonly router = inject(Router);

  protected title = '';
  protected type: PropertyType = 'location';
  protected category: PropertyCategory = 'appartement';
  protected city = '';
  protected address = '';
  protected price: number | null = null;
  protected surface: number | null = null;
  protected bedrooms = 0;
  protected bathrooms = 0;
  protected description = '';
  protected readonly photos = signal<SelectedPhoto[]>([]);
  protected readonly documents = signal<File[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  ngOnDestroy(): void {
    this.photos().forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
  }

  protected selectPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    const invalid = selected.find((file) => !this.isImage(file) || file.size > 6 * 1024 * 1024);
    if (invalid) {
      this.error.set(`Le fichier « ${invalid.name} » n’est pas une image valide de moins de 6 Mo.`);
      return;
    }
    if (this.photos().length + selected.length > 12) {
      this.error.set('Vous pouvez ajouter 12 photos maximum.');
      return;
    }
    this.error.set('');
    this.photos.update((items) => [
      ...items,
      ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  protected removePhoto(photo: SelectedPhoto): void {
    URL.revokeObjectURL(photo.previewUrl);
    this.photos.update((items) => items.filter((item) => item !== photo));
  }

  protected selectDocuments(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    const accepted = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
    const invalid = selected.find(
      (file) => !accepted.has(file.type) || file.size > 10 * 1024 * 1024,
    );
    if (invalid) {
      this.error.set(`Le document « ${invalid.name} » n’est pas accepté ou dépasse 10 Mo.`);
      return;
    }
    if (this.documents().length + selected.length > 8) {
      this.error.set('Vous pouvez ajouter 8 documents maximum.');
      return;
    }
    this.error.set('');
    this.documents.update((items) => [...items, ...selected]);
  }

  protected removeDocument(document: File): void {
    this.documents.update((items) => items.filter((item) => item !== document));
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    this.message.set('');
    if (
      !this.title.trim() ||
      !this.city.trim() ||
      !this.address.trim() ||
      this.description.trim().length < 20 ||
      this.price === null ||
      this.surface === null
    ) {
      this.error.set(
        'Complétez les champs obligatoires. La description doit contenir au moins 20 caractères.',
      );
      return;
    }
    if (!this.photos().length) {
      this.error.set('Ajoutez au moins une photo du bien.');
      return;
    }
    this.loading.set(true);
    try {
      await this.submissions.create({
        title: this.title,
        type: this.type,
        category: this.category,
        city: this.city,
        address: this.address,
        price: this.price,
        surface: this.surface,
        bedrooms: this.bedrooms,
        bathrooms: this.bathrooms,
        description: this.description,
        photos: this.photos().map((item) => item.file),
        documents: this.documents(),
      });
      this.message.set('Votre annonce et ses images ont été envoyées à l’équipe RHEODYCE.');
      window.setTimeout(() => void this.router.navigateByUrl('/mon-compte/demandes'), 900);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'L’annonce n’a pas pu être envoyée.');
    } finally {
      this.loading.set(false);
    }
  }

  private isImage(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type);
  }
}
