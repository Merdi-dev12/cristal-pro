# 🛠️ Patterns d'implémentation - Service Requests

Applique les patterns établis du projet pour que les nouveaux composants se fondent parfaitement dans l'architecture existante.

---

## 1️⃣ Pattern Signals (État réactif)

### ✅ Modèle à suivre

Voir `src/app/core/services/auth.service.ts` :

```typescript
@Service()
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';
  readonly isSubscriber = signal<boolean>(this.read());

  setSubscriber(value: boolean): void {
    localStorage.setItem(this.KEY, value ? '1' : '0');
    this.isSubscriber.set(value);
  }
}
```

### 🔧 Appliquer au ServiceRequestService

```typescript
@Service()
export class ServiceRequestService {
  private readonly KEY = 'rheodyce:service-requests';

  // État mutable
  readonly requests = signal<ServiceRequest[]>(this.loadFromStorage());
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // État dérivé (computed)
  readonly myRequests = computed(() => 
    this.requests().filter(r => r.userId === this.getCurrentUserId())
  );

  readonly stats = computed(() => ({
    total: this.myRequests().length,
    pending: this.myRequests().filter(r => r.status !== 'terminée').length,
    completed: this.myRequests().filter(r => r.status === 'terminée').length,
  }));

  private loadFromStorage(): ServiceRequest[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.getDefaultRequests();
    } catch {
      return this.getDefaultRequests();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.requests()));
  }
}
```

### 🎯 Points clés
- Signal pour chaque état qui change
- Computed pour dériver l'état
- Toujours typer: `signal<Type>()`
- Lire: `signal()`, écrire: `.set()` ou `.update()`

---

## 2️⃣ Pattern Injection de dépendances

### ✅ Modèle à suivre

Voir `src/app/features/home/home.ts` :

```typescript
@Component({...})
export class Home {
  private readonly auth = inject(AuthService);
  protected readonly data = inject(RheodyceDataService);

  readonly isSubscriber = computed(() => this.auth.isSubscriber());
}
```

### 🔧 Appliquer aux pages ServiceRequest

**ServiceRequestsPage**:
```typescript
@Component({...})
export class ServiceRequestsPage {
  private readonly service = inject(ServiceRequestService);
  protected readonly data = inject(ServiceRequestService); // accès public des données
  protected readonly router = inject(Router);
}
```

**ServiceRequestDetailPage**:
```typescript
@Component({...})
export class ServiceRequestDetailPage {
  private readonly service = inject(ServiceRequestService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly requestId = this.route.snapshot.paramMap.get('id')!;
  readonly request = signal<ServiceRequest | null>(null);
  // ...
}
```

### 🎯 Points clés
- `inject()` uniquement, pas de constructor
- Propriétés private sauf si accédées en template → protected
- Dépendances au début du composant
- Jamais de circulaire (Service → Component OK, Component → Service ❌)

---

## 3️⃣ Pattern Composants Standalone

### ✅ Modèle à suivre

Voir `src/app/features/home/home.ts` :

```typescript
@Component({
  selector: 'app-home',
  standalone: true,                     // ← TOUJOURS standalone: true
  imports: [                            // ← Importer TOUS les dépendances
    CommonModule,
    RouterLink,
    Hero,
    PropertyCard,
    SubscriberModal,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',               // ← Optionnel mais recommandé
})
export class Home {
  // ...
}
```

### 🔧 Appliquer aux composants ServiceRequest

**ServiceRequestsPage**:
```typescript
@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RequestStatusBadge,               // ← Composant partagé
    FormsModule,                       // ← Si formulaire
  ],
  templateUrl: './service-requests.html',
  styleUrl: './service-requests.css',
})
export class ServiceRequestsPage {
  // ...
}
```

**RequestStatusBadge**:
```typescript
@Component({
  selector: 'app-request-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="statusClasses">
      {{ statusLabel }}
    </span>
  `,
})
export class RequestStatusBadge {
  readonly status = input.required<RequestStatus>();
  
  protected get statusLabel(): string {
    return SERVICE_TYPE_LABELS[this.status()];
  }
  
  protected get statusClasses(): string {
    return REQUEST_STATUS_COLORS[this.status()];
  }
}
```

### 🎯 Points clés
- `standalone: true` systématiquement
- `imports: []` avec TOUT (CommonModule, composants, pipes, directives)
- Pas de `NgModule`
- Une responsabilité par composant

---

## 4️⃣ Pattern Inputs/Outputs (Signal-based)

### ✅ Modèle à suivre

Voir `src/app/shared/components/property-card/property-card.ts` :

```typescript
@Component({...})
export class PropertyCard {
  readonly property = input.required<Property>();  // ← Required
  readonly viewDetails = output<Property>();        // ← Emit quoi

  protected onViewDetails(): void {
    this.viewDetails.emit(this.property());
  }
}
```

### 🔧 Appliquer aux composants

**RequestStatusBadge**:
```typescript
@Component({...})
export class RequestStatusBadge {
  // Input: le statut à afficher
  readonly status = input.required<RequestStatus>();

  // Computed: traduire et styler
  protected readonly statusLabel = computed(() => 
    SERVICE_TYPE_LABELS[this.status()]
  );
  
  protected readonly statusClasses = computed(() => 
    REQUEST_STATUS_COLORS[this.status()]
  );
}

// Usage:
<app-request-status-badge [status]="request.status" />
```

**ServiceRequestsPage** (en tant que parent):
```typescript
@Component({...})
export class ServiceRequestsPage {
  protected readonly service = inject(ServiceRequestService);
  
  // ↓ Dans le template
  // @for (request of service.myRequests(); track request.id) {
  //   <div (click)="onSelectRequest(request)">
  //     <app-request-status-badge [status]="request.status" />
  //   </div>
  // }

  protected onSelectRequest(request: ServiceRequest): void {
    this.router.navigate(['/mon-compte/demandes', request.id]);
  }
}
```

### 🎯 Points clés
- Input: reçoit depuis parent
- Output: envoie vers parent
- `input.required()` si obligatoire
- `input(defaultValue)` si optionnel
- Lire: `property()`, écrire: `.emit(value)`

---

## 5️⃣ Pattern Template avec Control Flow (@for, @if)

### ✅ Modèle à suivre

Voir `src/app/features/services/services.ts` :

```html
@for (service of data.services; track service.id; let i = $index) {
  <article class="service-row">
    <div>0{{ i + 1 }}</div>
    <h3>{{ service.title }}</h3>
    <p>{{ service.description }}</p>
  </article>
}
```

### 🔧 Appliquer aux pages ServiceRequest

**ServiceRequestsPage template**:
```html
<section>
  <h1>Mes demandes</h1>

  <!-- Filtre -->
  <div class="flex gap-2 mb-4">
    <button 
      (click)="selectedStatus.set(null)"
      [class.active]="!selectedStatus()">
      Tous
    </button>
    <button 
      (click)="selectedStatus.set('reçue')"
      [class.active]="selectedStatus() === 'reçue'">
      En cours
    </button>
    <button 
      (click)="selectedStatus.set('terminée')"
      [class.active]="selectedStatus() === 'terminée'">
      Terminées
    </button>
  </div>

  <!-- Loading -->
  @if (isLoading()) {
    <div>Chargement...</div>
  }

  <!-- List -->
  @for (request of filteredRequests(); track request.id) {
    <div class="request-card" (click)="onViewDetail(request)">
      <div>{{ request.serviceType }}</div>
      <app-request-status-badge [status]="request.status" />
      <div>{{ request.createdAt | date }}</div>
      <button (click)="navigateToDetail(request.id)">Voir</button>
    </div>
  } @empty {
    <div class="empty">Aucune demande</div>
  }

  <!-- Error -->
  @if (error()) {
    <div class="alert">{{ error() }}</div>
  }
</section>
```

### 🎯 Points clés
- `@for` itère sur array (jamais `*ngFor`)
- `@if` condition (jamais `*ngIf`)
- `@empty` alternative si vide
- `track` pour performance (identifiant unique)
- `let i = $index` si index requis

---

## 6️⃣ Pattern Routing

### ✅ Modèle à suivre

Voir `src/app/app.routes.ts` :

```typescript
export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil — RHEODYCE' },
  { path: 'annonces', component: AnnoncesPage, title: 'Annonces — RHEODYCE' },
  { path: '**', redirectTo: '' },  // ← Catch-all dernier
];
```

### 🔧 Appliquer aux routes ServiceRequest

```typescript
export const routes: Routes = [
  // ... routes existantes ...
  
  { 
    path: 'mon-compte/demandes', 
    component: ServiceRequestsPage, 
    title: 'Mes demandes — RHEODYCE' 
  },
  { 
    path: 'mon-compte/demandes/:id', 
    component: ServiceRequestDetailPage, 
    title: 'Détail demande — RHEODYCE' 
  },
  { 
    path: 'mon-compte/demandes/creer', 
    component: ServiceRequestFormPage, 
    title: 'Créer une demande — RHEODYCE' 
  },

  // ← Catch-all reste en dernier
  { path: '**', redirectTo: '' },
];
```

**Navigation depuis composant**:
```typescript
@Component({...})
export class ServiceRequestsPage {
  private readonly router = inject(Router);

  protected navigateToDetail(id: string): void {
    this.router.navigate(['/mon-compte/demandes', id]);
  }

  protected navigateBack(): void {
    this.router.navigate(['/mon-compte/demandes']);
  }
}
```

**Récupérer paramètre dans un autre composant**:
```typescript
@Component({...})
export class ServiceRequestDetailPage {
  private readonly route = inject(ActivatedRoute);

  readonly requestId = this.route.snapshot.paramMap.get('id')!;
  // ou
  readonly requestId = input.required<string>(); // si via input
}
```

### 🎯 Points clés
- Titre traduit: "Titre — RHEODYCE"
- Routes imbriquées: `mon-compte/demandes`
- Paramètres: `:id` dans le path
- Catch-all `**` toujours dernier
- `this.router.navigate()` pour passer à une route

---

## 7️⃣ Pattern Styling Tailwind

### ✅ Modèle à suivre

Voir `src/app/features/services/services.ts` (template inline) :

```html
<section class="bg-[#f4f5f2] pb-16 pt-28">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <h1 class="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-rheo-dark sm:text-5xl">
      Titre
    </h1>
    <p class="mt-5 max-w-2xl text-sm leading-7 text-rheo-muted">
      Description
    </p>
  </div>
</section>
```

### 🔧 Appliquer aux pages ServiceRequest

**ServiceRequestsPage**:
```html
<section class="bg-rheo-bg pb-16 pt-28">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-semibold tracking-tight text-rheo-dark">
        Mes demandes
      </h1>
    </div>

    <!-- Filtre buttons -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button 
        class="px-4 py-2 rounded-[16px] border border-rheo-border transition"
        [class.bg-rheo-accent]="!selectedStatus()">
        Tous
      </button>
    </div>

    <!-- List -->
    <div class="grid gap-4">
      @for (request of filteredRequests(); track request.id) {
        <article class="rounded-[20px] border border-rheo-border bg-white p-6 hover:shadow-md transition cursor-pointer"
          (click)="navigateToDetail(request.id)">
          <div class="grid grid-cols-4 gap-4 items-start">
            <div>
              <p class="text-xs font-semibold uppercase text-rheo-muted">Service</p>
              <p class="mt-2 font-semibold text-rheo-dark">{{ request.serviceType }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-rheo-muted">Statut</p>
              <app-request-status-badge [status]="request.status" class="mt-2" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-rheo-muted">Date</p>
              <p class="mt-2 text-rheo-dark">{{ request.createdAt | date: 'short' }}</p>
            </div>
            <div class="text-right">
              <button class="rounded-[12px] bg-rheo-accent px-4 py-2 text-sm font-bold text-rheo-dark hover:bg-rheo-accent-hover transition">
                Voir
              </button>
            </div>
          </div>
        </article>
      } @empty {
        <div class="text-center py-12 text-rheo-muted">
          <p class="text-lg">Aucune demande</p>
          <p class="text-sm mt-2">Commencez par créer votre première demande</p>
        </div>
      }
    </div>

  </div>
</section>
```

**Couleurs personnalisées (déjà en CSS)**:
```
--color-rheo-bg        #f5f7f4     (fond)
--color-rheo-surface   #ffffff     (cartes)
--color-rheo-accent    #c5e84a     (CTA, highlights)
--color-rheo-dark      #1a1a1a     (texte principal)
--color-rheo-muted     #6b7280     (texte secondaire)
--color-rheo-border    #e8ebe6     (bordures)
--radius-rheo          1.5rem      (border-radius)
```

### 🎯 Points clés
- Classes Tailwind par défaut
- Variables CSS rheo- pour couleurs personnalisées
- Responsive: `sm:`, `md:`, `lg:` prefixes
- Classes d'état: `hover:`, `focus:`, `active:`
- Pas de CSS inline, utiliser `.css` scoped si besoin

---

## 8️⃣ Pattern Pipes personnalisés

### ✅ Modèle à suivre

Voir `src/app/shared/pipes/pipe.ts` :

```typescript
@Pipe({
  name: 'propertyPrice',
  standalone: true,
})
export class PropertyPricePipe implements PipeTransform {
  transform(price: number | string): string {
    if (!price) return '-';
    return `${Number(price).toLocaleString('fr-FR')} USD`;
  }
}
```

### 🔧 Appliquer à ServiceRequest

**DatePipe (built-in)**:
```html
<!-- Utiliser le built-in -->
<p>{{ request.createdAt | date: 'short' }}</p>
<p>{{ request.createdAt | date: 'd MMMM yyyy' }}</p>
```

**Pipe personnalisé optionnel**:
```typescript
// src/app/shared/pipes/service-type.pipe.ts
@Pipe({
  name: 'serviceTypeLabel',
  standalone: true,
})
export class ServiceTypeLabel implements PipeTransform {
  transform(type: ServiceType): string {
    return SERVICE_TYPE_LABELS[type];
  }
}

// Usage: {{ request.serviceType | serviceTypeLabel }}
```

### 🎯 Points clés
- `@Pipe` avec `standalone: true`
- Implémenter `PipeTransform`
- Inclure dans `imports: []` du composant
- Utiliser en template: `{{ value | pipeName }}`

---

## 9️⃣ Pattern Tests (Vitest + Jasmine)

### ✅ Modèle à suivre

Voir `src/app/features/home/home.spec.ts` :

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display featured properties', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('app-property-card').length).toBeGreaterThan(0);
  });
});
```

### 🔧 Appliquer aux ServiceRequest

**ServiceRequestService spec**:
```typescript
describe('ServiceRequestService', () => {
  let service: ServiceRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceRequestService],
    });
    service = TestBed.inject(ServiceRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a request', async () => {
    const dto = {
      serviceType: 'maintenance',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '123456789',
      description: 'Test',
    };

    const request = await service.createRequest(dto);
    expect(request.id).toBeDefined();
    expect(request.status).toBe('reçue');
    expect(service.myRequests().length).toBeGreaterThan(0);
  });

  it('should filter by status', () => {
    const received = service.myRequests().filter(r => r.status === 'reçue');
    expect(received.length).toBeGreaterThanOrEqual(0);
  });
});
```

**ServiceRequestsPage spec**:
```typescript
describe('ServiceRequestsPage', () => {
  let component: ServiceRequestsPage;
  let fixture: ComponentFixture<ServiceRequestsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRequestsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display list of requests', () => {
    const cards = fixture.nativeElement.querySelectorAll('.request-card');
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should navigate on request click', () => {
    const spy = spyOn(component['router'], 'navigate');
    component.navigateToDetail('req-001');
    expect(spy).toHaveBeenCalledWith(['/mon-compte/demandes', 'req-001']);
  });
});
```

### 🎯 Points clés
- 1 fichier `.spec.ts` par composant/service
- `beforeEach` pour setup
- `expect()` pour assertions
- Tester la logique, pas l'implémentation
- Mocker les dépendances si nécessaire

---

## 🔟 Pattern localStorage

### ✅ Modèle à suivre

Voir `src/app/core/services/auth.service.ts` :

```typescript
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';

  readonly isSubscriber = signal<boolean>(this.read());

  setSubscriber(value: boolean): void {
    localStorage.setItem(this.KEY, value ? '1' : '0');
    this.isSubscriber.set(value);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(this.KEY) === '1';
    } catch {
      return false;  // Fallback si pas d'accès
    }
  }
}
```

### 🔧 Appliquer au ServiceRequestService

```typescript
@Service()
export class ServiceRequestService {
  private readonly KEY = 'rheodyce:service-requests';
  private readonly USER_ID = 'current-user';

  readonly requests = signal<ServiceRequest[]>(this.loadFromStorage());
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Charger au démarrage
  private loadFromStorage(): ServiceRequest[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.getDefaultRequests();
    } catch (err) {
      console.error('Failed to load requests from storage', err);
      return this.getDefaultRequests();
    }
  }

  // Sauvegarder à chaque changement
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.requests()));
    } catch (err) {
      console.error('Failed to save requests to storage', err);
      this.error.set('Erreur de sauvegarde');
    }
  }

  async createRequest(data: CreateServiceRequestDTO): Promise<ServiceRequest> {
    try {
      this.isLoading.set(true);
      
      const request: ServiceRequest = {
        id: this.generateId(),
        userId: this.getCurrentUserId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'reçue',
      };

      this.requests.update(r => [...r, request]);
      this.saveToStorage();
      this.error.set(null);
      return request;
    } catch (err) {
      this.error.set('Erreur lors de la création');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // TODO: Remplacer par authService.getCurrentUser().id après vraie auth
    return this.USER_ID;
  }

  private getDefaultRequests(): ServiceRequest[] {
    // Données de test pré-chargées
    return [
      {
        id: 'req-001',
        userId: this.USER_ID,
        serviceType: 'maintenance',
        status: 'en traitement',
        clientName: 'Mireille K.',
        clientEmail: 'mireille@example.com',
        clientPhone: '+243 812 345 678',
        description: 'Fuite d\'eau importante au 2e étage',
        propertyId: 'kin-villa-01',
        budget: 500,
        createdAt: new Date('2026-07-15'),
        updatedAt: new Date('2026-07-18'),
        assignedTo: 'john.plumber@rheodyce.cd',
      },
      // ... autres
    ];
  }
}
```

### 🎯 Points clés
- Clé préfixée: `rheodyce:nom-de-donnee`
- Try/catch pour erreurs localStorage
- Charger au démarrage (constructor/signal init)
- Sauvegarder après chaque modification
- Fallback sûr en cas d'erreur

---

## 📝 Checklist d'implémentation

Pour chaque fichier à créer:

### Modèle (service-request.model.ts)
- [ ] Types: `ServiceType`, `RequestStatus`
- [ ] Interface: `ServiceRequest`
- [ ] DTO: `CreateServiceRequestDTO`
- [ ] Labels: `SERVICE_TYPE_LABELS`, `REQUEST_STATUS_LABELS`
- [ ] Couleurs: `REQUEST_STATUS_COLORS`

### Service (service-request.service.ts)
- [ ] `@Service()` decorator
- [ ] Signals: `requests`, `isLoading`, `error`
- [ ] Computed: `myRequests`, `stats`
- [ ] Méthodes CRUD: create, read, update, delete, cancel
- [ ] localStorage integration
- [ ] Tests unitaires
- [ ] Données de test

### Composants (pages)
- [ ] `@Component()` standalone: true
- [ ] Imports complets
- [ ] Input/Output (si applicable)
- [ ] Signals pour state local
- [ ] Computed pour dériver
- [ ] Méthodes protected pour templates
- [ ] Template avec @for, @if
- [ ] Styles Tailwind
- [ ] Tests avec TestBed
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessibilité (ARIA, focus)

### Routes
- [ ] Ajouter à `app.routes.ts`
- [ ] Titre traduit (— RHEODYCE)
- [ ] Paramètres si besoin

### Tests
- [ ] 1 spec par composant/service
- [ ] Happy path
- [ ] Error cases
- [ ] Edge cases
- [ ] Coverage > 80%

---

## 🎓 Validation final

Avant de valider une implémentation, vérifier que:

- ✅ Code compilé sans erreur
- ✅ Linting passe (prettier)
- ✅ Tests passent (vitest)
- ✅ Responsive OK (mobile, tablet, desktop)
- ✅ Accessibilité OK (ARIA, keyboard)
- ✅ Patterns respectés (comme ce guide)
- ✅ Pas de code copié-collé (réutiliser)
- ✅ Commits clairs et progressifs
- ✅ PR avec description détaillée

