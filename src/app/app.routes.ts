import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AnnoncesPage } from './features/annonces/annonces';
import { LocationVentePage } from './features/location-vente/location-vente';
import { MaintenancePage } from './features/maintenance/maintenance';
import { DecorationPage } from './features/decoration/decoration';
import { ServicesPage } from './features/services/services';
import { FaqPage } from './features/faq/faq';
import { ContactPage } from './features/contact/contact';
import { LoginPage } from './features/auth/login/login';
import { RegisterPage } from './features/auth/register/register';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil — RHEODYCE' },
  { path: 'annonces', component: AnnoncesPage, title: 'Annonces — RHEODYCE' },
  { path: 'location-vente', component: LocationVentePage, title: 'Location & Vente — RHEODYCE' },
  { path: 'maintenance', component: MaintenancePage, title: 'Maintenance — RHEODYCE' },
  { path: 'decoration', component: DecorationPage, title: 'Décoration — RHEODYCE' },
  { path: 'services', component: ServicesPage, title: 'Services — RHEODYCE' },
  { path: 'faq', component: FaqPage, title: 'FAQ — RHEODYCE' },
  { path: 'contact', component: ContactPage, title: 'Contact — RHEODYCE' },
  { path: 'connexion', component: LoginPage, title: 'Connexion — RHEODYCE' },
  { path: 'inscription', component: RegisterPage, title: 'Inscription — RHEODYCE' },
  { path: '**', redirectTo: '' },
];


