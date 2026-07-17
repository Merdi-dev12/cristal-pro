import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Services</p>
            <h1 class="mt-3 text-5xl font-semibold tracking-tight text-rheo-dark">Tout ce qui rend l’immobilier moins risqué.</h1>
          </div>
          <p class="max-w-xl text-sm leading-7 text-rheo-muted lg:justify-self-end">
            RHEODYCE n’est pas seulement une vitrine. La plateforme organise la confiance autour de
            l’annonce, la maintenance, la décoration et l’accompagnement juridique.
          </p>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (service of data.services; track service.id) {
            <article class="rounded-[26px] border border-rheo-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(14,20,16,0.08)]">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-[0.18em] text-rheo-muted">{{ service.eyebrow }}</span>
                <span class="flex h-11 w-11 items-center justify-center rounded-full bg-rheo-accent text-rheo-dark">{{ service.icon }}</span>
              </div>
              <h2 class="mt-8 text-2xl font-semibold text-rheo-dark">{{ service.title }}</h2>
              <p class="mt-3 text-sm leading-7 text-rheo-muted">{{ service.description }}</p>
              <button class="mt-6 rounded-full border border-rheo-border px-5 py-2.5 text-sm font-semibold text-rheo-dark transition hover:border-black">
                {{ service.cta }}
              </button>
            </article>
          }
        </div>

        <div class="mt-12 overflow-hidden rounded-[32px] bg-black text-white shadow-2xl">
          <div class="grid lg:grid-cols-2">
            <div class="p-8 sm:p-10">
              <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Contact</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight">Un besoin précis sur un bien ?</h2>
              <p class="mt-4 text-sm leading-7 text-white/70">
                Décrivez le dossier, le service voulu et la ville. Le formulaire reste fake pour l’instant,
                mais la structure est prête pour l’intégration.
              </p>
              <a routerLink="/contact" class="mt-7 inline-flex rounded-full bg-rheo-accent px-7 py-3 text-sm font-semibold text-rheo-dark">
                Contacter RHEODYCE
              </a>
            </div>
            <img src="/assets/hero_img.png" alt="Maison moderne" class="h-full min-h-80 w-full object-cover opacity-90" />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ServicesPage {
  protected readonly data = inject(RheodyceDataService);
}
