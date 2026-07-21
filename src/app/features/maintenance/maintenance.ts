import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Maintenance</p>
            <h1 class="mt-3 text-5xl font-semibold tracking-tight text-rheo-dark">Des interventions lisibles et suivies.</h1>
            <p class="mt-5 text-sm leading-7 text-rheo-muted">
              Prestations disponibles : plomberie, électricité, peinture, climatisation,
              nettoyage et petites réparations.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            @for (item of items; track item.title) {
              <article class="rounded-[24px] border border-rheo-border bg-white p-6">
                <span class="flex h-11 w-11 items-center justify-center rounded-full bg-rheo-accent text-sm font-bold text-rheo-dark">{{ item.index }}</span>
                <h2 class="mt-6 text-xl font-semibold text-rheo-dark">{{ item.title }}</h2>
                <p class="mt-3 text-sm leading-6 text-rheo-muted">{{ item.description }}</p>
              </article>
            }
          </div>
        </div>
        <a routerLink="/services/maintenance/demande" class="mt-8 inline-flex rounded-[18px] bg-rheo-accent px-6 py-3 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover">Créer une demande d’intervention →</a>
      </div>
    </section>
  `,
})
export class MaintenancePage {
  protected readonly items = [
    { index: '01', title: 'Plomberie', description: 'Fuites, robinetterie, sanitaires et dépannage courant.' },
    { index: '02', title: 'Électricité', description: 'Diagnostic, réparation, sécurité et petits équipements.' },
    { index: '03', title: 'Peinture', description: 'Rafraîchissement, finitions et remise en état avant location.' },
    { index: '04', title: 'Climatisation', description: 'Entretien, contrôle et intervention sur équipements.' },
  ];
}
