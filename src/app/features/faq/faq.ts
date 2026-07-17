import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-[#f4f5f2] pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside class="lg:sticky lg:top-28 lg:h-fit">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">FAQ</p>
            <h1 class="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
              Les réponses utiles avant d’avancer.
            </h1>
            <p class="mt-5 max-w-md text-sm leading-7 text-rheo-muted">
              Une lecture simple des points qui reviennent souvent avant une visite, une location, un achat
              ou une demande de service.
            </p>
          </aside>

          <div class="overflow-hidden rounded-[30px] border border-rheo-border bg-white">
            @for (item of data.faqs; track item.question; let i = $index) {
              <details class="group border-b border-rheo-border last:border-b-0">
                <summary class="grid cursor-pointer list-none gap-4 p-5 transition hover:bg-rheo-bg sm:grid-cols-[56px_1fr_28px] sm:items-center sm:p-6">
                  <span class="text-sm font-semibold text-rheo-muted">0{{ i + 1 }}</span>
                  <span class="text-lg font-semibold leading-snug text-rheo-dark">{{ item.question }}</span>
                  <span class="flex h-7 w-7 items-center justify-center rounded-full border border-rheo-border text-rheo-muted transition group-open:rotate-45 group-open:border-rheo-accent group-open:text-rheo-dark">+</span>
                </summary>
                <div class="px-5 pb-6 sm:pl-[104px] sm:pr-12">
                  <p class="max-w-2xl text-sm leading-7 text-rheo-muted">{{ item.answer }}</p>
                </div>
              </details>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FaqPage {
  protected readonly data = inject(RheodyceDataService);
}
