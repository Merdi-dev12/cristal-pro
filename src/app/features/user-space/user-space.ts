import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovingRequestService } from '../../core/services/moving-request.service';
import { AuthService } from '../../core/services/auth.service';
import { MovingRequest } from '../../shared/models/moving-request.model';

@Component({
  selector: 'app-user-space',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-rheo-bg pb-20 pt-28">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header class="border-b border-rheo-border pb-8">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rheo-muted">
            Espace utilisateur
          </p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
            Vos demandes, au même endroit.
          </h1>
          <p class="mt-4 text-sm leading-7 text-rheo-muted">
            {{ auth.userEmail() }} · Retrouvez ici le suivi de vos demandes de déménagement et
            d’aménagement.
          </p>
        </header>

        @if (error()) {
          <p class="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</p>
        }
        @if (loading()) {
          <div
            class="mt-10 rounded-[26px] border border-rheo-border bg-white p-8 text-sm text-rheo-muted"
          >
            Chargement de vos demandes…
          </div>
        }
        @if (!loading() && !error() && requests().length === 0) {
          <div
            class="mt-10 rounded-[26px] border border-rheo-border bg-white p-8 text-center sm:p-12"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-rheo-muted">
              Aucun dossier
            </p>
            <h2 class="mt-3 text-2xl font-semibold text-rheo-dark">
              Votre prochain déménagement et aménagement commencent ici.
            </h2>
            <a
              routerLink="/demenagement"
              class="mt-6 inline-flex rounded-[18px] bg-rheo-accent px-6 py-3 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover"
              >Créer une demande</a
            >
          </div>
        }
        @if (!loading() && requests().length > 0) {
          <div class="mt-10 grid gap-4">
            @for (request of requests(); track request.id) {
              <article class="rounded-[26px] border border-rheo-border bg-white p-5 sm:p-7">
                <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-rheo-muted">
                      Demande du {{ request.createdAt | date: 'dd/MM/yyyy' }}
                    </p>
                    <h2 class="mt-2 text-xl font-semibold text-rheo-dark">
                      {{ request.departureAddress }} <span class="text-rheo-muted">→</span>
                      {{ request.arrivalAddress }}
                    </h2>
                  </div>
                  <span
                    class="w-fit rounded-full bg-[#eff8d8] px-3 py-1.5 text-xs font-bold capitalize text-[#38500d]"
                    >{{ request.status }}</span
                  >
                </div>
                <div
                  class="mt-6 grid gap-4 border-t border-rheo-border pt-5 text-sm sm:grid-cols-4"
                >
                  <div>
                    <p class="text-xs uppercase tracking-wide text-rheo-muted">Date</p>
                    <p class="mt-1 font-semibold text-rheo-dark">
                      {{ request.movingDate | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-rheo-muted">Volume</p>
                    <p class="mt-1 font-semibold text-rheo-dark">
                      {{ request.estimatedVolume }} m³
                    </p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-rheo-muted">Accès</p>
                    <p class="mt-1 font-semibold text-rheo-dark">
                      Étage {{ request.floor }} ·
                      {{ request.hasElevator ? 'Ascenseur' : 'Escaliers' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-rheo-muted">Partenaire</p>
                    <p class="mt-1 font-semibold text-rheo-dark">
                      {{ request.assignedPartnerId || 'À affecter' }}
                    </p>
                  </div>
                </div>
                @if (request.routeDistanceKm || request.routeDurationMinutes) {
                  <p class="mt-5 text-sm text-rheo-muted">
                    Trajet indicatif : {{ request.routeDistanceKm || '—' }} km ·
                    {{ request.routeDurationMinutes || '—' }} min
                  </p>
                }
                @if (request.adminNotes) {
                  <p class="mt-4 rounded-xl bg-rheo-bg px-4 py-3 text-sm text-rheo-muted">
                    Note équipe : {{ request.adminNotes }}
                  </p>
                }
              </article>
            }
          </div>
          <a
            routerLink="/demenagement"
            class="mt-7 inline-flex rounded-[18px] bg-rheo-accent px-6 py-3 text-sm font-bold text-rheo-dark transition hover:bg-rheo-accent-hover"
            >Nouvelle demande</a
          >
        }
      </div>
    </section>
  `,
})
export class UserSpacePage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly movingRequests = inject(MovingRequestService);
  protected readonly requests = signal<MovingRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.requests.set(await this.movingRequests.listMine());
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Impossible de charger vos demandes.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
