import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
    title: 'Accueil — RHEODYCE',
  },
  {
    path: 'annonces',
    loadComponent: () =>
      import('./features/annonces/annonces').then((module) => module.AnnoncesPage),
    title: 'Annonces — RHEODYCE',
  },
  {
    path: 'annonces/:id',
    loadComponent: () =>
      import('./features/annonces/property-detail/property-detail').then(
        (module) => module.PropertyDetailPage,
      ),
    title: 'Détail annonce — RHEODYCE',
  },
  {
    path: 'location-vente',
    loadComponent: () =>
      import('./features/location-vente/location-vente').then((module) => module.LocationVentePage),
    title: 'Location & Vente — RHEODYCE',
  },
  {
    path: 'location-vente/creer-annonce',
    loadComponent: () =>
      import('./features/property-submissions/property-submission-form').then(
        (module) => module.PropertySubmissionFormPage,
      ),
    canActivate: [authGuard],
    title: 'Créer une annonce — RHEODYCE',
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./features/maintenance/maintenance').then((module) => module.MaintenancePage),
    title: 'Maintenance — RHEODYCE',
  },
  {
    path: 'decoration',
    loadComponent: () =>
      import('./features/decoration/decoration').then((module) => module.DecorationPage),
    title: 'Décoration — RHEODYCE',
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./features/services/services').then((module) => module.ServicesPage),
    title: 'Services — RHEODYCE',
  },
  {
    path: 'services/:type/demande',
    loadComponent: () =>
      import('./features/services/service-request-form/service-request-form').then(
        (module) => module.ServiceRequestFormPage,
      ),
    canActivate: [authGuard],
    title: 'Nouvelle demande — RHEODYCE',
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq').then((module) => module.FaqPage),
    title: 'FAQ — RHEODYCE',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((module) => module.ContactPage),
    title: 'Contact — RHEODYCE',
  },
  {
    path: 'abonnement',
    loadComponent: () =>
      import('./features/subscription/subscription').then((module) => module.SubscriptionPage),
    title: 'Abonnement — RHEODYCE',
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login').then((module) => module.LoginPage),
    title: 'Connexion — RHEODYCE',
  },
  {
    path: 'inscription',
    loadComponent: () =>
      import('./features/auth/register/register').then((module) => module.RegisterPage),
    title: 'Inscription — RHEODYCE',
  },
  {
    path: 'mon-compte/demandes',
    loadComponent: () =>
      import('./features/my-account/service-requests/service-requests').then(
        (module) => module.ServiceRequestsPage,
      ),
    canActivate: [authGuard],
    title: 'Mes demandes — RHEODYCE',
  },
  {
    path: 'mon-compte/mes-annonces',
    loadComponent: () =>
      import('./features/property-submissions/my-property-submissions').then(
        (module) => module.MyPropertySubmissionsPage,
      ),
    canActivate: [authGuard],
    title: 'Mes annonces proposées — RHEODYCE',
  },
  {
    path: 'mon-compte/demandes/:id',
    loadComponent: () =>
      import('./features/my-account/service-requests/service-request-detail/service-request-detail').then(
        (module) => module.ServiceRequestDetailPage,
      ),
    canActivate: [authGuard],
    title: 'Détail demande — RHEODYCE',
  },
  {
    path: 'mon-profil',
    loadComponent: () => import('./features/profile/profile').then((module) => module.ProfilePage),
    canActivate: [authGuard],
    title: 'Mon profil — RHEODYCE',
  },
  {
    path: 'demenagement',
    loadComponent: () =>
      import('./features/demenagement/demenagement').then((module) => module.DemenagementPage),
    canActivate: [authGuard],
    title: 'Déménagement — RHEODYCE',
  },
  {
    path: 'espace-utilisateur',
    loadComponent: () =>
      import('./features/user-space/user-space').then((module) => module.UserSpacePage),
    canActivate: [authGuard],
    title: 'Espace utilisateur — RHEODYCE',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout').then((module) => module.AdminLayoutPage),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard').then((module) => module.AdminDashboardPage),
        title: 'Administration — RHEODYCE',
      },
      {
        path: 'visites',
        loadComponent: () =>
          import('./features/admin/admin-visits').then((module) => module.AdminVisitsPage),
        title: 'Visites — Administration',
      },
      {
        path: 'visites/:id',
        loadComponent: () =>
          import('./features/admin/admin-visit-detail').then(
            (module) => module.AdminVisitDetailPage,
          ),
        title: 'Détail visite — Administration',
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/admin/admin-users').then((module) => module.AdminUsersPage),
        title: 'Utilisateurs — Administration',
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/admin/admin-services').then((module) => module.AdminServicesPage),
        title: 'Services — Administration',
      },
      {
        path: 'services/demandes/:id',
        loadComponent: () =>
          import('./features/admin/admin-service-request-detail').then(
            (module) => module.AdminServiceRequestDetailPage,
          ),
        title: 'Détail service — Administration',
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/admin/admin-contact').then((module) => module.AdminContactPage),
        title: 'Contacts — Administration',
      },
      {
        path: 'contacts/:id',
        loadComponent: () =>
          import('./features/admin/admin-contact-detail').then(
            (module) => module.AdminContactDetailPage,
          ),
        title: 'Détail contact — Administration',
      },
      {
        path: 'soumissions',
        loadComponent: () =>
          import('./features/admin/admin-submissions').then(
            (module) => module.AdminSubmissionsPage,
          ),
        title: 'Soumissions — Administration',
      },
      {
        path: 'soumissions/:id',
        loadComponent: () =>
          import('./features/admin/admin-submission-detail').then(
            (module) => module.AdminSubmissionDetailPage,
          ),
        title: 'Détail soumission — Administration',
      },
      {
        path: 'annonces',
        loadComponent: () =>
          import('./features/admin/admin-properties').then((module) => module.AdminPropertiesPage),
        title: 'Annonces — Administration',
      },
      {
        path: 'annonces/nouvelle',
        loadComponent: () =>
          import('./features/property-submissions/property-submission-form').then(
            (module) => module.PropertySubmissionFormPage,
          ),
        title: 'Créer une annonce — Administration',
      },
      {
        path: 'annonces/:id',
        loadComponent: () =>
          import('./features/admin/admin-property-detail').then(
            (module) => module.AdminPropertyDetailPage,
          ),
        title: 'Gérer une annonce — Administration',
      },
      {
        path: 'demenagements',
        loadComponent: () =>
          import('./features/admin/moving-admin').then((module) => module.MovingAdminPage),
        title: 'Déménagements — Administration',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
