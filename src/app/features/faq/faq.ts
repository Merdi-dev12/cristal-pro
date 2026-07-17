import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">FAQ</p>
            <h1 class="mt-3 text-5xl font-semibold tracking-tight text-rheo-dark">Questions fréquentes</h1>
            <p class="mt-5 text-sm leading-7 text-rheo-muted">
              Les réponses utiles avant de visiter, louer, acheter ou demander une assistance.
            </p>
          </div>

          <div class="grid gap-3">
            @for (item of data.faqs; track item.question) {
              <details class="rounded-[24px] border border-rheo-border bg-white p-6 shadow-sm open:shadow-[0_18px_60px_rgba(14,20,16,0.08)]">
                <summary class="cursor-pointer list-none text-lg font-semibold text-rheo-dark">
                  {{ item.question }}
                </summary>
                <p class="mt-4 text-sm leading-7 text-rheo-muted">{{ item.answer }}</p>
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
