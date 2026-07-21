import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-decoration',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div
            class="overflow-hidden rounded-[32px] bg-white p-3 shadow-[0_18px_70px_rgba(14,20,16,0.08)]"
          >
            <img
              src="/assets/hero_img.png"
              alt="Décoration intérieure moderne"
              class="h-[500px] w-full rounded-[24px] object-cover"
            />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">
              Décoration
            </p>
            <h1 class="mt-3 text-5xl font-semibold tracking-tight text-rheo-dark">
              Valoriser les espaces avant la transaction.
            </h1>
            <p class="mt-5 text-sm leading-7 text-rheo-muted">
              Une page plus éditoriale pour présenter l’aménagement, la rénovation légère et la mise
              en scène d’un bien destiné à la location ou à la vente.
            </p>
            <div class="mt-8 grid gap-3">
              @for (item of items; track item) {
                <p
                  class="rounded-full border border-rheo-border bg-white px-5 py-3 text-sm font-semibold text-rheo-dark"
                >
                  {{ item }}
                </p>
              }
            </div>
            <a
              routerLink="/services/decoration/demande"
              class="mt-8 inline-flex items-center justify-center gap-2 rounded-[18px] bg-rheo-accent px-6 py-3.5 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover"
            >
              Créer une demande d’accompagnement
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DecorationPage {
  protected readonly items = [
    'Aménagement sur-mesure',
    'Rénovation intérieure',
    'Mise en valeur immobilière',
    'Conseil mobilier et lumière',
  ];
}
