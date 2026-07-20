import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Contact</p>
            <h1 class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
              Parlez-nous de votre projet immobilier.
            </h1>
            <p class="mt-5 max-w-xl text-sm leading-7 text-rheo-muted">
              Donnez-nous le contexte, la ville et le type d’accompagnement recherché. On garde le parcours
              simple, clair et directement exploitable.
            </p>

            <div class="mt-8 grid gap-4">
              <article class="grid min-h-[78px] grid-cols-[42px_1fr] items-center gap-3 rounded-r-[18px] rounded-l-[8px] border border-[#d7e0ed] border-l-[4px] border-l-[#071d49] bg-white px-4 py-3 sm:grid-cols-[48px_1fr]">
                <div class="flex h-10 w-10 items-center justify-center self-center rounded-full bg-[#eff4ff] text-[#071d49]">
                  <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" stroke-width="1.8" />
                    <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="1.8" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b98ad]">Adresse</p>
                  <p class="mt-0.5 text-[15px] font-semibold leading-snug text-[#071d49]">Kinshasa, République démocratique du Congo</p>
                  <p class="mt-0.5 text-xs text-[#7c89a3]">Bureau principal RHEODYCE</p>
                </div>
              </article>

              <article class="grid min-h-[78px] grid-cols-[42px_1fr] items-center gap-3 rounded-r-[18px] rounded-l-[8px] border border-[#d7e0ed] border-l-[4px] border-l-[#071d49] bg-white px-4 py-3 sm:grid-cols-[48px_1fr]">
                <div class="flex h-10 w-10 items-center justify-center self-center rounded-full bg-[#eff4ff] text-[#071d49]">
                  <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 4h3l1.5 4-2 1.2a11 11 0 0 0 5.3 5.3l1.2-2L20 14v3a3 3 0 0 1-3 3A13 13 0 0 1 4 7a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b98ad]">Téléphone</p>
                  <p class="mt-0.5 text-[15px] font-semibold leading-snug text-[#071d49]">+243 974 960 149</p>
                  <p class="mt-0.5 text-xs text-[#7c89a3]">Disponible du lundi au samedi</p>
                </div>
              </article>

              <article class="grid min-h-[78px] grid-cols-[42px_1fr] items-center gap-3 rounded-r-[18px] rounded-l-[8px] border border-[#d7e0ed] border-l-[4px] border-l-[#071d49] bg-white px-4 py-3 sm:grid-cols-[48px_1fr]">
                <div class="flex h-10 w-10 items-center justify-center self-center rounded-full bg-[#eff4ff] text-[#071d49]">
                  <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6h16v12H4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b98ad]">Email</p>
                  <p class="mt-0.5 break-words text-[15px] font-semibold leading-snug text-[#071d49]">reh.tssimba&#64;gmail.com</p>
                  <p class="mt-0.5 text-xs text-[#7c89a3]">Réponse sous 24h ouvrées</p>
                </div>
              </article>
            </div>
          </div>

          <form class="rounded-[30px] border border-rheo-border bg-white p-5 sm:p-8" (ngSubmit)="onSubmit()">
            @if (success()) {
              <div class="mb-5 rounded-xl border border-rheo-accent/40 bg-rheo-accent/15 px-4 py-3 text-sm text-rheo-dark">Votre message a bien été envoyé. Nous revenons vers vous sous 24h.</div>
            }
            @if (error()) {
              <div class="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
            }

            <div class="grid gap-5 sm:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Nom</label>
                <input class="h-12 rounded-xl border border-[#d7e0ed] bg-white px-4 text-sm outline-none transition focus:border-[#071d49]" type="text" placeholder="Votre nom" [(ngModel)]="fullName" name="fullName" />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Email</label>
                <input class="h-12 rounded-xl border border-[#d7e0ed] bg-white px-4 text-sm outline-none transition focus:border-[#071d49]" type="email" placeholder="vous@email.com" [(ngModel)]="email" name="email" />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Ville</label>
                <input class="h-12 rounded-xl border border-[#d7e0ed] bg-white px-4 text-sm outline-none transition focus:border-[#071d49]" type="text" placeholder="Kinshasa, Lubumbashi..." [(ngModel)]="city" name="city" />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Besoin</label>
                <div class="relative">
                  <select class="h-12 w-full appearance-none rounded-xl border border-[#d7e0ed] bg-white px-4 pr-10 text-sm font-semibold text-[#071d49] outline-none transition focus:border-[#071d49]" [(ngModel)]="need" name="need">
                    <option>Achat / Vente</option>
                    <option>Location</option>
                    <option>Maintenance</option>
                    <option>Assistance juridique</option>
                  </select>
                  <svg class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b98ad]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-2">
              <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Message</label>
              <textarea rows="6" class="rounded-xl border border-[#d7e0ed] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#071d49]" placeholder="Décrivez votre demande..." [(ngModel)]="message" name="message"></textarea>
            </div>

            <button type="submit" [disabled]="loading()" class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-rheo-accent px-6 text-sm font-semibold text-rheo-dark transition hover:bg-rheo-accent-hover disabled:opacity-60">
              @if (loading()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-rheo-dark/25 border-t-rheo-dark"></span>
              } @else {
                <span>Envoyer la demande</span>
              }
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage {
  private readonly contact = inject(ContactService);

  fullName = '';
  email = '';
  city = '';
  need = 'Achat / Vente';
  message = '';

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal(false);

  protected async onSubmit(): Promise<void> {
    if (!this.fullName.trim() || !this.email.trim() || !this.message.trim()) {
      this.error.set('Veuillez remplir au moins votre nom, votre email et votre message.');
      this.success.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    try {
      await this.contact.submit({
        full_name: this.fullName.trim(),
        email: this.email.trim(),
        city: this.city.trim(),
        need: this.need,
        message: this.message.trim(),
      });
      this.success.set(true);
      this.fullName = '';
      this.email = '';
      this.city = '';
      this.message = '';
    } catch {
      this.error.set('Impossible d\'envoyer votre message pour le moment. Réessayez plus tard.');
    } finally {
      this.loading.set(false);
    }
  }
}
