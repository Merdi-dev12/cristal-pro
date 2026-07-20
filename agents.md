# Guide Complet pour les Agents - Rheodyce Frontend

## 📋 Vue d'ensemble du projet

### Qu'est-ce que Rheodyce ?

**Rheodyce** est une plateforme immobilière basée en République Démocratique du Congo qui centralise, vérifie et facilite les transactions immobilières. Le projet couvre plusieurs villes (Kinshasa, Lubumbashi, Goma, Matadi) et propose :

- **Annonces immobilières** : location et vente de propriétés (maisons, appartements, résidences, terrains)
- **Services complémentaires** : vérification anti-fraude, maintenance, décoration intérieure, assistance juridique
- **Système d'abonnement** : contenu gratuit pour tous, accès premium aux coordonnées et informations sensibles
- **Support client** : FAQ, formulaire de contact

### Stack technologique

- **Framework** : Angular 22 (dernière version, composants standalone)
- **Styling** : Tailwind CSS 4 + CSS personnalisé
- **Langage** : TypeScript 6.0
- **Tests** : Vitest 4 + Jasmine
- **Outils** : Angular CLI 22, npm 11.12.1
- **État** : Angular Signals (réactivité moderne, pas de RxJS services)
- **Routage** : Angular Router avec scroll restoration

---

## 🏗️ Architecture et structure du projet

### Hiérarchie des dossiers

```
src/
├── app/
│   ├── core/                    # Services et logique métier globale
│   │   ├── guards/              # Route guards (vides pour now)
│   │   ├── interceptors/        # HTTP interceptors (vides pour now)
│   │   └── services/            # Services d'application
│   ├── features/                # Modules métier / pages
│   │   ├── home/                # Page d'accueil avec hero et grille de propriétés
│   │   ├── annonces/            # Liste complète des annonces
│   │   ├── location-vente/      # Détails et exploration
│   │   ├── maintenance/         # Services de maintenance
│   │   ├── decoration/          # Services de décoration
│   │   ├── services/            # Tous les services
│   │   ├── faq/                 # Questions fréquentes
│   │   ├── contact/             # Formulaire de contact
│   │   └── auth/                # Authentification
│   │       ├── login/           # Page de connexion
│   │       └── register/        # Page d'inscription
│   ├── layout/                  # Composants de mise en page
│   │   ├── header/              # Navigation globale
│   │   └── footer/              # Pied de page
│   ├── shared/                  # Ressources partagées
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── property-card/   # Carte d'une propriété
│   │   │   └── subscriber-modal/ # Modal d'abonnement
│   │   ├── models/              # Interfaces TypeScript
│   │   ├── pipes/               # Pipes personnalisés
│   │   └── directives/          # Directives personnalisées
│   ├── app.ts                   # Root component
│   ├── app.routes.ts            # Définition des routes
│   ├── app.config.ts            # Configuration d'application
│   └── app.html                 # Template root
├── styles.css                   # Styles globaux + Tailwind
├── main.ts                      # Bootstrap
└── index.html                   # Entrée HTML

public/                          # Assets statiques
├── assets/                      # Images
```

### Service d'architecture

L'app utilise une architecture basée sur **services et signals** :

| Service | Responsabilité |
|---------|-----------------|
| **AuthService** | Gère l'état d'abonnement via `localStorage` avec signal réactif |
| **RheodyceDataService** | Données statiques (propriétés, FAQs, services, témoignages, stats) |
| **HeaderStateService** | État du header/navigation |
| **Scroll** | Gestion du scroll et détection du scroll en cours |

### Modèles de données

#### `Property` (Propriété immobilière)

```typescript
interface Property {
  id: string;
  title: string;
  price: number;
  priceSuffix?: string;         // "/mois" pour location
  location: string;              // Ville/quartier
  address: string;               // Adresse complète
  bedrooms: number;
  bathrooms: number;
  surface: number;               // en m²
  type: 'vente' | 'location';
  category: 'maison' | 'appartement' | 'residence' | 'terrain';
  imageUrl: string;
  featured?: boolean;            // Propriété mise en avant
  verified?: boolean;            // Vérifiée par Rheodyce
  description: string;
}
```

#### Autres modèles clés

- **ServiceOffer** : Décrit un service (vérification, maintenance, décoration, etc.)
- **FaqItem** : Question + Réponse
- **Testimonial** : Avis client (nom, rôle, citation)
- **StatItem** : Statistique (valeur + label)
- **ProcessStep** : Étape du processus (rechercher → comparer → sécuriser)

---

## 📏 Conventions et règles de code

### Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers | kebab-case | `property-card.ts`, `header.ts` |
| Classes/Interfaces | PascalCase | `PropertyCard`, `Property`, `AuthService` |
| Variables/Fonctions | camelCase | `isSubscriber`, `showModal`, `onViewDetails()` |
| Types unions | kebab-case | `type PropertyType = 'vente' \| 'location'` |
| Composants | PascalCase | export class `Home`, `Header`, `PropertyCard` |
| Signals | camelCase | `readonly showModal = signal(false)` |
| Computed | camelCase | `readonly filtered = computed(...)` |

### Patterns Angular

#### 1. Composants standalone

**Tous les composants sont standalone** (pas de NgModules) :

```typescript
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',  // Optional, style scoped
})
export class Hero {
  // ...
}
```

#### 2. Injection de dépendances

Utiliser **`inject()`** pour les services :

```typescript
export class Home {
  private readonly auth = inject(AuthService);
  protected readonly data = inject(RheodyceDataService);
}
```

**Jamais** de constructor params sauf cas spécifique.

#### 3. Signals pour la réactivité

- **State local** : `signal(initialValue)`
- **State calculé** : `computed(() => dependsOn())`
- **Lire une valeur** : `signal()` (fonction)
- **Changer une valeur** : `.set(newValue)` ou `.update(v => v + 1)`

```typescript
readonly isSubscriber = computed(() => this.auth.isSubscriber());
readonly showModal = signal(false);

protected onAction() {
  this.showModal.set(true);
}
```

#### 4. Inputs et Outputs (signal-based)

```typescript
// Input (reçoit une valeur parent)
readonly property = input.required<Property>();
readonly count = input(0);  // avec défaut

// Output (émet vers parent)
readonly viewDetails = output<Property>();

protected onViewDetails() {
  this.viewDetails.emit(this.property());
}
```

#### 5. Accès aux templates

- `protected` pour les propriétés accessibles en template
- `private` pour la logique interne
- Les computed et signals sont lus en template par `property()`

```typescript
protected readonly filtered = computed(() => 
  this.data.properties.filter(...)
);

// Template: {{ filtered().length }}
```

### Styling

#### Tailwind CSS

- **Approche utility-first** : classes Tailwind pour la plupart du styling
- **Classe personnalisée** : seulement si Tailwind ne suffit pas

```html
<div class="flex gap-4 rounded-[1rem] bg-rheo-surface p-4 shadow">
  <h2 class="text-lg font-bold text-rheo-dark">Titre</h2>
</div>
```

#### Couleurs du thème personnalisé

Définies dans `src/styles.css` (CSS custom properties) :

```css
--color-rheo-bg: #f5f7f4;           /* Fond principal */
--color-rheo-surface: #ffffff;       /* Cartes/surfaces */
--color-rheo-accent: #c5e84a;        /* CTA, highlights */
--color-rheo-accent-hover: #b5d83a;  /* Hover */
--color-rheo-dark: #1a1a1a;          /* Texte principal */
--color-rheo-muted: #6b7280;         /* Texte secondaire */
--color-rheo-border: #e8ebe6;        /* Bordures */
--color-rheo-glass: rgb(255 255 255 / 0.72);  /* Glass-morphism */

--radius-rheo-sm: 1rem;
--radius-rheo: 1.5rem;
--radius-rheo-lg: 2rem;
```

Utilisation en Tailwind : `bg-rheo-accent`, `text-rheo-dark`, `rounded-rheo`

#### CSS scoped par composant

Chaque composant peut avoir un `.css` au même niveau du `.ts` :

```typescript
@Component({
  ...
  styleUrl: './home.css',
})
```

Applique automatiquement le scoping Angular.

### Conventions TypeScript

#### Imports

```typescript
// 1. Angular core
import { Component, signal, inject, computed } from '@angular/core';

// 2. Angular features
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// 3. Services locaux
import { AuthService } from '../../core/services/auth.service';

// 4. Modèles et types
import { Property } from '../../shared/models/property.model';

// 5. Composants locaux
import { PropertyCard } from '../../shared/components/property-card/property-card';
```

#### Typage strict

- **Toujours typer** les paramètres et retours de fonction
- **Interfaces publiques** en PascalCase dans `models/`
- **Types internes** en minuscule avec type prefix

```typescript
// Public
export interface Property { ... }

// Local au composant
interface NavLink {
  path: string;
  label: string;
}
```

#### Null/undefined handling

- Utiliser l'**optional chaining** : `property?.bedrooms`
- **Nullish coalescing** : `value ?? defaultValue`
- **Logical AND** pour le rendu conditionnel : `isActive() && <render>`

### Gestion des propriétés

#### RheodyceDataService

Contient **6 propriétés de test** avec données réalistes :

- 3 propriétés à la **vente** (villa, résidence, terrain)
- 3 propriétés en **location** (appartement, studio, maison)

**À faire après MVP** :
- Migrer vers une API backend (Supabase ou autre)
- Remplacer `RheodyceDataService` par des appels HTTP

**Pour maintenant** : modifier `rheodyce-data.service.ts` pour mettre à jour les données de test.

---

## 🔄 Flux de travail et processus

### Démarrage

```bash
npm install
ng serve              # Lance sur http://localhost:4200
ng build              # Production build
ng test               # Tests Vitest
```

### Organisation des commits

Voir `git log` : les commits suivent un pattern de refactorisation (design → structure) :

```
8892597 refactor contact service
2be019f refactor home design
cabe202 refactor site design
71a4282 refactor product card design
32590ae refactor hero design
39d99b8 create herosection
4ca85a7 first commit
```

**Pattern recommandé** :
- `feature: <description>` — nouvelle fonctionnalité
- `refactor: <description>` — restructuration sans changement UX
- `fix: <description>` — correction de bug
- `docs: <description>` — documentation uniquement

### Comment ajouter une fonctionnalité

#### 1. Page / Route nouvelle

```bash
ng generate component features/my-feature/my-feature
```

**Template minimal** :

```typescript
@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-feature.html',
})
export class MyFeature {
  // état et logique
}
```

Ajouter la route dans `app.routes.ts`.

#### 2. Composant partagé

```bash
ng generate component shared/components/my-component
```

- Doit être **réutilisable** (au moins 2 usages)
- Accepter inputs/outputs
- Sans dépendances métier

#### 3. Service

```bash
ng generate service core/services/my-service
```

- Inject-only (pas d'export d'instance)
- Responsabilité unique
- Retourner des Signals pour la réactivité

### Tester localement

#### Unit tests

```bash
ng test
# Crée des fichiers .spec.ts
```

Ajouter un `.spec.ts` pour chaque composant/service :

```typescript
describe('PropertyCard', () => {
  it('should display property title', () => {
    // test
  });
});
```

#### E2E / Manuel

Lancer `ng serve`, naviguer dans l'app, tester les flows :
- Clic sur une annonce → affiche modal d'abonnement (si non-abonné)
- Abonnement → cache la modal, accès aux détails
- Navigation → scroll en haut, header s'ajuste

### Avant de faire un PR

- [ ] Code compilé sans erreur : `ng build`
- [ ] Tests passent : `ng test`
- [ ] Linting via Prettier : `npx prettier --write .`
- [ ] Commits organisés et clairs
- [ ] Changements testés manuellement

---

## 📝 Spécificités du projet

### Système d'abonnement (Subscriber)

**Logique** :
- État stocké en localStorage clé `rheodyce:isSubscriber`
- Service `AuthService` expose un signal réactif `isSubscriber`
- Composants qui ont besoin du statut injectent `AuthService`

**Exemple de gate** (dans Home) :

```typescript
protected onViewDetails(property: Property): void {
  if (this.isSubscriber()) {
    return; // Accès direct si abonné
  }
  this.showSubscriberModal.set(true); // Modal sinon
}
```

### Propriétés affichées

- **Home** : 16 propriétés calculées (cycles à travers les 6 de base)
- **Autres pages** : utilisent les données brutes de `RheodyceDataService`

### Scroll et Header

- `Scroll` service détecte si l'utilisateur a scrollé
- Header change d'apparence en bas de page (class `is-scrolled`)
- Routes d'accueil affichent le hero, autres non

```typescript
constructor() {
  this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event) => {
      this.showChrome = !this.isAuthRoute(event.urlAfterRedirects);
    });
}
```

### Assets et images

- Toutes les images sont actuellement des placeholders : `/assets/hero_img.png`
- **À faire** : remplacer par des vraies images immobilières

### Routes cachées (pas de header/footer)

- `/connexion` (login)
- `/inscription` (register)

Détecté par `isAuthRoute()` dans `App` component.

---

## 🚫 Pièges courants à éviter

### ❌ Ne pas faire

1. **Importer RxJS directement** sauf si absolument nécessaire
   - Utiliser Signals à la place
   - Pattern réactif avec `computed()` + `signal()`

2. **Créer des NgModules**
   - Tous les composants sont standalone
   - Importer directement dans `imports: [...]`

3. **Oublier de typer**
   - Chaque signal, input, fonction DOIT avoir un type
   - TypeScript strict est configuré

4. **Modifier les données statiques directement**
   - `RheodyceDataService` est en lecture seule
   - Pour les données dynamiques, créer un nouveau service

5. **Faire du styling inline**
   - Utiliser Tailwind classes
   - Si personnalisé, ajouter une classe dans le `.css` scoped

6. **Oublier `protected` pour les templates**
   - Propriétés privées ne sont pas accessibles en template
   - Mettre `protected` pour que Angular compile

7. **Créer des dépendances circulaires**
   - Services → Models (OK)
   - Models → Services (❌)

### ⚠️ Attention

- **localStorage** : non disponible en SSR (futur)
- **Images absolues** : changer le path si assets bougent
- **Tailwind classes dynamiques** : préférer des variables CSS
- **Langues** : actuellement français uniquement (pas de i18n)

---

## 🔗 Points de contact métier

### Données métier

- **Villes couvertes** : Kinshasa, Lubumbashi, Goma, Matadi
- **Langues** : Français (seule)
- **Devises** : USD pour les prix (pas de symbole actuellement)
- **Types de propriétés** : maison, appartement, résidence, terrain
- **Types de transactions** : vente, location
- **Services** : vérification, location/vente, maintenance, décoration, juridique

### Contact et support

- Email de contact : voir `contact/` page
- FAQ : données statiques dans `RheodyceDataService`
- Formulaire : actuellement sans backend (à implémenter)

---

## 📊 État du projet

### ✅ Complété

- [x] Structure Angular 22 standalone
- [x] Routing avec 10 routes
- [x] Styling Tailwind + custom theme
- [x] Service de données statiques
- [x] Composants réutilisables (cards, modal)
- [x] Système d'abonnement localStorage
- [x] Tests basiques (15 fichiers .spec.ts)

### 🚧 En construction / À faire

- [ ] Connexion API backend (actuellement mock data)
- [ ] Pages de détails propriété (page individuelle)
- [ ] Intégration formulaire contact → backend
- [ ] i18n (internationalization) pour autres langues
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Authentification réelle (Firebase, Auth0, etc.)
- [ ] Pagination/infinite scroll
- [ ] Filtres avancés (prix, surface, etc.)

---

## 🎯 Objectifs futurs et roadmap

1. **MVP phase 2** : Connecter une vraie API
2. **Authentification** : Utilisateurs et vendeurs
3. **Messaging** : Chat entre acheteur/vendeur
4. **Paiements** : Abonnement et frais de transaction
5. **Analytics** : Suivi des vues et interactions
6. **Mobile app** : React Native ou Flutter

---

## ✋ Pour poser des questions

- Voir les fichiers `*.ts` et `*.html` pour l'implémentation exacte
- Lire les commits récents pour le contexte des refactorisations
- Vérifier les tests `.spec.ts` pour les cas d'usage attendus

**Règle d'or** : Quand en doute, regarder le code existant — le projet a des patterns clairs et prévisibles.

