# Architecture visuelle - Système de demandes de services

## 🏗️ Flux de données

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION RHEODYCE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  LAYOUT (Header + Footer)                  │  │
│  │  - Lien "Mon compte" (si isSubscriber)                    │  │
│  │  - Lien "Mes demandes"                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              ROUTER OUTLET (Routes)                        │  │
│  │  - /mon-compte/demandes (ServiceRequestsPage)             │  │
│  │  - /mon-compte/demandes/:id (ServiceRequestDetailPage)    │  │
│  │  - /mon-compte/demandes/creer (ServiceRequestFormPage)    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            SERVICE LAYER (Core)                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   ServiceRequestService                             │ │  │
│  │  │   - Signals: requests, isLoading, error             │ │  │
│  │  │   - Computed: myRequests, stats                     │ │  │
│  │  │   - CRUD operations                                 │ │  │
│  │  │   - localStorage ↔ Backend (future)                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   AuthService                                        │ │  │
│  │  │   - isSubscriber signal                              │ │  │
│  │  │   - getCurrentUserId()                               │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         DATA MODELS (Shared/Models)                        │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   ServiceRequest (Interface)                         │ │  │
│  │  │   - id, userId, serviceType, status                 │ │  │
│  │  │   - clientName, clientEmail, clientPhone            │ │  │
│  │  │   - description, propertyId, budget                 │ │  │
│  │  │   - createdAt, updatedAt, completedAt               │ │  │
│  │  │   - assignedTo, notes                                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   Types & Enums                                      │ │  │
│  │  │   - ServiceType: maintenance | decoration | ...      │ │  │
│  │  │   - RequestStatus: reçue | en traitement | ...       │ │  │
│  │  │   - Labels, Colors, CreateDTO                        │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         PERSISTENCE LAYER                                  │  │
│  │                                                              │  │
│  │  localStorage: "rheodyce:service-requests"                │  │
│  │     ↓                                                       │  │
│  │  [Future] HttpClient → Backend API                        │  │
│  │     POST   /api/service-requests                          │  │
│  │     GET    /api/service-requests                          │  │
│  │     GET    /api/service-requests/:id                      │  │
│  │     PATCH  /api/service-requests/:id                      │  │
│  │     DELETE /api/service-requests/:id                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Pages et composants

```
PAGES (Components standalone)
│
├── ServiceRequestsPage (/mon-compte/demandes)
│   ├── Input: none
│   ├── Inject: ServiceRequestService, AuthService
│   ├── Signals:
│   │   ├── selectedStatus (filter)
│   │   └── isLoading
│   ├── Computed:
│   │   ├── filteredRequests
│   │   └── statusCounts
│   ├── Sub-components:
│   │   ├── RequestStatusBadge (shared)
│   │   ├── RequestCard (local, optional)
│   │   └── EmptyState (local, optional)
│   └── Output: Navigate to detail
│
├── ServiceRequestDetailPage (/mon-compte/demandes/:id)
│   ├── Input: id (from route)
│   ├── Inject: ServiceRequestService, ActivatedRoute
│   ├── Signals:
│   │   ├── request
│   │   ├── isLoading
│   │   └── error
│   ├── Methods:
│   │   ├── loadRequest()
│   │   └── onCancel()
│   ├── Sub-components:
│   │   └── RequestStatusBadge (shared)
│   └── Template sections:
│       ├── Header (title + status)
│       ├── Info (contact details)
│       ├── Description
│       ├── Property (if linked)
│       ├── Admin notes (if assigned)
│       └── Actions (cancel button)
│
└── ServiceRequestFormPage (/mon-compte/demandes/creer) [OPTIONAL]
    ├── Input: none
    ├── Inject: ServiceRequestService, Router
    ├── Form: FormGroup
    │   ├── serviceType (required)
    │   ├── clientName (required)
    │   ├── clientEmail (required)
    │   ├── clientPhone (required)
    │   ├── description (required)
    │   ├── propertyId (optional)
    │   └── budget (optional)
    ├── Methods:
    │   ├── onSubmit()
    │   └── populateFromStorage()
    └── Sub-components:
        ├── ServiceTypeSelector
        ├── PropertySelector
        └── FormErrorsDisplay


SHARED COMPONENTS
│
└── RequestStatusBadge
    ├── Input: status (RequestStatus)
    ├── Computed: displayText, cssClass
    └── Template: <span [ngClass]="cssClass">{{ displayText }}</span>
```

---

## 🔄 Flux utilisateur (Happy path)

```
1. UTILISATEUR VISITE /mon-compte/demandes
   ├─ ServiceRequestsPage charge
   ├─ Service.loadMyRequests() déclenché
   ├─ Affiche liste paginée
   └─ Filtre par statut (Tous, En cours, Terminées)

2. UTILISATEUR CLIQUE SUR UNE DEMANDE
   ├─ Navigate to /mon-compte/demandes/:id
   ├─ ServiceRequestDetailPage charge
   ├─ Service.getRequest(id) déclenché
   ├─ Affiche détails complets
   └─ Affiche bouton "Annuler" (si statut approprié)

3. UTILISATEUR ANNULE LA DEMANDE
   ├─ Clic sur bouton "Annuler"
   ├─ Confirmation modal
   ├─ Service.cancelRequest(id) appelé
   ├─ Status passe à "annulée"
   ├─ Toast notification
   └─ Retour à la liste (status mis à jour)

4. ADMIN TRAITE LA DEMANDE (futur)
   ├─ Admin panel: voir demande
   ├─ Change statut: reçue → en traitement
   ├─ Assigne prestataire
   ├─ Ajoute notes
   └─ Utilisateur voit les mises à jour en temps réel (polling/websocket)
```

---

## 🎯 Cas d'usage détaillés

### Cas 1: Créer une demande (sur page services)

```
USER clicks "Démarrer un dossier" on /services/maintenance
    ↓
Navigate to /mon-compte/demandes/creer
    ↓
ServiceRequestFormPage loads
    ↓
Pre-select serviceType = "maintenance"
    ↓
Form displayed with:
    - Service type (read-only or selector)
    - Contact fields (from localStorage or empty)
    - Description textarea
    - Property selector (autocomplete)
    - Budget input
    ↓
USER fills and submits
    ↓
Validation (client-side)
    ↓
Service.createRequest(data)
    ↓
New ServiceRequest created with status="reçue"
    ↓
Toast: "Demande créée avec succès"
    ↓
Navigate to /mon-compte/demandes/:newId
```

### Cas 2: Consulter ses demandes

```
USER visits /mon-compte/demandes
    ↓
Page loads, Service.loadMyRequests() called
    ↓
Display list of all user's requests:
    [Maintenance] "Fuite d'eau" - En traitement - 15 juil
    [Décoration] "Repeindre salon" - Reçue - 19 juil
    [Juridique] "Vérifier contrat" - Terminée - 12 juil
    ↓
USER clicks filter "En cours" 
    ↓
Computed filteredRequests triggers
    ↓
Display only non-completed requests:
    [Maintenance] "Fuite d'eau" - En traitement - 15 juil
    [Décoration] "Repeindre salon" - Reçue - 19 juil
    ↓
USER clicks on Maintenance request
    ↓
Navigate to /mon-compte/demandes/maintenance-001
```

### Cas 3: Admin traite une demande (futur)

```
ADMIN panel: GET /api/admin/service-requests
    ↓
List all requests system-wide
    ↓
ADMIN clicks on request
    ↓
Detail page with EDIT mode:
    - Status dropdown (reçue → en traitement → assignée → terminée)
    - Assignee dropdown
    - Notes textarea
    - Save button
    ↓
ADMIN changes:
    Status: "reçue" → "en traitement"
    Assignee: "john.plumber@rheodyce.cd"
    Notes: "Rendez-vous jeudi 14h"
    ↓
ADMIN clicks Save
    ↓
PATCH /api/admin/service-requests/:id
    {
      "status": "en traitement",
      "assignedTo": "john.plumber@rheodyce.cd",
      "notes": "Rendez-vous jeudi 14h",
      "updatedAt": "2026-07-20T15:30:00Z"
    }
    ↓
USER sees notification/email:
    "Votre demande de maintenance est en traitement"
    "Assignée à: John (Plombier)"
    ↓
USER can check /mon-compte/demandes/:id anytime
    ↓
Status badge: "En traitement"
    ↓
Admin notes visible if assigned
```

---

## 📊 État des données (Signals)

```
ServiceRequestService State:
┌────────────────────────────────────────────────────────┐
│  Signals (mutable state)                               │
├────────────────────────────────────────────────────────┤
│  requests: signal<ServiceRequest[]>                    │
│    → Full list from localStorage / API                 │
│                                                         │
│  isLoading: signal<boolean>                            │
│    → Indicates async operation in progress             │
│                                                         │
│  error: signal<string | null>                          │
│    → Last error message (network, validation, etc.)    │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│  Computed (derived state)                              │
├────────────────────────────────────────────────────────┤
│  myRequests = computed(() =>                           │
│    requests.filter(r => r.userId === userId)          │
│  )                                                      │
│  → Only this user's requests                           │
│                                                         │
│  stats = computed(() => ({                             │
│    total: myRequests.length,                           │
│    pending: count(status !== 'terminée'),              │
│    completed: count(status === 'terminée'),            │
│  }))                                                    │
│  → Summary statistics for dashboard                    │
│                                                         │
│  filterByStatus(status) = computed(() =>               │
│    myRequests.filter(r => r.status === status)         │
│  )                                                      │
│  → For filter buttons                                  │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│  Methods (actions)                                      │
├────────────────────────────────────────────────────────┤
│  createRequest(data)    → Create & add to requests[]   │
│  loadMyRequests()       → Fetch & populate requests[]  │
│  getRequest(id)         → Get one by ID                │
│  updateRequest(id, dto) → Patch & update state         │
│  cancelRequest(id)      → Set status to "annulée"      │
│  deleteRequest(id)      → Remove from requests[]       │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 Statuts et couleurs

```
┌──────────────────┬────────────────────────┬──────────────────────┐
│  Status          │  Label (i18n)          │  Tailwind Class      │
├──────────────────┼────────────────────────┼──────────────────────┤
│  "reçue"         │  ⏳ Reçue              │  bg-blue-100         │
│                  │                        │  text-blue-800       │
│                  │                        │  border-blue-300     │
├──────────────────┼────────────────────────┼──────────────────────┤
│  "en traitement" │  ⚙️ En traitement      │  bg-yellow-100       │
│                  │                        │  text-yellow-800     │
│                  │                        │  border-yellow-300   │
├──────────────────┼────────────────────────┼──────────────────────┤
│  "assignée"      │  👤 Assignée           │  bg-purple-100       │
│                  │                        │  text-purple-800     │
│                  │                        │  border-purple-300   │
├──────────────────┼────────────────────────┼──────────────────────┤
│  "terminée"      │  ✅ Terminée           │  bg-green-100        │
│                  │                        │  text-green-800      │
│                  │                        │  border-green-300    │
├──────────────────┼────────────────────────┼──────────────────────┤
│  "annulée"       │  ❌ Annulée            │  bg-red-100          │
│                  │                        │  text-red-800        │
│                  │                        │  border-red-300      │
└──────────────────┴────────────────────────┴──────────────────────┘

Component Usage:
<app-request-status-badge 
  [status]="request.status">
</app-request-status-badge>

Output: <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-blue-100 text-blue-800 border-blue-300">
  ⏳ Reçue
</span>
```

---

## 📱 Responsive Breakdown

```
MOBILE (< 640px)
┌──────────────────────────────┐
│  My Demands                  │
│ [All] [Pending] [Done]       │
├──────────────────────────────┤
│ [Card]                       │
│ Maintenance                  │
│ ⏳ Received                   │
│ Leak fix                     │
│ July 15                      │
│ [View →]                     │
├──────────────────────────────┤
│ [Card]                       │
│ Decoration                   │
│ ⏳ Received                   │
│ Paint living room            │
│ July 19                      │
│ [View →]                     │
└──────────────────────────────┘


TABLET (640px - 1024px)
┌────────────────────────────────────────┐
│  My Demands                            │
│ [All] [Pending] [Done]                 │
├────────────────────────────────────────┤
│ Service  | Status | Date | Action     │
├────────────────────────────────────────┤
│ Maint.   |⏳ Recv | 7/15 | [View]     │
│ Deco     |⏳ Recv | 7/19 | [View]     │
│ Legal    |✅ Done | 7/12 | [View]     │
└────────────────────────────────────────┘


DESKTOP (> 1024px)
┌──────────────────────────────────────────────────────┐
│  My Demands                                          │
│ [All] [Pending] [Done]  [Stats: 3 total / 2 pending]│
├──────────────────────────────────────────────────────┤
│ Service    | Status      | Date       | Contact | Ac │
├──────────────────────────────────────────────────────┤
│ Mainten.   |⏳ Received  | Jul 15     | Jane D. |[+]│
│ Decoration |⏳ Received  | Jul 19     | Jane D. |[+]│
│ Legal      |✅ Completed | Jul 12     | Jane D. |[+]│
└──────────────────────────────────────────────────────┘
```

---

## 🗂️ Arborescence finale (structure fichiers)

```
src/app/
│
├── core/services/
│   ├── auth.service.ts                      (existing)
│   ├── rheodyce-data.service.ts             (existing)
│   ├── scroll.ts                            (existing)
│   ├── header-state.ts                      (existing)
│   └── service-request.service.ts           ✨ NEW
│
├── features/
│   ├── annonces/                            (existing)
│   ├── auth/                                (existing)
│   ├── contact/                             (existing)
│   ├── decoration/                          (existing)
│   ├── faq/                                 (existing)
│   ├── home/                                (existing)
│   ├── location-vente/                      (existing)
│   ├── maintenance/                         (existing)
│   ├── services/                            (existing)
│   │
│   └── my-account/                          ✨ NEW FOLDER
│       ├── my-account.ts                    (container, optional)
│       └── service-requests/                ✨ NEW FOLDER
│           ├── service-requests.ts          ✨ NEW
│           ├── service-requests.html        ✨ NEW
│           ├── service-requests.css         ✨ NEW
│           ├── service-requests.spec.ts     ✨ NEW
│           │
│           ├── service-request-detail/      ✨ NEW FOLDER
│           │   ├── service-request-detail.ts      ✨ NEW
│           │   ├── service-request-detail.html    ✨ NEW
│           │   ├── service-request-detail.css     ✨ NEW
│           │   └── service-request-detail.spec.ts ✨ NEW
│           │
│           └── service-request-form/        ✨ NEW FOLDER (optional)
│               ├── service-request-form.ts
│               ├── service-request-form.html
│               ├── service-request-form.css
│               └── service-request-form.spec.ts
│
├── layout/
│   ├── header/                              (existing, minor mod)
│   │   ├── header.ts                        (add link to "My account")
│   │   └── header.html
│   └── footer/                              (existing, optional mod)
│
├── shared/
│   ├── components/
│   │   ├── property-card/                   (existing)
│   │   ├── subscriber-modal/                (existing)
   │   │
│   │   └── request-status-badge/            ✨ NEW FOLDER
│   │       ├── request-status-badge.ts      ✨ NEW
│   │       ├── request-status-badge.html    ✨ NEW
│   │       └── request-status-badge.spec.ts ✨ NEW
│   │
│   ├── models/
│   │   ├── property.model.ts                (existing)
│   │   ├── site-content.model.ts            (existing)
│   │   └── service-request.model.ts         ✨ NEW
│   │
│   ├── pipes/                               (existing)
│   └── directives/                          (existing)
│
├── app.routes.ts                            (modify: add 2-3 routes)
├── app.config.ts                            (existing)
├── app.ts                                   (existing)
└── app.html                                 (existing)
```

**Summary:**
- ✨ NEW: ~15 files to create
- Modify: 1-2 files (app.routes.ts, optional: header.ts)

---

## 🚀 Timeline par phase

```
PHASE 1: MODELS & SERVICE (2-3h)
├─ service-request.model.ts
├─ service-request.service.ts
└─ Tests for service
    ↓
PHASE 2: LIST PAGE (3-4h)
├─ service-requests.ts/html/css
├─ request-status-badge component
├─ Add routes to app.routes.ts
└─ Tests
    ↓
PHASE 3: DETAIL PAGE (2-3h)
├─ service-request-detail.ts/html/css
└─ Tests
    ↓
PHASE 4: INTEGRATION (1-2h)
├─ Add header link
├─ Responsive testing
└─ Accessibility check
    ↓
PHASE 5: FORM (optional, 4-5h)
├─ service-request-form.ts/html/css
├─ Validation & submission
└─ Tests
    ↓
PHASE 6: API PREP (1-2h)
├─ Document endpoints
├─ Prepare HttpClient integration
└─ Error handling strategy

TOTAL: 13-19 hours for MVP (phases 1-4)
        17-24 hours for FULL (phases 1-6)
```

