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
import { AdminContactPage } from './features/admin/admin-contact';
import { AdminContactDetailPage } from './features/admin/admin-contact-detail';
import { AdminSubmissionDetailPage } from './features/admin/admin-submission-detail';
import { AdminVisitDetailPage } from './features/admin/admin-visit-detail';
import { AdminPropertyDetailPage } from './features/admin/admin-property-detail';
import { AdminServiceRequestDetailPage } from './features/admin/admin-service-request-detail';
import { SubscriptionPage } from './features/subscription/subscription';
import { PropertyDetailPage } from './features/annonces/property-detail/property-detail';
import { ProfilePage } from './features/profile/profile';
import { PropertySubmissionFormPage } from './features/property-submissions/property-submission-form';
import { MyPropertySubmissionsPage } from './features/property-submissions/my-property-submissions';
import { ServiceRequestFormPage } from './features/services/service-request-form/service-request-form';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil — RHEODYCE' },
  { path: 'annonces', component: AnnoncesPage, title: 'Annonces — RHEODYCE' },
  {
    path: 'annonces/:id',
    component: PropertyDetailPage,
    title: 'Détail annonce — RHEODYCE',
  },
  { path: 'location-vente', component: LocationVentePage, title: 'Location & Vente — RHEODYCE' },
  {
    path: 'location-vente/creer-annonce',
    component: PropertySubmissionFormPage,
    canActivate: [authGuard],
    title: 'Créer une annonce — RHEODYCE',
  },
  { path: 'maintenance', component: MaintenancePage, title: 'Maintenance — RHEODYCE' },
  { path: 'decoration', component: DecorationPage, title: 'Décoration — RHEODYCE' },
  { path: 'services', component: ServicesPage, title: 'Services — RHEODYCE' },
  {
    path: 'services/:type/demande',
    component: ServiceRequestFormPage,
    canActivate: [authGuard],
    title: 'Nouvelle demande — RHEODYCE',
  },
  { path: 'faq', component: FaqPage, title: 'FAQ — RHEODYCE' },
  { path: 'contact', component: ContactPage, title: 'Contact — RHEODYCE' },
  { path: 'abonnement', component: SubscriptionPage, title: 'Abonnement — RHEODYCE' },
  { path: 'connexion', component: LoginPage, title: 'Connexion — RHEODYCE' },
  { path: 'inscription', component: RegisterPage, title: 'Inscription — RHEODYCE' },
  {
    path: 'mon-compte/demandes',
    component: ServiceRequestsPage,
    canActivate: [authGuard],
    title: 'Mes demandes — RHEODYCE',
  },
  {
    path: 'mon-compte/mes-annonces',
    component: MyPropertySubmissionsPage,
    canActivate: [authGuard],
    title: 'Mes annonces proposées — RHEODYCE',
  },
  {
    path: 'mon-compte/demandes/:id',
    component: ServiceRequestDetailPage,
    canActivate: [authGuard],
    title: 'Détail demande — RHEODYCE',
  },
  {
    path: 'mon-profil',
    component: ProfilePage,
    canActivate: [authGuard],
    title: 'Mon profil — RHEODYCE',
  },
  {
    path: 'demenagement',
    component: DemenagementPage,
    canActivate: [authGuard],
    title: 'Déménagement — RHEODYCE',
  },
  {
    path: 'espace-utilisateur',
    component: UserSpacePage,
    canActivate: [authGuard],
    title: 'Espace utilisateur — RHEODYCE',
  },
  {
    path: 'admin',
    component: AdminLayoutPage,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardPage, title: 'Administration — RHEODYCE' },
      { path: 'visites', component: AdminVisitsPage, title: 'Visites — Administration' },
      {
        path: 'visites/:id',
        component: AdminVisitDetailPage,
        title: 'Détail visite — Administration',
      },
      { path: 'utilisateurs', component: AdminUsersPage, title: 'Utilisateurs — Administration' },
      { path: 'services', component: AdminServicesPage, title: 'Services — Administration' },
      {
        path: 'services/demandes/:id',
        component: AdminServiceRequestDetailPage,
        title: 'Détail service — Administration',
      },
      { path: 'contacts', component: AdminContactPage, title: 'Contacts — Administration' },
      {
        path: 'contacts/:id',
        component: AdminContactDetailPage,
        title: 'Détail contact — Administration',
      },
      { path: 'soumissions', component: AdminSubmissionsPage, title: 'Soumissions — Administration' },
      {
        path: 'soumissions/:id',
        component: AdminSubmissionDetailPage,
        title: 'Détail soumission — Administration',
      },
      { path: 'annonces', component: AdminPropertiesPage, title: 'Annonces — Administration' },
      {
        path: 'annonces/nouvelle',
        component: PropertySubmissionFormPage,
        title: 'Créer une annonce — Administration',
      },
      {
        path: 'annonces/:id',
        component: AdminPropertyDetailPage,
        title: 'Gérer une annonce — Administration',
      },
      { path: 'demenagements', component: MovingAdminPage, title: 'Déménagements — Administration' },
    ],
  },
  { path: '**', redirectTo: '' },
];
