# Plan d'implémentation - Système de demandes de services

> ⚠️ **Mise à jour** : ce plan prévoyait initialement une implémentation `localStorage` avec migration future vers une API. Ce point est **court-circuité** : un vrai backend Supabase (`rheodyce-db`, project_id `pjbgqnkmffrmdlkokbmo`) va être mis en place directement — voir **[PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)** pour le schéma SQL complet, le RLS et les Edge Functions. Ce document reste la référence pour l'architecture frontend (pages, composants, UX) ; les sections "localStorage" et "Phase 6 API" ci-dessous sont remplacées par la section **"Implémentation réelle (Supabase)"** plus bas.

## 📊 Analyse de la situation actuelle

### État du projet
- **Architecture** : Angular 22 standalone avec Signals
- **Données** : Actuellement statiques via `RheodyceDataService`
- **Authentification** : localStorage uniquement (`isSubscriber`) — sera remplacée par Supabase Auth
- **Backend** : `rheodyce-db` (Supabase) vérifié vide — 1 table `properties` (0 ligne, RLS désactivé), à compléter selon `PLAN_BACKEND_SUPABASE.md`
- **Routes existantes** : 10 routes, pas de "mon-compte" ni détails d'utilisateur

### Structure existante à exploiter
```
src/app/
├── core/services/
│   ├── auth.service.ts          → Gère isSubscriber (localStorage)
│   ├── rheodyce-data.service.ts → Données statiques
│   └── scroll.ts                → Scroll state
├── features/                    → Pages métier
├── shared/
│   └── models/
│       ├── property.model.ts
│       └── site-content.model.ts
└── layout/
    ├── header/
    └── footer/
```

### Points clés
- Pas d'API backend actuellement (à intégrer)
- Pas de user ID / authentication réelle
- localStorage utilisé pour state transient
- Patterns établis : Signals, computed, input/output

---

## 🎯 Objectif de la feature

Créer un **système complet de demandes de services** où :
1. Un utilisateur peut demander un service (maintenance, décoration, juridique, déménagement)
2. Visualiser toutes ses demandes avec leur statut
3. Voir les détails d'une demande spécifique
4. Un admin peut (futur) mettre à jour le statut

### Cas d'usage
```
Utilisateur crée une demande
    ↓
Demande reçue (statut: "reçue")
    ↓
Admin la traite (passe à "en traitement")
    ↓
Admin l'assigne (passe à "assignée")
    ↓
Travaux faits (passe à "terminée")
    ↓
Utilisateur voit le résultat
```

---

## 📐 Architecture proposée

### 1. Modèles de données

#### Fichier : `src/app/shared/models/service-request.model.ts` (NOUVEAU)

**Types et interfaces à créer** :

```typescript
// Types des services
export type ServiceType = 'maintenance' | 'decoration' | 'juridique' | 'demenagement';

// Statuts de demande
export type RequestStatus = 'reçue' | 'en traitement' | 'assignée' | 'terminée' | 'annulée';

// Interface ServiceRequest
export interface ServiceRequest {
  id: string;                    // UUID ou timestamp-based
  userId: string;                // ID utilisateur (futur: JWT/Auth)
  serviceType: ServiceType;      // Type de service demandé
  status: RequestStatus;         // Statut actuel
  
  // Informations de contact
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Détails de la demande
  description: string;           // Description du besoin
  propertyId?: string;          // Propriété concernée (optionnel)
  budget?: number;              // Budget indicatif (optionnel)
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;           // Date de clôture
  
  // Admin (futur)
  assignedTo?: string;          // Email du prestataire
  notes?: string;               // Notes internes
}

// Pour les formulaires
export interface CreateServiceRequestDTO {
  serviceType: ServiceType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  propertyId?: string;
  budget?: number;
}
```

**Détails par type de service** :

| Type | Description | Exemple |
|------|------------|---------|
| `maintenance` | Plomberie, électricité, climatisation, peinture | "Fuite d'eau au 2e étage" |
| `decoration` | Aménagement, rénovation légère, mise en scène | "Repeindre le salon" |
| `juridique` | Assistance documentaire, partenaire juridique | "Vérifier le contrat de location" |
| `demenagement` | Logistique transport et installation | "Déménager un studio" |

**Enums d'affichage** :

```typescript
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Maintenance',
  decoration: 'Décoration',
  juridique: 'Assistance juridique',
  demenagement: 'Déménagement',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  reçue: '⏳ Reçue',
  'en traitement': '⚙️ En traitement',
  assignée: '👤 Assignée',
  terminée: '✅ Terminée',
  annulée: '❌ Annulée',
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  reçue: 'bg-blue-100 text-blue-800',
  'en traitement': 'bg-yellow-100 text-yellow-800',
  assignée: 'bg-purple-100 text-purple-800',
  terminée: 'bg-green-100 text-green-800',
  annulée: 'bg-red-100 text-red-800',
};
```

---

### 2. Services

#### Fichier : `src/app/core/services/service-request.service.ts` (NOUVEAU)

**Responsabilités** :
- CRUD des demandes (Create, Read, Update, Delete)
- Gestion du state (liste des demandes)
- Synchronisation avec futur backend

**Structure** :

```typescript
@Service()
export class ServiceRequestService {
  // State
  readonly requests = signal<ServiceRequest[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  
  // Computed
  readonly myRequests = computed(() => 
    this.requests().filter(r => r.userId === this.getCurrentUserId())
  );
  readonly stats = computed(() => ({
    total: this.myRequests().length,
    pending: this.myRequests().filter(r => r.status !== 'terminée').length,
    completed: this.myRequests().filter(r => r.status === 'terminée').length,
  }));
  
  // Méthodes
  
  // Créer une demande
  async createRequest(data: CreateServiceRequestDTO): Promise<ServiceRequest>;
  
  // Récupérer les demandes de l'utilisateur
  async loadMyRequests(): Promise<void>;
  
  // Récupérer une demande spécifique
  async getRequest(id: string): Promise<ServiceRequest>;
  
  // Annuler une demande (utilisateur)
  async cancelRequest(id: string): Promise<void>;
  
  // Mettre à jour une demande (admin, futur)
  async updateRequest(id: string, update: Partial<ServiceRequest>): Promise<void>;
  
  // Privé
  private getCurrentUserId(): string;
  private saveToLocalStorage(): void;
  private loadFromLocalStorage(): void;
}
```

**Implémentation réelle (Supabase, pas de phase transitoire)** :
- Données stockées dans la table Postgres `service_requests` (schéma complet dans `PLAN_BACKEND_SUPABASE.md` section 2.4)
- `id` généré par `gen_random_uuid()` côté base
- `userId` = `auth.uid()` (session Supabase Auth réelle, pas de valeur temporaire)
- RLS + trigger empêchent un client de modifier autre chose que `status → 'annulée'`
- Données de test insérées directement en base (seed SQL), pas en `localStorage`

---

### 3. Composants et pages

#### Nouvelle route
```typescript
// Dans app.routes.ts
{ path: 'mon-compte/demandes', component: ServiceRequestsPage, title: 'Mes demandes — RHEODYCE' }
{ path: 'mon-compte/demandes/:id', component: ServiceRequestDetailPage, title: 'Détail demande — RHEODYCE' }
```

#### Page 1 : `src/app/features/my-account/service-requests/service-requests.ts`

**Affichage** :
- Liste complète des demandes de l'utilisateur
- Filtre par statut (boutons: Tous, En cours, Terminées)
- Tableau ou grille avec colonnes:
  - Service
  - Statut (badge coloré)
  - Date création
  - Date mise à jour
  - Actions (Voir détail, Annuler)

**Logique** :
- Charger les demandes au mount
- Signals pour l'état: `selectedStatus`, `loading`
- Computed pour le filtrage: `filteredRequests`
- Bouton "Nouvelle demande" → lien vers formulaire

**Styles** :
- Responsive (mobile-first)
- Statuts avec couleurs distinctes
- Skeleton loaders si async
- Empty state si aucune demande

#### Page 2 : `src/app/features/my-account/service-requests/service-request-detail/service-request-detail.ts`

**Affichage** :
- Header avec service + statut
- Bloc: Informations de contact
- Bloc: Description et contexte
- Bloc: Propriété associée (si disponible)
- Bloc: Notes admin (si assignée)
- Timeline des changements de statut (futur)
- Bouton Annuler (si statut "reçue" ou "en traitement")

**Logique** :
- Récupérer l'ID de route via `input()`
- Signal pour la demande
- Gestion du cas "non trouvé"
- Computed pour affichage du nom du service

**Styles** :
- Cards avec bordures
- Badges pour le statut
- Formulaire en lecture seule
- CTA pour annuler

#### Page 3 (Optionnel pour MVP) : Formulaire de création

Voir section 5 ci-dessous.

---

### 4. Intégration dans l'app

#### Structure des dossiers

```
src/app/features/my-account/               (NOUVEAU)
├── my-account.ts                         (layout/container)
├── service-requests/
│   ├── service-requests.ts                (liste)
│   ├── service-request-detail/
│   │   ├── service-request-detail.ts      (détail)
│   │   └── service-request-detail.html
│   └── service-request-form/              (créer/éditer - optionnel)
```

#### Header/Navigation

Ajouter un lien dans le menu ou un bouton "Mon compte" :
- Uniquement visible si abonné (`isSubscriber()`)
- Lien vers `/mon-compte/demandes`

---

### 5. Demandes de service : créer une demande (Future)

**Formulaire de création** : `src/app/features/my-account/service-requests/service-request-form/`

**À mettre en place** :
- Sélectionner le type de service
- Remplir nom/email/téléphone
- Description de la demande
- Propriété concernée (optional, autocomplete)
- Budget indicatif (optional)
- Validation côté client
- Submit → `ServiceRequestService.createRequest()`

**Note** : Peut être intégré :
- Sur la page de chaque service (maintenance, décoration, etc.)
- Via modal
- Page dédiée `/mon-compte/demandes/creer`

---

## 🗂️ Plan d'implémentation étape par étape

### Phase 1 : Fondations (Models + Service)

**Fichiers à créer** :
1. ✅ `src/app/shared/models/service-request.model.ts`
   - Types, interfaces
   - Labels et couleurs

2. ✅ `src/app/core/services/service-request.service.ts`
   - CRUD avec localStorage
   - Signals + computed
   - Données de test

**Durée estimée** : 2-3 heures
**Complexité** : ⭐ (récit/modèle)

### Phase 2 : Page liste des demandes

**Fichiers à créer** :
1. ✅ `src/app/features/my-account/service-requests/service-requests.ts`
2. ✅ `src/app/features/my-account/service-requests/service-requests.html`
3. ✅ `src/app/features/my-account/service-requests/service-requests.css`

**Composant partagé** (nouveau) :
- `src/app/shared/components/request-status-badge/request-status-badge.ts`

**Modifications existantes** :
- Ajouter route dans `app.routes.ts`
- Ajouter lien dans `header.ts` (optionnel)

**Tests** :
- `service-requests.spec.ts` (unitaires + snapshot)

**Durée estimée** : 3-4 heures
**Complexité** : ⭐⭐ (routing, affichage, filtrage)

### Phase 3 : Page détail d'une demande

**Fichiers à créer** :
1. ✅ `src/app/features/my-account/service-requests/service-request-detail/service-request-detail.ts`
2. ✅ `src/app/features/my-account/service-requests/service-request-detail/service-request-detail.html`
3. ✅ `src/app/features/my-account/service-requests/service-request-detail/service-request-detail.css`

**Modifications existantes** :
- Ajouter route dans `app.routes.ts` : `mon-compte/demandes/:id`

**Tests** :
- `service-request-detail.spec.ts`

**Durée estimée** : 2-3 heures
**Complexité** : ⭐⭐ (paramètres route, affichage conditionnel)

### Phase 4 : Intégration avec le reste de l'app

**Modifications** :
- [ ] Ajouter lien "Mon compte" dans header si abonné
- [ ] Ajouter lien "Mes demandes" dans footer
- [ ] Intégrer boutons "Démarrer un dossier" → `/mon-compte/demandes/creer`

**Durée estimée** : 1-2 heures

### Phase 5 : Formulaire de création (Optionnel pour MVP)

**Fichiers à créer** :
1. ✅ `src/app/features/my-account/service-requests/service-request-form/service-request-form.ts`
2. ✅ `src/app/features/my-account/service-requests/service-request-form/service-request-form.html`

**Features** :
- [ ] Sélecteur de type de service
- [ ] Champs de contact pré-remplis (localStorage)
- [ ] Sélecteur de propriété (dropdown)
- [ ] Validation FormGroup
- [ ] Soumission + feedback (toast/modal)

**Durée estimée** : 4-5 heures
**Complexité** : ⭐⭐⭐ (formulaires réactifs, validation)

### Phase 6 : Backend Supabase (déjà planifié, pas une extension future)

**Documenté dans `PLAN_BACKEND_SUPABASE.md`** :
- [x] Schéma de table `service_requests` (SQL complet, section 2.4)
- [x] RLS + trigger de restriction des updates (section 2.4)
- [x] Edge Function `create-service-request` (section 4.1)
- [x] Permissions utilisateur vs admin (via RLS + `is_admin()`, pas de rate limiting custom nécessaire — géré par Supabase)

**Voir section "Implémentation réelle (Supabase)" ci-dessous.**

---

## 🔌 Implémentation réelle (Supabase) — remplace la section "Préparer l'admin"

### Table et RLS

Le schéma complet de `service_requests` (colonnes, contraintes, RLS, trigger anti-modification) est détaillé dans **[PLAN_BACKEND_SUPABASE.md § 2.4](PLAN_BACKEND_SUPABASE.md#24-service_requests-le-cœur-de-la-feature-plan_service_requestsmd)**. Résumé :

- Un client authentifié peut **créer** sa propre demande (`user_id = auth.uid()` forcé)
- Un client peut **voir** uniquement ses propres demandes
- Un client peut **annuler** sa demande (passer `status` à `'annulée'`) mais **ne peut modifier aucun autre champ** (bloqué par trigger `enforce_service_request_update`)
- Un admin (`profiles.role = 'admin'`) peut tout voir et tout modifier (statut, `assigned_to`, `notes`)

### Où brancher Supabase dans le service

**Fichier à créer** : `src/app/core/services/service-request.service.ts`

```typescript
async createRequest(data: CreateServiceRequestDTO): Promise<ServiceRequest> {
  this.isLoading.set(true);
  try {
    const { data: created, error } = await this.supabase.client
      .from('service_requests')
      .insert({
        user_id: this.auth.userId(),
        service_type: data.serviceType,
        client_name: data.clientName,
        client_email: data.clientEmail,
        client_phone: data.clientPhone,
        description: data.description,
        property_id: data.propertyId,
        budget: data.budget,
      })
      .select()
      .single();

    if (error) throw error;

    const mapped = this.mapFromRow(created);
    this.requests.update(r => [...r, mapped]);
    return mapped;
  } finally {
    this.isLoading.set(false);
  }
}

async loadMyRequests(): Promise<void> {
  this.isLoading.set(true);
  try {
    const { data, error } = await this.supabase.client
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    this.requests.set((data ?? []).map(this.mapFromRow));
  } finally {
    this.isLoading.set(false);
  }
}

async cancelRequest(id: string): Promise<void> {
  const { error } = await this.supabase.client
    .from('service_requests')
    .update({ status: 'annulée' })
    .eq('id', id);

  if (error) throw error; // le trigger RLS rejette si non autorisé
  this.requests.update(r =>
    r.map(req => (req.id === id ? { ...req, status: 'annulée' } : req)),
  );
}
```

Aucun `HttpHeaders` manuel ni token à gérer : `supabase-js` attache automatiquement le JWT de la session courante à chaque requête, et le RLS fait respecter les permissions côté serveur.

### Authentification

**Avant** : `localStorage rheodyce:isSubscriber` (flag simple, pas de vraie identité)

**Après** : session Supabase Auth réelle (`supabase.auth.getSession()`), `userId` = `auth.uid()`, `isSubscriber` dérivé de `profiles.is_subscriber` (voir `PLAN_BACKEND_SUPABASE.md § 7.4` pour le refactor d'`AuthService` qui garde son API publique intacte).

### Hiérarchie des permissions

| Action | Utilisateur | Admin |
|--------|-------------|-------|
| Créer demande | ✅ | N/A |
| Voir ses demandes | ✅ | N/A |
| Voir une demande | ✅ (siennes) | ✅ (toutes) |
| Modifier demande | ❌ (créateur seulement) | ✅ |
| Changer statut | ❌ | ✅ |
| Assigner prestataire | ❌ | ✅ |
| Annuler demande | ✅ (avant terminée) | ✅ |

---

## 🧪 Tests et validation

### Tests unitaires

#### ServiceRequestService

- [ ] Créer une demande valide
- [ ] Récupérer les demandes filtrées par utilisateur
- [ ] Mettre à jour le statut
- [ ] Annuler une demande
- [ ] Persistence localStorage
- [ ] Gestion des erreurs

#### ServiceRequestsPage

- [ ] Charger et afficher la liste
- [ ] Filtrer par statut
- [ ] Naviguer vers le détail
- [ ] Bouton annuler (logique)

#### ServiceRequestDetailPage

- [ ] Charger détail via route param
- [ ] Afficher infos correctement
- [ ] Bouton annuler (si statut valide)
- [ ] Route 404 (demande inexistante)

### Tests d'intégration

- [ ] Créer demande → Voir dans liste
- [ ] Cliquer dans liste → Aller au détail
- [ ] Revenir de détail → Garder scroll list
- [ ] Annuler → Notification + list update

### Checklist avant prod

- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessibilité (ARIA, focus, keyboard)
- [ ] Loader states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Formulaires validés côté client

---

## 📊 Données de test

### Données seedées en base (Supabase, pas localStorage)

Les demandes de test sont insérées directement dans la table `service_requests` (SQL `INSERT`), liées aux comptes de démo créés via Supabase Auth (voir `PLAN_BACKEND_SUPABASE.md § 6.1` et `§ 6.5`). Exemple représentatif (le `user_id` réel sera l'UUID généré par Supabase Auth pour le compte `mireille.k@example.com`) :

```sql
insert into public.service_requests
  (user_id, service_type, status, client_name, client_email, client_phone, description, property_id, budget, assigned_to, created_at, updated_at)
values
  ('<uuid-mireille>', 'maintenance', 'en traitement', 'Mireille K.', 'mireille.k@example.com', '+243 812 345 678',
   'Fuite d''eau importante au 2e étage, affecte la chambre principale et le plafond du salon',
   '<uuid-property-kin-villa>', 500, 'john.plumber@rheodyce.cd', '2026-07-15T10:30:00Z', '2026-07-18T14:20:00Z'),
  ('<uuid-mireille>', 'decoration', 'reçue', 'Mireille K.', 'mireille.k@example.com', '+243 812 345 678',
   'Repeindre salon, changer rideaux et tapis', null, 1200, null, '2026-07-19T09:15:00Z', '2026-07-19T09:15:00Z');
  -- ... 10-13 lignes supplémentaires réparties sur les 4 service_type et 5 status
```

Le plan complet (volume, répartition, autres tables) est dans `PLAN_BACKEND_SUPABASE.md § 6`.

---

## 🎨 Design système

### Composant badge statut

**Fichier** : `src/app/shared/components/request-status-badge/request-status-badge.ts`

```html
<span [ngClass]="getStatusClasses(status)">
  {{ getStatusLabel(status) }}
</span>
```

**Couleurs (Tailwind)** :
- `reçue` → `bg-blue-100 text-blue-800 border border-blue-300`
- `en traitement` → `bg-yellow-100 text-yellow-800 border border-yellow-300`
- `assignée` → `bg-purple-100 text-purple-800 border border-purple-300`
- `terminée` → `bg-green-100 text-green-800 border border-green-300`
- `annulée` → `bg-red-100 text-red-800 border border-red-300`

### Layout pages

**Liste** :
- Header avec titre + filtre buttons
- Table/Grid responsive
- Empty state
- Pagination (optionnel)

**Détail** :
- Back button
- Card principale avec statut
- Sections: Contact, Description, Propriété, Admin notes
- CTA button Annuler

---

## 📋 Checklist d'implémentation

### Avant de commencer
- [ ] Lire ce plan
- [ ] Vérifier la structure existante
- [ ] Préparer les fichiers à créer

### Phase 1 (Modèles)
- [ ] Créer `service-request.model.ts`
- [ ] Créer `service-request.service.ts`
- [ ] Ajouter données de test en localStorage
- [ ] Tests unitaires du service

### Phase 2 (Liste)
- [ ] Créer page `service-requests.ts`
- [ ] Créer composant badge `request-status-badge.ts`
- [ ] Ajouter route dans `app.routes.ts`
- [ ] Styles Tailwind
- [ ] Tests

### Phase 3 (Détail)
- [ ] Créer page `service-request-detail.ts`
- [ ] Ajouter route paramétrisée
- [ ] Bouton annuler
- [ ] Tests

### Phase 4 (Intégration)
- [ ] Lien dans header/nav
- [ ] Vérifier responsive
- [ ] Vérifier accessibility
- [ ] Tests d'intégration

### Phase 5 (Bonus)
- [ ] Formulaire création
- [ ] Intégration sur pages de services
- [ ] Toast notifications

### Phase 6 (API Ready)
- [ ] Documenter endpoints requis
- [ ] Adapter service pour HttpClient
- [ ] Ajouter retry logic
- [ ] Error handling robuste

---

## 🔑 Points clés à retenir

1. **Pas de modification d'existant** : Juste ajouter des fichiers (les services existants gardent leur API publique, voir `PLAN_BACKEND_SUPABASE.md § 1`)
2. **Signals partout** : Pas de RxJS sauf si nécessaire
3. **Supabase dès le départ** : pas de phase `localStorage` transitoire, le vrai backend est prêt avant le code frontend
4. **Réutiliser les patterns** : Header/Footer, badges, cards
5. **Tests en même temps** : 1 composant = 1 spec
6. **Responsive first** : Mobile → Tablet → Desktop
7. **Accessibilité** : ARIA labels, focus management
8. **RLS = la sécurité, pas le frontend** : ne jamais recréer côté Angular des vérifications que Postgres fait déjà via RLS/trigger

---

## 📞 Fichiers à créer (résumé)

```
Créer:
  src/app/shared/models/service-request.model.ts
  src/app/core/services/service-request.service.ts
  src/app/features/my-account/service-requests/service-requests.ts
  src/app/features/my-account/service-requests/service-requests.html
  src/app/features/my-account/service-requests/service-requests.css
  src/app/features/my-account/service-requests/service-requests.spec.ts
  src/app/features/my-account/service-requests/service-request-detail/service-request-detail.ts
  src/app/features/my-account/service-requests/service-request-detail/service-request-detail.html
  src/app/features/my-account/service-requests/service-request-detail/service-request-detail.css
  src/app/features/my-account/service-requests/service-request-detail/service-request-detail.spec.ts
  src/app/shared/components/request-status-badge/request-status-badge.ts
  src/app/shared/components/request-status-badge/request-status-badge.html
  (optionnel) src/app/features/my-account/service-requests/service-request-form/...

Modifier:
  src/app/app.routes.ts                          (ajouter 2 routes)
  src/app/layout/header/header.ts                (optionnel: lien "Mon compte")

Backend (voir PLAN_BACKEND_SUPABASE.md pour le détail complet):
  supabase/migrations/*.sql                      (9 tables, RLS, triggers, seed)
  supabase/functions/contact-submit/index.ts     (Edge Function)
  supabase/functions/create-service-request/index.ts  (Edge Function)
  src/environments/environment.ts                (config Supabase)
  src/environments/environment.development.ts
  src/app/core/services/supabase-client.ts       (nouveau)
```

Total : 12-15 fichiers frontend à créer, 2 à modifier (légèrement), + le backend complet documenté dans `PLAN_BACKEND_SUPABASE.md`

Durée totale estimée : **15-20 heures** (frontend, phases 1-5) + **backend Supabase** (tables, RLS, Edge Functions, seed data — voir `PLAN_BACKEND_SUPABASE.md` pour le détail, non chiffré ici tant que le Go n'est pas donné)

