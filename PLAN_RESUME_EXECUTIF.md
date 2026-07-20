# 📋 Résumé Exécutif - Plan ServiceRequests + Backend Supabase

## 🎯 Objectif en une phrase

**Créer un système complet de gestion des demandes de services** où les utilisateurs peuvent demander maintenance/décoration/juridique/déménagement, voir l'état de leurs demandes (reçue → en traitement → assignée → terminée), et permettre aux admins de mettre à jour les demandes — **le tout backé par un vrai backend Supabase** (`rheodyce-db`, project_id `pjbgqnkmffrmdlkokbmo`) qui alimente aussi le reste du site (propriétés, services, FAQ, témoignages, contact).

---

## 🗄️ Backend Supabase — Résumé exécutif

**Statut actuel :** projet `rheodyce-db` vérifié — 1 seule table (`properties`, 0 ligne, RLS désactivé), aucune Edge Function, aucune donnée. Le frontend est encore 100% statique (`RheodyceDataService` + `localStorage`).

**Ce qui va être mis en place** (détail complet → [PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)) :

| Élément | Quantité | Détail |
|---------|----------|--------|
| Tables | 9 | `profiles`, `properties`, `service_offers`, `service_requests`, `faqs`, `testimonials`, `stats`, `process_steps`, `contact_messages` |
| RLS | 9/9 tables | Activé + policies dédiées sur **chaque** table (lecture publique du contenu éditorial, écriture admin uniquement, isolation par utilisateur sur `service_requests`) |
| Edge Functions MVP | 2 | `contact-submit` (formulaire contact public), `create-service-request` (création demande authentifiée) |
| Edge Functions phase 2 | 3 (optionnelles) | `service-request-admin-update`, `subscribe-user`, `properties-search` |
| Données fictives | ~50 lignes | 24 propriétés, 5 services, 4 FAQs, 4-6 témoignages, 4 stats, 3 étapes, 12-15 demandes de service, 5-6 messages contact, 4 comptes de démo |
| Auth | Supabase Auth (email/mdp) | Remplace `localStorage:isSubscriber`, profil créé automatiquement via trigger |

**Principe clé :** les services Angular existants (`RheodyceDataService`, `AuthService`) gardent leur API publique (signals) — seule la source de données change en interne (statique → Supabase). **Aucun composant existant ne devra être modifié.**

**Sécurité :** clé `anon` + URL du projet ne sont pas des secrets (design Supabase, sécurité = RLS). Seule la clé `service_role` est sensible, utilisée uniquement côté Edge Functions via secrets GitHub Actions — jamais dans le bundle Angular.

📄 **Plan technique complet (SQL, RLS détaillé, Edge Functions, seed data, migrations) → [PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)**

---

## 📊 Synthèse du plan

### Architecture

```
3 couches :
┌─────────────────────────────────────────┐
│ Présentation (Pages + Composants)       │
│ - ServiceRequestsPage (liste)           │
│ - ServiceRequestDetailPage (détail)     │
│ - ServiceRequestFormPage (optionnel)    │
├─────────────────────────────────────────┤
│ Métier (Services)                       │
│ - ServiceRequestService                 │
│   (CRUD, Signals, localStorage→API)     │
├─────────────────────────────────────────┤
│ Données (Models)                        │
│ - ServiceRequest (interface)            │
│ - Types: ServiceType, RequestStatus     │
└─────────────────────────────────────────┘
```

### Modèle de données

**ServiceRequest** = Demande de service

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant unique |
| `serviceType` | 'maintenance' \| 'decoration' \| 'juridique' \| 'demenagement' | Type de service |
| `status` | 'reçue' \| 'en traitement' \| 'assignée' \| 'terminée' \| 'annulée' | État de la demande |
| `clientName` | string | Nom du demandeur |
| `clientEmail` | string | Email |
| `clientPhone` | string | Téléphone |
| `description` | string | Description du besoin |
| `propertyId` | string (optional) | Propriété concernée |
| `budget` | number (optional) | Budget indicatif |
| `createdAt` | Date | Date création |
| `updatedAt` | Date | Dernière modification |
| `completedAt` | Date (optional) | Date fin |
| `assignedTo` | string (optional) | Email du prestataire assigné |
| `notes` | string (optional) | Notes internes (admin) |

---

## 📁 Fichiers à créer (résumé)

### Phase 1 : Fondations
```
✅ src/app/shared/models/service-request.model.ts
✅ src/app/core/services/service-request.service.ts
```

### Phase 2 : Liste des demandes
```
✅ src/app/features/my-account/service-requests/service-requests.ts
✅ src/app/features/my-account/service-requests/service-requests.html
✅ src/app/features/my-account/service-requests/service-requests.css
✅ src/app/features/my-account/service-requests/service-requests.spec.ts
✅ src/app/shared/components/request-status-badge/request-status-badge.ts
```

### Phase 3 : Détail d'une demande
```
✅ src/app/features/my-account/service-requests/service-request-detail/service-request-detail.ts
✅ src/app/features/my-account/service-requests/service-request-detail/service-request-detail.html
✅ src/app/features/my-account/service-requests/service-request-detail/service-request-detail.css
✅ src/app/features/my-account/service-requests/service-request-detail/service-request-detail.spec.ts
```

### Phase 4 : Intégration
```
⚠️ src/app/app.routes.ts (ajouter 2 routes)
⚠️ src/app/layout/header/header.ts (optionnel: lien "Mon compte")
```

### Phase 5 : Formulaire (optionnel)
```
✅ src/app/features/my-account/service-requests/service-request-form/service-request-form.ts
✅ src/app/features/my-account/service-requests/service-request-form/service-request-form.html
```

### Phase 6 : API Ready (documentation)
```
📄 Endpoints documentés
📄 Migration localStorage → HttpClient
📄 Auth headers préparés
```

---

## 🔄 Routes à ajouter

```typescript
// app.routes.ts
{ 
  path: 'mon-compte/demandes', 
  component: ServiceRequestsPage, 
  title: 'Mes demandes — RHEODYCE' 
}
{ 
  path: 'mon-compte/demandes/:id', 
  component: ServiceRequestDetailPage, 
  title: 'Détail demande — RHEODYCE' 
}
{ 
  path: 'mon-compte/demandes/creer', 
  component: ServiceRequestFormPage, 
  title: 'Créer une demande — RHEODYCE' 
}
```

---

## 🎨 Interface utilisateur

### Page 1 : Liste des demandes
```
┌─────────────────────────────────────┐
│ Mes demandes                        │
├─────────────────────────────────────┤
│ Filtres: [Tous] [En cours] [Finis] │
├─────────────────────────────────────┤
│ Service     | Statut  | Date  | Act│
├─────────────────────────────────────┤
│ Maintenance │⏳ Reçue | 7/15  | [+]│
│ Décoration  │⏳ Reçue | 7/19  | [+]│
│ Juridique   │✅ Finie | 7/12  | [+]│
└─────────────────────────────────────┘
```

### Page 2 : Détail d'une demande
```
┌─────────────────────────────────────┐
│ [← Retour]  Maintenance             │
│            ⏳ En traitement         │
├─────────────────────────────────────┤
│ Demandeur: Jane Doe                 │
│ Email: jane@example.com             │
│ Tél: +243 812 345 678               │
├─────────────────────────────────────┤
│ Description:                        │
│ "Fuite d'eau importante au 2e..."   │
├─────────────────────────────────────┤
│ Propriété: Villa contemporaine...   │
│ Budget: 500 USD                     │
├─────────────────────────────────────┤
│ [Notes admin (si assignée)]         │
│ "Rendez-vous jeudi 14h"             │
├─────────────────────────────────────┤
│ [Annuler] [Retour]                  │
└─────────────────────────────────────┘
```

---

## 🚀 Timeline et effort

| Phase | Description | Durée | Effort |
|-------|-------------|-------|--------|
| 1 | Models + Service | 2-3h | ⭐ Facile |
| 2 | Liste des demandes | 3-4h | ⭐⭐ Moyen |
| 3 | Détail d'une demande | 2-3h | ⭐⭐ Moyen |
| 4 | Intégration | 1-2h | ⭐ Facile |
| 5 | Formulaire (optionnel) | 4-5h | ⭐⭐⭐ Complexe |
| 6 | API Preparation | 1-2h | ⭐ Facile |
| **Total MVP** | Phases 1-4 | **8-12h** | ✅ |
| **Total Complet** | Phases 1-6 | **13-19h** | ✅ |

---

## 🔌 État actuel vs futur

> ⚠️ **Mise à jour** : le plan initial prévoyait `localStorage` puis une migration future vers une API. Ce plan est **court-circuité** : un vrai backend Supabase (`rheodyce-db`) va être mis en place directement (voir [PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)). `ServiceRequestService` sera donc branché **dès le départ** sur Supabase, pas sur `localStorage`.

### Flux réel (Supabase, dès la Phase 1)
```
User creates request (authentifié via Supabase Auth)
    ↓
ServiceRequestService.createRequest()
    ↓
supabase.from('service_requests').insert({ ... })
    (ou Edge Function `create-service-request`)
    ↓
RLS vérifie: user_id = auth.uid(), status forcé à 'reçue'
    ↓
Request visible immédiatement dans la liste (requête filtrée par RLS)
    ↓
Admin met à jour le statut
    ↓
UPDATE service_requests SET status = ... (via Table Editor ou futur panel admin)
    ↓
RLS + trigger vérifient que seul un admin peut faire ce changement
    ↓
User voit la mise à jour (refetch ou Supabase Realtime)
```

**Plan de migration** : 
- Tous les appels Supabase centralisés dans `ServiceRequestService` (même principe qu'avec `HttpClient`, juste `supabase-js` à la place)
- Aucun composant à modifier si l'API publique du service (signals `requests`, `isLoading`, méthodes CRUD) reste identique

---

## ✅ Checklist de démarrage

### Avant de coder
- [ ] Lire `PLAN_SERVICE_REQUESTS.md` (détail complet)
- [ ] Lire `PLAN_ARCHITECTURE_VISUELLE.md` (diagrammes)
- [ ] Valider avec le product owner

### Phase 1 (Fondations)
- [ ] Créer `service-request.model.ts`
  - Types: `ServiceType`, `RequestStatus`
  - Interface: `ServiceRequest`
  - Enums: labels, couleurs
  - DTO: `CreateServiceRequestDTO`

- [ ] Créer `service-request.service.ts`
  - Signals: `requests`, `isLoading`, `error`
  - Computed: `myRequests`, `stats`
  - Méthodes CRUD avec localStorage

- [ ] Ajouter données de test (6-10 demandes)

- [ ] Tests unitaires du service

### Phase 2 (Liste)
- [ ] Créer `ServiceRequestsPage`
  - Charger demandes au mount
  - Afficher liste paginée/filtrable
  - Signaux pour filtres

- [ ] Créer `RequestStatusBadge`
  - Affiche statut avec couleur
  - Réutilisable

- [ ] Ajouter route: `/mon-compte/demandes`

- [ ] Styles Tailwind (responsive)

- [ ] Tests

### Phase 3 (Détail)
- [ ] Créer `ServiceRequestDetailPage`
  - Charger demande via ID route
  - Afficher toutes les infos
  - Bouton annuler (conditionnel)

- [ ] Ajouter route: `/mon-compte/demandes/:id`

- [ ] Tests

### Phase 4 (Intégration)
- [ ] Lien dans header (si abonné)
- [ ] Tests responsive
- [ ] Tests accessibilité
- [ ] Code review

---

## 🎨 Patterns à respecter

### ✅ À faire
```typescript
// Signals pour le state
readonly requests = signal<ServiceRequest[]>([]);
readonly isLoading = signal(false);

// Computed pour dériver
readonly myRequests = computed(() => 
  this.requests().filter(r => r.userId === userId)
);

// Inputs/Outputs
readonly requestId = input.required<string>();
readonly onCancel = output<string>();

// Injections
private readonly service = inject(ServiceRequestService);

// Dans le template
{{ request().title }}
{{ isLoading() ? 'Chargement...' : 'Chargé' }}
```

### ❌ À éviter
```typescript
// ❌ RxJS sauf si nécessaire
this.requests$ = this.service.getRequests();

// ❌ Constructor injection
constructor(private service: Service) {}

// ❌ Propriétés publiques
public myData = ...;

// ❌ NgModules
@NgModule({ imports: [...] })
```

---

## 🧪 Cas de test prioritaires

### ServiceRequestService
- ✅ Créer une demande → s'ajoute à la liste
- ✅ Récupérer demandes filtrées par user
- ✅ Mettre à jour statut
- ✅ Annuler une demande
- ✅ Persistence localStorage

### ServiceRequestsPage
- ✅ Charger la liste au mount
- ✅ Filtrer par statut
- ✅ Naviguer vers détail
- ✅ Empty state

### ServiceRequestDetailPage
- ✅ Charger détail via route ID
- ✅ Afficher infos complètes
- ✅ Annuler disponible (si statut valide)
- ✅ Erreur si non trouvé (404)

---

## 📞 Points de contact clés

### Parties prenantes
- **Product**: Validation des statuts, workflows
- **UX**: Design des pages liste/détail
- **Backend**: Endpoints API (futur)

### Dépendances
- ✅ AuthService (pour `getCurrentUserId()`)
- ✅ Router (pour navigation)
- ✅ ActivatedRoute (pour récupérer `:id`)

### Risques
- ❌ localStorage limité (5-10MB max)
- ❌ Pas d'authentification réelle (temporaire)
- ❌ Pas de notifications en temps réel (futur)

---

## 🎓 Ressources et références

| Ressource | Lien |
|-----------|------|
| Guide agents | `agents.md` |
| Plan détaillé | `PLAN_SERVICE_REQUESTS.md` |
| **Plan backend Supabase (nouveau)** | `PLAN_BACKEND_SUPABASE.md` |
| Architecture visuelle | `PLAN_ARCHITECTURE_VISUELLE.md` |
| Commit history | `git log --oneline` |
| Services existants | `src/app/core/services/` |
| Modèles existants | `src/app/shared/models/` |
| Projet Supabase | `rheodyce-db` — `pjbgqnkmffrmdlkokbmo` |

---

## 💡 Questions fréquentes

### Q: Faut-il créer une page /mon-compte d'accueil?
**R:** Non, ce n'est pas nécessaire pour le MVP. Les liens pointent directement vers `/mon-compte/demandes`.

### Q: Comment gérer les utilisateurs avant la vraie auth?
**R:** Utiliser `"current-user"` comme userId temporaire. À remplacer par `authService.getCurrentUser().id` quand auth est prêt.

### Q: Quand faire le formulaire de création?
**R:** Phase 5 (optionnel). Peut être sur chaque page service ou une page dédiée.

### Q: Comment préparer pour l'API?
**R:** Tous les appels API dans `ServiceRequestService`. Basculer localStorage → HttpClient sans toucher les composants.

### Q: Faut-il un admin panel complet?
**R:** Non pour le MVP. Juste préparer la structure pour Phase 6.

---

## ✨ Résumé rapide

**Ce qu'on crée:**
- Une demande de service = objet avec type, statut, contact, description
- 2 pages: liste (filtrable) + détail
- Service qui gère CRUD avec localStorage
- Prêt pour API backend plus tard

**Durée:** 8-12 heures (MVP phases 1-4)

**Effort:** Modéré (composants simples, pas de complexité)

**Impact:** Nouveau système complet pour les utilisateurs de demander de l'aide

