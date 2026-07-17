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
        <header class="grid gap-8 border-b border-rheo-border pb-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Services</p>
            <h1 class="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
              Un accompagnement clair autour du bien, pas une simple vitrine.
            </h1>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-rheo-muted lg:justify-self-end">
            RHEODYCE organise la confiance avant, pendant et après la transaction : vérification, visite,
            maintenance, décoration et suivi documentaire.
          </p>
        </header>

        <div class="mt-10 grid gap-5 lg:grid-cols-3">
          @for (service of data.services; track service.id; let i = $index) {
            <article class="group overflow-hidden rounded-[24px] bg-white">
              <div class="relative h-56 overflow-hidden">
                <img [src]="serviceImage(i)" [alt]="service.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
                <span class="absolute bottom-4 left-4 rounded-[14px] bg-white px-3 py-1.5 text-xs font-bold text-rheo-dark">
                  0{{ i + 1 }} · {{ service.eyebrow }}
                </span>
              </div>
              <div class="p-6">
                <h2 class="text-2xl font-semibold tracking-tight text-rheo-dark">{{ service.title }}</h2>
                <p class="mt-3 text-sm leading-7 text-rheo-muted">{{ service.description }}</p>
                <button class="mt-6 rounded-[16px] border border-rheo-border px-5 py-2.5 text-sm font-semibold text-rheo-dark transition hover:border-black hover:bg-rheo-bg">
                  {{ service.cta }}
                </button>
              </div>
            </article>
          }
        </div>

        <div class="mt-12 overflow-hidden rounded-[32px] bg-[#111711] text-white">
          <div class="grid lg:grid-cols-2">
            <div class="p-8 sm:p-10">
              <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Dossier sur mesure</p>
              <h2 class="mt-3 max-w-xl text-3xl font-semibold tracking-tight">Vous avez un besoin précis sur un bien ?</h2>
              <p class="mt-4 max-w-lg text-sm leading-7 text-white/72">
                Décrivez la ville, le type de bien et le service voulu. Le parcours est déjà structuré pour être
                branché ensuite aux données réelles.
              </p>
              <a routerLink="/contact" class="mt-7 inline-flex rounded-[18px] bg-rheo-accent px-7 py-3 text-sm font-semibold text-rheo-dark">
                Contacter RHEODYCE
              </a>
            </div>
            <img src="/assets/hero_img_1.jpg" alt="Intérieur immobilier moderne" class="h-full min-h-80 w-full object-cover opacity-90" />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ServicesPage {
  protected readonly data = inject(RheodyceDataService);

  protected serviceImage(index: number): string {
    return index % 2 === 0 ? '/assets/hero_img.png' : '/assets/hero_img_1.jpg';
  }
}
