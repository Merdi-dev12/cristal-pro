import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminIcon, AdminIconName } from '../../shared/components/admin-icon/admin-icon';
import { SERVICE_TYPE_LABELS } from '../../shared/models/service-request.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminIcon],
  template: `
    <section>
      <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rheo-muted">
            Vue d’ensemble
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Tableau de bord</h1>
        </div>
        <a
          routerLink="/admin/annonces/nouvelle"
          class="inline-flex w-fit items-center gap-2 rounded-xl bg-rheo-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#323a31]"
          ><app-admin-icon name="plus" className="size-5" />Créer une annonce</a
        >
      </div>

      @if (admin.actionMessage()) {
        <div
          class="mt-4 rounded-2xl border border-[#dbe6b4] bg-[#f8fbe9] px-4 py-3 text-sm text-[#53621e]"
        >
          {{ admin.actionMessage() }}
        </div>
      }

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (metric of metrics(); track metric.label) {
          <article
            class="rounded-2xl border border-[#e4e6e1] bg-white p-5 shadow-[0_6px_24px_rgba(24,32,20,0.03)]"
          >
            <div class="flex items-start justify-between">
              <p class="text-sm text-rheo-muted">{{ metric.label }}</p>
              <span class="flex size-9 items-center justify-center rounded-lg bg-[#f0f2ed]"
                ><app-admin-icon [name]="metric.icon" className="size-5"
              /></span>
            </div>
            <p class="mt-5 text-3xl font-semibold tracking-tight">{{ metric.value }}</p>
            <p class="mt-2 text-xs text-[#71806a]">{{ metric.caption }}</p>
          </article>
        }
      </div>

      <section class="mt-8 rounded-2xl border border-[#e4e6e1] bg-white p-5 sm:p-6">
        <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 class="font-semibold">Répartition de l’activité</h2>
            <p class="mt-1 text-xs text-rheo-muted">Volume actuel par type de demande</p>
          </div>
          <span class="text-xs font-semibold text-[#657b18]"
            >{{ totalActivity() }} interactions</span
          >
        </div>
        <div class="mt-6 grid gap-5 sm:grid-cols-2">
          @for (bar of activityBars(); track bar.label) {
            <div>
              <div class="mb-2 flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 font-semibold"
                  ><app-admin-icon [name]="bar.icon" className="size-4" />{{ bar.label }}</span
                ><span class="text-rheo-muted">{{ bar.value }}</span>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-[#edf0eb]">
                <div
                  class="h-full rounded-full bg-rheo-accent transition-all duration-500"
                  [style.width.%]="bar.percent"
                ></div>
              </div>
            </div>
          }
        </div>
      </section>

      <div class="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
          <div
            class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6"
          >
            <div>
              <h2 class="font-semibold">Demandes récentes</h2>
              <p class="mt-1 text-xs text-rheo-muted">Les dernières sollicitations à traiter</p>
            </div>
            <a
              routerLink="/admin/services"
              class="text-xs font-semibold text-[#63751c] hover:underline"
              >Tout voir</a
            >
          </div>
          <div class="divide-y divide-[#edf0eb]">
            @for (request of admin.recentServiceRequests(); track request.id) {
              <a
                routerLink="/admin/services"
                class="flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafbf9] sm:px-6"
                ><span
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2e9]"
                  ><app-admin-icon
                    [name]="serviceIcon(request.serviceType)"
                    className="size-5" /></span
                ><span class="min-w-0 flex-1"
                  ><span class="block truncate text-sm font-semibold">{{
                    request.description
                  }}</span
                  ><span class="mt-1 block text-xs text-rheo-muted"
                    >{{ SERVICE_TYPE_LABELS[request.serviceType] }} · {{ request.clientName }}</span
                  ></span
                ><span
                  class="hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex"
                  [class]="statusClass(request.status)"
                  >{{ request.status }}</span
                ><app-admin-icon name="arrow-right" className="size-4 text-rheo-muted"
              /></a>
            } @empty {
              <p class="p-8 text-sm text-rheo-muted">Aucune demande récente.</p>
            }
          </div>
        </section>
        <section class="overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
          <div
            class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6"
          >
            <div>
              <h2 class="font-semibold">Soumissions de biens</h2>
              <p class="mt-1 text-xs text-rheo-muted">À vérifier par l’équipe</p>
            </div>
            <a
              routerLink="/admin/soumissions"
              class="text-xs font-semibold text-[#63751c] hover:underline"
              >Ouvrir</a
            >
          </div>
          <div class="divide-y divide-[#edf0eb]">
            @for (submission of admin.recentSubmissions(); track submission.id) {
              <a
                routerLink="/admin/soumissions"
                class="block px-5 py-4 transition hover:bg-[#fafbf9] sm:px-6"
                ><div class="flex items-start justify-between gap-4">
                  <span class="min-w-0"
                    ><span class="block truncate text-sm font-semibold">{{ submission.title }}</span
                    ><span class="mt-1 block text-xs text-rheo-muted"
                      >{{ submission.city }} · {{ submission.ownerName }}</span
                    ></span
                  ><span
                    class="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
                    [class]="submissionClass(submission.status)"
                    >{{ submission.status }}</span
                  >
                </div></a
              >
            } @empty {
              <p class="p-8 text-sm text-rheo-muted">Aucune soumission récente.</p>
            }
          </div>
        </section>
      </div>

      <section class="mt-8 overflow-hidden rounded-2xl border border-[#e4e6e1] bg-white">
        <div class="flex items-center justify-between border-b border-[#edf0eb] px-5 py-5 sm:px-6">
          <div>
            <h2 class="font-semibold">Visites récentes</h2>
            <p class="mt-1 text-xs text-rheo-muted">Les rendez-vous à confirmer</p>
          </div>
          <a
            routerLink="/admin/visites"
            class="text-xs font-semibold text-[#63751c] hover:underline"
            >Gérer les visites</a
          >
        </div>
        <div class="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          @for (visit of admin.recentVisits(); track visit.id) {
            <a
              routerLink="/admin/visites"
              class="rounded-xl border border-[#edf0eb] p-4 transition hover:border-rheo-accent hover:bg-[#fafbf9]"
              ><div class="flex items-center justify-between gap-3">
                <span class="text-xs font-semibold text-rheo-muted"
                  >{{ visit.requestedDate | date: 'dd/MM' }} · {{ visit.requestedTime }}</span
                ><span
                  class="size-2 rounded-full"
                  [class]="visit.status === 'en attente' ? 'bg-[#f0b429]' : 'bg-[#8db534]'"
                ></span>
              </div>
              <p class="mt-3 truncate text-sm font-semibold">{{ visit.propertyTitle }}</p>
              <p class="mt-1 truncate text-xs text-rheo-muted">{{ visit.userName }}</p>
              <span
                class="mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold"
                [class]="submissionClass(visit.status)"
                >{{ visit.status }}</span
              ></a
            >
          } @empty {
            <p class="text-sm text-rheo-muted">Aucune visite récente.</p>
          }
        </div>
      </section>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <a
          routerLink="/admin/visites"
          class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"
          ><app-admin-icon name="calendar" className="size-7" />
          <h3 class="mt-4 font-semibold">Traiter les visites</h3>
          <p class="mt-1 text-xs text-rheo-muted">
            {{ admin.stats().pendingVisits }} en attente
          </p></a
        ><a
          routerLink="/admin/utilisateurs"
          class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"
          ><app-admin-icon name="users" className="size-7" />
          <h3 class="mt-4 font-semibold">Gérer les utilisateurs</h3>
          <p class="mt-1 text-xs text-rheo-muted">Abonnements et historique</p></a
        ><a
          routerLink="/admin/services"
          class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"
          ><app-admin-icon name="tools" className="size-7" />
          <h3 class="mt-4 font-semibold">Affecter un partenaire</h3>
          <p class="mt-1 text-xs text-rheo-muted">Suivre le traitement</p></a
        ><a
          routerLink="/admin/demenagements"
          class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"
          ><app-admin-icon name="truck" className="size-7" />
          <h3 class="mt-4 font-semibold">Déménagements et aménagements</h3>
          <p class="mt-1 text-xs text-rheo-muted">Partenaires et itinéraires</p></a
        ><a
          routerLink="/admin/annonces"
          class="group rounded-2xl border border-[#e4e6e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-rheo-accent"
          ><app-admin-icon name="home" className="size-7" />
          <h3 class="mt-4 font-semibold">Gérer les annonces</h3>
          <p class="mt-1 text-xs text-rheo-muted">Publication et vérification</p></a
        >
      </div>
    </section>
  `,
})
export class AdminDashboardPage {
  protected readonly admin = inject(AdminService);
  protected readonly SERVICE_TYPE_LABELS = SERVICE_TYPE_LABELS;
  protected readonly metrics = () => [
    {
      label: 'Annonces',
      value: this.admin.stats().properties,
      caption: 'biens dans le catalogue',
      icon: 'home' as AdminIconName,
    },
    {
      label: 'Utilisateurs',
      value: this.admin.stats().users,
      caption: 'comptes inscrits',
      icon: 'users' as AdminIconName,
    },
    {
      label: 'Abonnés',
      value: this.admin.stats().subscribers,
      caption: 'accès premium actif',
      icon: 'star' as AdminIconName,
    },
    {
      label: 'Demandes',
      value: this.admin.stats().requests,
      caption: 'visites et services',
      icon: 'clipboard' as AdminIconName,
    },
  ];
  protected totalActivity(): number {
    return this.activityBars().reduce((sum, item) => sum + item.value, 0);
  }
  protected activityBars(): {
    label: string;
    value: number;
    percent: number;
    icon: AdminIconName;
  }[] {
    const values = [
      { label: 'Visites', value: this.admin.visits().length, icon: 'calendar' as AdminIconName },
      {
        label: 'Services',
        value: this.admin.serviceRequests().length,
        icon: 'tools' as AdminIconName,
      },
      {
        label: 'Contacts',
        value: this.admin.contactMessages().length,
        icon: 'mail' as AdminIconName,
      },
      {
        label: 'Soumissions',
        value: this.admin.submissions().length,
        icon: 'clipboard' as AdminIconName,
      },
    ];
    const max = Math.max(...values.map((item) => item.value), 1);
    return values.map((item) => ({
      ...item,
      percent: Math.max((item.value / max) * 100, item.value ? 8 : 0),
    }));
  }

  protected serviceIcon(type: string): AdminIconName {
    return type === 'demenagement' ? 'truck' : 'tools';
  }
  protected statusClass(status: string): string {
    return status === 'terminée'
      ? 'bg-[#edf5d6] text-[#657b18]'
      : status === 'annulée'
        ? 'bg-[#fff0f0] text-[#b42318]'
        : 'bg-[#fff4d9] text-[#946200]';
  }
  protected submissionClass(status: string): string {
    return status === 'refusée'
      ? 'bg-[#fff0f0] text-[#b42318]'
      : status === 'en attente'
        ? 'bg-[#fff4d9] text-[#946200]'
        : 'bg-[#edf5d6] text-[#657b18]';
  }
}
