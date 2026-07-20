import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-[#f4f5f2] pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Services</p>
            <h1 class="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
              L’accompagnement qui rend un bien plus lisible, plus sûr, plus simple à gérer.
            </h1>
            <p class="mt-5 max-w-2xl text-sm leading-7 text-rheo-muted">
              RHEODYCE ne se limite pas aux annonces. Chaque service est pensé comme une étape du dossier :
              vérifier, visiter, sécuriser, maintenir et valoriser.
            </p>
          </div>

          <div class="relative overflow-hidden rounded-[30px] bg-[#111711]">
            <img src="/assets/hero_img_1.jpg" alt="Intérieur immobilier moderne" class="h-[360px] w-full object-cover opacity-88 sm:h-[420px]" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#111711]/88 via-[#111711]/18 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div class="grid grid-cols-3 gap-3 rounded-[22px] border border-white/12 bg-white/10 p-3 text-white">
                <div>
                  <p class="text-2xl font-semibold">5</p>
                  <p class="mt-1 text-xs text-white/58">Pôles service</p>
                </div>
                <div>
                  <p class="text-2xl font-semibold">24h</p>
                  <p class="mt-1 text-xs text-white/58">Pré-tri dossier</p>
                </div>
                <div>
                  <p class="text-2xl font-semibold">RDC</p>
                  <p class="mt-1 text-xs text-white/58">Couverture</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 overflow-hidden rounded-[30px] border border-rheo-border bg-white">
          <div class="grid gap-4 border-b border-rheo-border p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-rheo-muted">Catalogue service</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-rheo-dark">Choisir le bon niveau d’aide.</h2>
            </div>
            <a routerLink="/contact" class="inline-flex w-fit rounded-[18px] bg-rheo-accent px-6 py-3 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover">
              Démarrer un dossier
            </a>
          </div>

          <div class="divide-y divide-rheo-border">
            @for (service of data.services; track service.id; let i = $index) {
              <article class="service-row grid gap-5 p-5 transition hover:bg-[#f8f9f5] sm:p-7 lg:grid-cols-[72px_0.8fr_1.35fr_auto] lg:items-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-rheo-bg text-sm font-semibold text-rheo-dark">
                  0{{ i + 1 }}
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-rheo-muted">{{ service.eyebrow }}</p>
                  <h3 class="mt-2 text-xl font-semibold tracking-tight text-rheo-dark">{{ service.title }}</h3>
                </div>
                <p class="max-w-2xl text-sm leading-7 text-rheo-muted">{{ service.description }}</p>
                @if (service.id === 'demenagement') {
                  <a routerLink="/demenagement" class="w-fit rounded-[16px] border border-rheo-dark bg-rheo-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253025]">
                    {{ service.cta }}
                  </a>
                } @else {
                  <button type="button" class="w-fit rounded-[16px] border border-[#d7e0ed] px-5 py-2.5 text-sm font-semibold text-rheo-dark transition hover:border-rheo-dark">
                    {{ service.cta }}
                  </button>
                }
              </article>
            }
          </div>
        </div>

        <div class="mt-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div class="rounded-[28px] bg-[#111711] p-7 text-white sm:p-8">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Méthode</p>
            <h2 class="mt-4 text-3xl font-semibold tracking-tight">Un dossier immobilier doit rester compréhensible.</h2>
            <p class="mt-5 text-sm leading-7 text-white/62">
              Les services sont organisés pour éviter l’effet catalogue : chaque demande part d’un bien, d’un
              contexte, puis d’une action claire.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            @for (item of data.process; track item.step) {
              <article class="rounded-[24px] border border-rheo-border bg-white p-6">
                <p class="text-sm font-semibold text-rheo-muted">{{ item.step }}</p>
                <h3 class="mt-8 text-xl font-semibold text-rheo-dark">{{ item.title }}</h3>
                <p class="mt-3 text-sm leading-6 text-rheo-muted">{{ item.description }}</p>
              </article>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ServicesPage {
  protected readonly data = inject(RheodyceDataService);
}
