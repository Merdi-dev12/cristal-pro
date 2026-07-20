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
import { ServiceRequestsPage } from './features/my-account/service-requests/service-requests';
import { ServiceRequestDetailPage } from './features/my-account/service-requests/service-request-detail/service-request-detail';
import { DemenagementPage } from './features/demenagement/demenagement';
import { UserSpacePage } from './features/user-space/user-space';
import { MovingAdminPage } from './features/admin/moving-admin';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayoutPage } from './features/admin/admin-layout';
import { AdminDashboardPage } from './features/admin/admin-dashboard';
import { AdminVisitsPage } from './features/admin/admin-visits';
import { AdminUsersPage } from './features/admin/admin-users';
import { AdminServicesPage } from './features/admin/admin-services';
import { AdminSubmissionsPage } from './features/admin/admin-submissions';
import { AdminPropertiesPage } from './features/admin/admin-properties';
import { SubscriptionPage } from './features/subscription/subscription';
import { PropertyDetailPage } from './features/annonces/property-detail/property-detail';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil — RHEODYCE' },
  { path: 'annonces', component: AnnoncesPage, title: 'Annonces — RHEODYCE' },
  { path: 'annonces/:id', component: PropertyDetailPage, title: 'Détail annonce — RHEODYCE' },
  { path: 'location-vente', component: LocationVentePage, title: 'Location & Vente — RHEODYCE' },
  { path: 'maintenance', component: MaintenancePage, title: 'Maintenance — RHEODYCE' },
  { path: 'decoration', component: DecorationPage, title: 'Décoration — RHEODYCE' },
  { path: 'services', component: ServicesPage, title: 'Services — RHEODYCE' },
  { path: 'faq', component: FaqPage, title: 'FAQ — RHEODYCE' },
  { path: 'contact', component: ContactPage, title: 'Contact — RHEODYCE' },
  { path: 'abonnement', component: SubscriptionPage, title: 'Abonnement — RHEODYCE' },
  { path: 'connexion', component: LoginPage, title: 'Connexion — RHEODYCE' },
  { path: 'inscription', component: RegisterPage, title: 'Inscription — RHEODYCE' },
  { path: 'mon-compte/demandes', component: ServiceRequestsPage, title: 'Mes demandes — RHEODYCE' },
  { path: 'mon-compte/demandes/:id', component: ServiceRequestDetailPage, title: 'Détail demande — RHEODYCE' },
  { path: 'demenagement', component: DemenagementPage, canActivate: [authGuard], title: 'Déménagement — RHEODYCE' },
  { path: 'espace-utilisateur', component: UserSpacePage, canActivate: [authGuard], title: 'Espace utilisateur — RHEODYCE' },
  {
    path: 'admin',
    component: AdminLayoutPage,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardPage, title: 'Panel admin — RHEODYCE' },
      { path: 'visites', component: AdminVisitsPage, title: 'Visites — Panel admin' },
      { path: 'utilisateurs', component: AdminUsersPage, title: 'Utilisateurs — Panel admin' },
      { path: 'services', component: AdminServicesPage, title: 'Services — Panel admin' },
      { path: 'soumissions', component: AdminSubmissionsPage, title: 'Soumissions — Panel admin' },
      { path: 'annonces', component: AdminPropertiesPage, title: 'Annonces — Panel admin' },
      { path: 'demenagements', component: MovingAdminPage, title: 'Déménagements — Panel admin' },
    ],
  },
  { path: '**', redirectTo: '' },
];
