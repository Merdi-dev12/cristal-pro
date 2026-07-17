import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-rheo-bg pb-16 pt-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">Contact</p>
            <h1 class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
              Parlez-nous de votre projet immobilier.
            </h1>
            <p class="mt-5 max-w-xl text-sm leading-7 text-rheo-muted">
              Partagez votre besoin, votre ville et le meilleur canal pour vous joindre. La structure du
              formulaire est prête pour la connexion à l’API.
            </p>

            <div class="mt-8 rounded-[28px] bg-[#111711] p-7 text-white">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Coordonnées</p>
              <div class="mt-5 space-y-3 text-sm text-white">
                <p>Kinshasa, République démocratique du Congo</p>
                <p>+243 000 000 000</p>
                <p>contact&#64;rheodyce.com</p>
              </div>
            </div>
          </div>

          <form class="rounded-[30px] border border-rheo-border bg-white p-6 sm:p-8">
            <div class="grid gap-5 sm:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Nom</label>
                <input class="h-12 rounded-2xl border border-rheo-border bg-white px-4 text-sm outline-none transition focus:border-rheo-accent focus:ring-4 focus:ring-rheo-accent/20" type="text" placeholder="Votre nom" />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Email</label>
                <input class="h-12 rounded-2xl border border-rheo-border bg-white px-4 text-sm outline-none transition focus:border-rheo-accent focus:ring-4 focus:ring-rheo-accent/20" type="email" placeholder="vous@email.com" />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Ville</label>
                <input class="h-12 rounded-2xl border border-rheo-border bg-white px-4 text-sm outline-none transition focus:border-rheo-accent focus:ring-4 focus:ring-rheo-accent/20" type="text" placeholder="Kinshasa, Lubumbashi..." />
              </div>
              <div class="grid gap-2">
                <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Besoin</label>
                <select class="h-12 rounded-2xl border border-rheo-border bg-white px-4 text-sm outline-none transition focus:border-rheo-accent focus:ring-4 focus:ring-rheo-accent/20">
                  <option>Achat / Vente</option>
                  <option>Location</option>
                  <option>Maintenance</option>
                  <option>Assistance juridique</option>
                </select>
              </div>
            </div>

            <div class="mt-5 grid gap-2">
              <label class="text-xs font-bold uppercase tracking-wide text-rheo-muted">Message</label>
              <textarea rows="6" class="rounded-2xl border border-rheo-border bg-white px-4 py-3 text-sm outline-none transition focus:border-rheo-accent focus:ring-4 focus:ring-rheo-accent/20" placeholder="Décrivez votre demande..."></textarea>
            </div>

            <button type="button" class="mt-6 h-12 w-full rounded-[18px] bg-rheo-accent px-6 text-sm font-semibold text-rheo-dark transition hover:bg-rheo-accent-hover">
              Envoyer la demande
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage {}
