import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';

@Component({
  selector: 'app-location-vente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Location & Vente</p>
            <h1 class="mt-3 text-5xl font-semibold tracking-tight text-rheo-dark">Acheter ou louer sans avancer dans le brouillard.</h1>
            <p class="mt-5 text-sm leading-7 text-rheo-muted">
              La page explique le parcours métier avant connexion backend : présélection, vérification,
              visite encadrée et assistance documentaire.
            </p>
            <a routerLink="/annonces" class="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-sm font-semibold text-white">
              Voir les annonces
            </a>
          </div>
          <div class="overflow-hidden rounded-[32px] bg-black shadow-2xl">
            <img src="/assets/hero_img.png" alt="Bien immobilier moderne" class="h-[460px] w-full object-cover opacity-90" />
          </div>
        </div>

        <div class="mt-12 grid gap-4 md:grid-cols-3">
          @for (item of data.process; track item.step) {
            <article class="rounded-[24px] border border-rheo-border bg-white p-6">
              <span class="text-3xl font-semibold text-rheo-dark">{{ item.step }}</span>
              <h2 class="mt-8 text-xl font-semibold text-rheo-dark">{{ item.title }}</h2>
              <p class="mt-3 text-sm leading-6 text-rheo-muted">{{ item.description }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class LocationVentePage {
  protected readonly data = inject(RheodyceDataService);
}
