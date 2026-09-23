import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'contact', loadComponent: () => import('./features/contact/contact').then((module) => module.Contact), title: 'Contact — Cristal Pro' },
  { path: 'devis', loadComponent: () => import('./features/quote/quote').then((module) => module.Quote), title: 'Demander un devis — Cristal Pro' },
  { path: 'prestations', loadComponent: () => import('./features/prestations/prestations').then((module) => module.Prestations), title: 'Nos prestations — Cristal Pro' },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
    title: 'Accueil — RHEODYCE',
  },
  { path: '**', redirectTo: '' },
];
