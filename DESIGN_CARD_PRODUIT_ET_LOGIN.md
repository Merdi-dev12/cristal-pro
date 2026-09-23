# Design Rheodyce — carte produit et page de connexion

Ce document est une fiche de transmission autonome pour reproduire fidèlement deux interfaces existantes de Rheodyce : la carte immobilière `PropertyCard` et la page complète `LoginPage`. Il ne s'agit pas d'un redesign : les dimensions, couleurs, arrondis, états et comportements décrits ci-dessous correspondent au dépôt Angular actuel.

## Mode d'emploi rapide

1. Recréer les fichiers aux chemins indiqués, ou adapter les imports si la structure du projet cible diffère.
2. Installer les dépendances Angular, Tailwind 4 et Supabase listées plus bas.
3. Copier le thème global Rheodyce dans `src/styles.css` et activer le plugin PostCSS Tailwind.
4. Ajouter l'asset `/assets/hero_img.png`.
5. Ajouter la route `/connexion`, initialiser `AuthService`, puis masquer le header et le footer sur les routes d'authentification.
6. Ne placer aucune vraie URL ni clé Supabase dans un document partagé : utiliser les placeholders fournis et injecter les valeurs propres à l'environnement cible.

## Inventaire des fichiers nécessaires

| Fichier | Rôle |
| --- | --- |
| `src/app/shared/components/property-card/property-card.ts` | Logique et API signal-based de la carte |
| `src/app/shared/components/property-card/property-card.html` | Template visuel complet de la carte |
| `src/app/shared/models/property.model.ts` | Types de données immobilières |
| `src/app/shared/pipes/pipe.ts` | Formatage du prix en français |
| `src/app/features/auth/login/login.ts` | État et actions de la page login |
| `src/app/features/auth/login/login.html` | Mise en page responsive complète du login |
| `src/app/core/services/auth.service.ts` | Connexion email/mot de passe et Google via Supabase |
| `src/app/core/services/supabase-client.ts` | Client Supabase injectable |
| `src/environments/environment.ts` | Configuration de production, avec placeholders ici |
| `src/environments/environment.development.ts` | Configuration de développement, avec placeholders ici |
| `src/styles.css` | Tailwind 4, couleurs, rayons et police Rheodyce |
| `.postcssrc.json` | Activation de Tailwind 4 avec PostCSS |
| `src/app/app.routes.ts` | Route lazy `/connexion` |
| `src/app/app.config.ts` | Initialisation de la session d'authentification |
| `src/app/app.ts` et `src/app/app.html` | Masquage du header/footer sur les pages d'auth |
| `public/assets/hero_img.png` | Visuel immobilier plein écran de la moitié droite du login |

## Design de la carte produit

### Intention visuelle et comportement

La carte est une surface blanche compacte de `20px` de rayon, haute d'au moins `365px`, avec `8px` de marge intérieure. Elle est entièrement cliquable et accessible au clavier avec `Entrée`. L'image immobilière occupe le haut dans un cadre immersif au ratio `1.18`, arrondi à `18px`, et zoome légèrement sur le survol de la carte. Un badge blanc « Vérifié » apparaît en haut à droite lorsque `verified` vaut `true`.

La zone d'information conserve une hiérarchie nette : titre anthracite à gauche, prix doré `#c79a55` à droite, localisation discrète avec pictogramme doré, puis caractéristiques dans un sous-panneau gris-vert `rheo-bg` arrondi à `16px`. Le sous-panneau est poussé en bas avec `mt-auto`, ce qui aligne les cartes d'une même grille malgré des titres de longueurs différentes. Les terrains remplacent les informations « chambres » et « salles de bain » par « Terrain » et « Titré ».

### Composant TypeScript

Ce code va dans `src/app/shared/components/property-card/property-card.ts`.

```ts
import { Component, input, output } from '@angular/core';
import { Property } from '../../models/property.model';
import { PropertyPricePipe } from '../../pipes/pipe';

@Component({
  selector: 'app-property-card',
  imports: [PropertyPricePipe],
  templateUrl: './property-card.html',
})
export class PropertyCard {
  readonly property = input.required<Property>();
  readonly viewDetails = output<Property>();

  protected bedroomsLabel(property: Property): string {
    if (property.category === 'terrain') {
      return 'Terrain';
    }

    return `${property.bedrooms || 1} chambre${property.bedrooms > 1 ? 's' : ''}`;
  }

  protected bathroomsLabel(property: Property): string {
    if (property.category === 'terrain') {
      return 'Titré';
    }

    return `${property.bathrooms} SDB`;
  }

  protected onViewDetails(): void {
    this.viewDetails.emit(this.property());
  }
}
```

### Template complet

Ce code va dans `src/app/shared/components/property-card/property-card.html`.

```html
<article
  class="group flex h-full min-h-[365px] cursor-pointer flex-col overflow-hidden rounded-[20px] bg-white p-2 transition-colors duration-300"
  (click)="onViewDetails()"
  (keydown.enter)="onViewDetails()"
  tabindex="0"
  role="button"
  [attr.aria-label]="'Voir ' + property().title"
>
  <div class="relative aspect-[1.18] shrink-0 overflow-hidden rounded-[18px] bg-rheo-bg">
    <img
      [src]="property().imageUrl"
      [alt]="property().title"
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    @if (property().verified) {
      <span class="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-rheo-dark">
        Vérifié
      </span>
    }
  </div>

  <div class="flex flex-1 flex-col pt-4">
    <div class="flex items-start justify-between gap-3">
      <h3 class="min-w-0 text-[15px] font-bold leading-snug text-rheo-dark">{{ property().title }}</h3>
      <p class="shrink-0 whitespace-nowrap text-sm font-bold text-[#c79a55]">
        {{ property().price | propertyPrice: property().priceSuffix }}
      </p>
    </div>

    <p class="mt-2 flex items-center gap-1.5 text-xs text-rheo-muted">
      <svg class="h-3.5 w-3.5 text-[#c79a55]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" stroke-width="1.8" />
        <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="1.8" />
      </svg>
      {{ property().location }}
    </p>

    <div class="mt-auto pt-5">
      <div class="rounded-[16px] bg-rheo-bg px-3 py-3">
        <div class="flex flex-wrap items-center gap-3 text-xs text-rheo-muted">
          <span class="flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-[#c79a55]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 11h16v8H4v-8Zm2-5h12a2 2 0 0 1 2 2v3H4V8a2 2 0 0 1 2-2Zm1 8h4m2 0h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ bedroomsLabel(property()) }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-[#c79a55]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 10h13v3a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5v-3Zm0 0V6a2 2 0 0 1 2-2h1m3 14v2m5-2 1.5 2M8 18 6.5 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ bathroomsLabel(property()) }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-[#c79a55]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4H4v4m0 8v4h4m8 0h4v-4m0-8V4h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ property().surface }} m²
          </span>
        </div>
      </div>
    </div>
  </div>
</article>
```

### Modèle `Property`

Ce code va dans `src/app/shared/models/property.model.ts`.

```ts
export type PropertyType = 'vente' | 'location';
export type PropertyCategory = 'maison' | 'appartement' | 'residence' | 'immeuble' | 'terrain';

export interface Property {
  id: string;
  title: string;
  price: number;
  priceSuffix?: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string;
  photos?: string[];
  featured?: boolean;
  verified?: boolean;
  description: string;
  latitude?: number;
  longitude?: number;
}
```

### Pipe de prix

Ce code va dans `src/app/shared/pipes/pipe.ts`. La classe `CategoryLabelPipe` est conservée car elle partage actuellement ce fichier avec `PropertyPricePipe`.

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'propertyPrice',
  standalone: true,
})
export class PropertyPricePipe implements PipeTransform {
  transform(value: number, suffix = ''): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);

    return suffix ? `${formatted} $ ${suffix}` : `${formatted} $`;
  }
}

@Pipe({
  name: 'categoryLabel',
  standalone: true,
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string): string {
    const labels: Record<string, string> = {
      appartement: 'Appartement',
      maison: 'Maison',
      residence: 'Résidence',
      immeuble: 'Immeuble',
      terrain: 'Terrain',
    };

    return labels[value] ?? value;
  }
}
```

### Exemple d'utilisation dans un parent

Le parent doit importer `PropertyCard`, fournir une propriété conforme au modèle et décider quoi faire lorsque la carte émet `viewDetails`. La carte ne contient ni navigation ni modal en propre.

Ce code d'exemple va dans le fichier TypeScript du composant parent, par exemple `src/app/features/annonces/annonces.ts`.

```ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { Property } from '../../shared/models/property.model';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [PropertyCard],
  templateUrl: './annonces.html',
})
export class AnnoncesPage {
  private readonly router = inject(Router);

  protected readonly properties: Property[] = [
    {
      id: 'villa-gombe-001',
      title: 'Villa contemporaine avec jardin',
      price: 420000,
      location: 'Gombe, Kinshasa',
      address: 'Avenue de la Justice, Gombe',
      bedrooms: 4,
      bathrooms: 3,
      surface: 320,
      type: 'vente',
      category: 'maison',
      imageUrl: '/assets/hero_img.png',
      featured: true,
      verified: true,
      description: 'Villa lumineuse avec jardin, terrasse et espaces de réception.',
    },
  ];

  protected async onViewDetails(property: Property): Promise<void> {
    await this.router.navigate(['/annonces', property.id]);
  }
}
```

Ce code de grille va dans le template du parent, par exemple `src/app/features/annonces/annonces.html`. Il reprend exactement les points de rupture utilisés par Rheodyce : une colonne sur mobile, deux dès `sm`, quatre dès `lg`.

```html
<div class="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
  @for (property of properties; track property.id) {
    <app-property-card
      [property]="property"
      (viewDetails)="onViewDetails($event)"
    />
  }
</div>
```

### Dépendances de la carte

- Angular `@angular/core` avec composants standalone et API `input()` / `output()`.
- Tailwind CSS 4 et le thème `rheo-*` défini plus bas.
- `PropertyPricePipe` importé directement dans le composant.
- Une image valide par propriété via `imageUrl`.
- Un parent responsable de la navigation, du contrôle d'abonnement ou de l'ouverture d'une modal.

## Page login complète

### Intention visuelle, responsive et états

La page occupe au minimum tout le viewport (`min-h-screen`) sur fond blanc. Sur mobile et tablette, seule la colonne de formulaire est visible, avec `32px` de padding horizontal puis `48px` dès `sm`; le formulaire est centré et limité à `max-w-sm`. À partir de `lg`, l'écran devient un split-screen `50/50` : formulaire à gauche avec un padding plus généreux, image immobilière plein cadre à droite.

La colonne gauche combine une navigation « Retour », une signature de marque en capitales espacées, un titre de `28px`, des champs à labels flottants et des boutons de rayon `12px`. Le CTA principal emploie le vert acide Rheodyce et affiche un spinner pendant la connexion. Les erreurs apparaissent dans un panneau rouge doux et teintent les bordures et textes des champs. Le mot de passe peut être affiché ou masqué.

La moitié droite est volontairement immersive : photographie légèrement agrandie, superposition sombre avec halo vert, capsule glassmorphism « RHEODYCE », puis panneau glassmorphism bas contenant la promesse et trois statistiques. Cette moitié est masquée sous `lg`, ce qui protège la lisibilité et évite de comprimer le formulaire.

### Composant TypeScript complet

Ce code va dans `src/app/features/auth/login/login.ts`.

```ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onLogin(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.signIn(this.email, this.password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
      await this.router.navigateByUrl(redirect.startsWith('/') ? redirect : '/');
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      this.error.set(
        message.includes('email not confirmed')
          ? 'Confirmez votre adresse email (lien envoyé lors de votre inscription) avant de vous connecter.'
          : 'Adresse email ou mot de passe incorrect.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected async onGoogleSignIn(): Promise<void> {
    try {
      await this.auth.signInWithGoogle();
    } catch {
      this.error.set('Connexion Google impossible. Réessayez.');
    }
  }
}
```

### Template HTML complet

Ce code va dans `src/app/features/auth/login/login.html`.

```html
<section class="flex min-h-screen bg-white">
  <div class="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
    <div class="mx-auto w-full max-w-sm">
      <a routerLink="/" class="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-rheo-muted transition-colors hover:text-rheo-dark">
        <svg class="h-4 w-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Retour</span>
      </a>

      <div class="mb-8">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-rheo-muted">RHEODYCE</p>
        <h1 class="mb-1.5 text-[28px] font-semibold leading-tight tracking-tight text-rheo-dark">Content de vous revoir</h1>
        <p class="text-sm text-rheo-muted">Connectez-vous pour accéder à vos services</p>
      </div>

      @if (error()) {
        <div class="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      <form class="space-y-5" (ngSubmit)="onLogin()">
        <div class="relative">
          <input id="email" type="email" placeholder=" " class="peer w-full rounded-xl border border-[#cfd6cc] bg-transparent px-4 py-3.5 text-sm text-rheo-dark transition-all outline-none hover:border-[#aeb8aa] focus:border-rheo-dark disabled:opacity-50" [class.border-red-500]="error()" [class.text-red-700]="error()" [(ngModel)]="email" name="email" />
          <label for="email" class="pointer-events-none absolute left-3.5 top-1/2 origin-left -translate-y-1/2 bg-white px-1 text-sm text-rheo-muted transition-all duration-200 peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-rheo-dark peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-rheo-dark">Adresse Email</label>
        </div>

        <div>
          <div class="relative">
            <input id="password" [type]="showPassword() ? 'text' : 'password'" placeholder=" " class="peer w-full rounded-xl border border-[#cfd6cc] bg-transparent px-4 py-3.5 pr-11 text-sm text-rheo-dark transition-all outline-none hover:border-[#aeb8aa] focus:border-rheo-dark disabled:opacity-50" [class.border-red-500]="error()" [class.text-red-700]="error()" [(ngModel)]="password" name="password" />
            <label for="password" class="pointer-events-none absolute left-3.5 top-1/2 origin-left -translate-y-1/2 bg-white px-1 text-sm text-rheo-muted transition-all duration-200 peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-rheo-dark peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-rheo-dark">Mot de passe</label>
            <button type="button" (click)="togglePassword()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-rheo-muted transition-colors hover:text-rheo-dark" [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
              @if (showPassword()) {
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 4.2A10.4 10.4 0 0 1 12 4c5 0 8.7 4.1 10 8-.4 1.2-1.2 2.5-2.2 3.6M6.3 6.3C4.2 7.7 2.8 10 2 12c1.3 3.9 5 8 10 8 1.8 0 3.4-.5 4.8-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              } @else {
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" /></svg>
              }
            </button>
          </div>
          <div class="mt-2 flex items-center justify-end">
            <button type="button" class="text-xs text-rheo-dark transition-opacity hover:opacity-70">Mot de passe oublié ?</button>
          </div>
        </div>

        <button type="submit" [disabled]="loading()" class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-rheo-accent py-3.5 text-sm font-bold text-rheo-dark transition-colors hover:bg-rheo-accent-hover disabled:opacity-60">
          @if (loading()) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-rheo-dark/25 border-t-rheo-dark"></span>
          } @else {
            <span>Connexion</span>
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          }
        </button>

        <p class="text-center text-[11px] leading-5 text-rheo-muted">
          En créant un compte, vous acceptez nos <span class="cursor-pointer text-rheo-dark">Conditions d'utilisation</span> et notre <span class="cursor-pointer text-rheo-dark">Politique de confidentialité</span>.
        </p>
      </form>

      <div class="my-6 flex items-center gap-3"><div class="h-px flex-1 bg-rheo-border"></div><span class="text-xs text-rheo-muted">ou</span><div class="h-px flex-1 bg-rheo-border"></div></div>

      <button type="button" (click)="onGoogleSignIn()" class="flex min-h-11 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[#cfd6cc] bg-white/70 text-sm font-semibold text-rheo-dark transition-colors hover:bg-rheo-bg">
        <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.94l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
        Continuer avec Google
      </button>

      <p class="mt-4 text-center text-sm text-rheo-muted">Pas encore de compte ? <a routerLink="/inscription" class="font-semibold text-rheo-dark transition-opacity hover:opacity-80">Créer un compte</a></p>
    </div>
  </div>

  <div class="relative hidden overflow-hidden bg-black lg:block lg:w-1/2">
    <img src="/assets/hero_img.png" alt="" class="absolute inset-0 h-full w-full scale-105 object-cover opacity-90" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(197,232,74,0.22),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.62),rgba(0,0,0,0.05)_48%,rgba(0,0,0,0.38))]"></div>
    <div class="absolute left-10 top-10 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md">RHEODYCE</div>
    <div class="absolute bottom-10 left-10 right-10 rounded-[28px] border border-white/15 bg-white/12 p-6 text-white backdrop-blur-md">
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Accès sécurisé</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight">Des biens vérifiés, des contacts protégés.</h2>
      <div class="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div><p class="text-2xl font-semibold">500+</p><p class="text-white/60">biens</p></div>
        <div><p class="text-2xl font-semibold">100%</p><p class="text-white/60">contrôlés</p></div>
        <div><p class="text-2xl font-semibold">24h</p><p class="text-white/60">suivi</p></div>
      </div>
    </div>
  </div>
</section>
```

### Service d'authentification indispensable

Le login consomme uniquement `signIn()` et `signInWithGoogle()`, mais le service complet ci-dessous conserve l'initialisation de session et le profil attendus par le reste de Rheodyce.

Ce code va dans `src/app/core/services/auth.service.ts`.

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

interface AuthProfile {
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  is_subscriber?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;

  readonly session = signal<Session | null>(null);
  readonly profile = signal<AuthProfile | null>(null);
  readonly isAuthenticated = computed(() => Boolean(this.session()?.access_token));
  readonly hasSession = this.isAuthenticated;
  readonly isAdmin = computed(
    () =>
      this.session()?.user.app_metadata?.['role'] === 'admin' || this.profile()?.role === 'admin',
  );
  readonly isSubscriber = computed(() => this.profile()?.is_subscriber === true);

  async init(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      this.setSession(data.session);
      await this.loadProfile(data.session.user.id);
    }

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.setSession(session);
      if (session) void this.loadProfile(session.user.id);
    });
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  accessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  userEmail(): string {
    return this.session()?.user.email ?? '';
  }

  userId(): string {
    return this.session()?.user.id ?? '';
  }

  async signIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    this.setSession(data.session);
    await this.loadProfile(data.user.id);
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.session || !data.user) return { needsConfirmation: true };
    this.setSession(data.session);
    await this.loadProfile(data.user.id);
    return { needsConfirmation: false };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.profile.set(null);
    this.setSession(null);
  }

  async updateProfile(fullName: string, phone: string): Promise<void> {
    const userId = this.userId();
    if (!userId) throw new Error('Session utilisateur introuvable.');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const { error } = await this.supabase
      .from('profiles')
      .update({
        full_name: cleanName,
        phone: cleanPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    const { error: authError } = await this.supabase.auth.updateUser({
      data: { full_name: cleanName },
    });
    if (authError) throw authError;

    this.profile.update((profile) => ({
      ...(profile ?? {}),
      full_name: cleanName,
      phone: cleanPhone,
    }));
  }

  private setSession(session: Session | null): void {
    const previousUserId = this.session()?.user.id;
    const nextUserId = session?.user.id;
    this.session.set(session);
    if (!session || previousUserId !== nextUserId) this.profile.set(null);
  }

  private async loadProfile(userId: string): Promise<void> {
    this.profile.set(null);
    const { data } = await this.supabase
      .from('profiles')
      .select('email, full_name, phone, role, is_subscriber')
      .eq('id', userId)
      .maybeSingle();

    if (!data || this.session()?.user.id !== userId) return;
    this.profile.set(data as AuthProfile);
  }
}
```

Ce code va dans `src/app/core/services/supabase-client.ts`.

```ts
import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );
}
```

Ce code va dans `src/environments/environment.ts`. Remplacer les placeholders uniquement dans l'environnement réel de déploiement ; ne jamais transmettre de clé privée Supabase (`service_role`) au frontend.

```ts
export const environment = {
  production: true,
  supabaseUrl: 'https://VOTRE-PROJET.supabase.co',
  supabaseAnonKey: 'VOTRE_CLE_SUPABASE_ANON_OU_PUBLISHABLE',
};
```

Ce code va dans `src/environments/environment.development.ts`.

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://VOTRE-PROJET.supabase.co',
  supabaseAnonKey: 'VOTRE_CLE_SUPABASE_ANON_OU_PUBLISHABLE',
};
```

### Route et initialisation

Ce bloc va dans le tableau `routes` de `src/app/app.routes.ts`.

```ts
{
  path: 'connexion',
  loadComponent: () => import('./features/auth/login/login').then((module) => module.LoginPage),
  title: 'Connexion — RHEODYCE',
},
```

Ce bloc va dans `providers` de `src/app/app.config.ts`, avec les imports correspondants. Il restaure la session Supabase au démarrage.

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from './core/services/auth.service';

provideAppInitializer(() => inject(AuthService).init()),
AuthService,
```

### Masquage du header et du footer

La page login est un écran autonome. Le chrome global est donc masqué sur `/connexion` et `/inscription`. Le dépôt masque aussi les routes d'administration.

Ce code va dans `src/app/app.ts`.

```ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
})
export class App {
  showChrome = true;

  constructor(private readonly router: Router) {
    this.showChrome = !this.isChromeHiddenRoute(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showChrome = !this.isChromeHiddenRoute(event.urlAfterRedirects);
      });
  }

  private isChromeHiddenRoute(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/connexion' || path === '/inscription' || path === '/admin' || path.startsWith('/admin/');
  }
}
```

Ce code va dans `src/app/app.html`.

```html
<app-header *ngIf="showChrome"></app-header>

<main class="w-full">
  <router-outlet></router-outlet>
</main>

<app-footer *ngIf="showChrome"></app-footer>
```

### Asset requis

Le fichier image va dans `public/assets/hero_img.png` afin d'être servi sous l'URL `/assets/hero_img.png`. Choisir une photographie immobilière premium, suffisamment grande pour couvrir une demi-fenêtre en plein écran, avec un sujet lisible sous l'overlay sombre. Garder le même chemin si le template est copié tel quel.

## Styles globaux et configuration

Le bloc suivant est le minimum complet utile aux classes des deux interfaces. Le dépôt contient d'autres styles globaux liés aux listes natives, scrollbars et cartes Leaflet ; ils ne sont pas nécessaires à la carte produit ni au login.

Ce code va dans `src/styles.css`.

```css
/* L'import Google Fonts est volontairement désactivé dans le dépôt pour préserver les builds hors ligne. */
/* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); */
@import 'tailwindcss';

@theme {
  --color-rheo-bg: #f5f7f4;
  --color-rheo-surface: #ffffff;
  --color-rheo-accent: #c5e84a;
  --color-rheo-accent-hover: #b5d83a;
  --color-rheo-dark: #1a1a1a;
  --color-rheo-muted: #6b7280;
  --color-rheo-border: #e8ebe6;
  --color-rheo-glass: rgb(255 255 255 / 0.72);

  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;

  --radius-rheo-sm: 1rem;
  --radius-rheo: 1.5rem;
  --radius-rheo-lg: 2rem;
  --radius-rheo-xl: 2.5rem;
  --radius-rheo-2xl: 3rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--color-rheo-bg);
  color: var(--color-rheo-dark);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Ce code va dans `.postcssrc.json`.

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Ce bloc de dépendances va dans `package.json` si le projet cible ne possède pas déjà les paquets correspondants. Respecter les versions compatibles du projet cible ; les versions ci-dessous sont celles de Rheodyce au moment de cette documentation.

```json
{
  "dependencies": {
    "@angular/common": "^22.0.0",
    "@angular/compiler": "^22.0.0",
    "@angular/core": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "@angular/router": "^22.0.0",
    "@supabase/supabase-js": "^2.110.7",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular/build": "^22.0.0",
    "@angular/cli": "^22.0.0",
    "@angular/compiler-cli": "^22.0.0",
    "@tailwindcss/postcss": "^4.1.12",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.12",
    "typescript": "~6.0.2"
  }
}
```

## Prompt prêt à donner à une IA

Copier le texte ci-dessous dans une nouvelle conversation et joindre ce document ou les fichiers concernés.

> Intègre dans mon projet Angular la carte immobilière `PropertyCard` et la page complète `LoginPage` documentées dans ce fichier. Reproduis fidèlement le design et les templates, sans redesign ni simplification visuelle. Travaille avec des composants standalone, `inject()` pour l'injection, les Signals Angular pour l'état local, des inputs/outputs signal-based, un typage TypeScript strict et Tailwind CSS 4 avec le thème `rheo-*` fourni. Respecte la structure existante du projet, réutilise les services et modèles présents, et ne crée aucun NgModule. La carte doit rester accessible au clavier, émettre `viewDetails` vers son parent et fonctionner dans la grille responsive 1/2/4 colonnes. Le login doit conserver ses labels flottants, ses états erreur/chargement, le bouton Google, le split-screen responsive et la redirection sécurisée via le paramètre `redirect`. Configure la route `/connexion`, l'initialisation de `AuthService` et le masquage du header/footer sur les pages d'authentification. N'écrase pas les changements existants et ne modifie rien hors du périmètre nécessaire. N'insère jamais de vraie clé ou URL Supabase : garde des placeholders dans le code livré et indique-moi où renseigner mes propres variables d'environnement. Avant de terminer, lance une compilation ciblée et signale clairement tout point restant.

## Points d'attention

- Le bouton « Mot de passe oublié ? » est actuellement purement visuel : il est de type `button`, sans gestionnaire de clic ni route.
- Les textes « Conditions d'utilisation » et « Politique de confidentialité » sont des `span` avec apparence cliquable, mais ne pointent vers aucune page.
- Les valeurs Supabase de ce document sont volontairement des placeholders. Seule une clé frontend anonyme/publishable doit être utilisée côté navigateur ; ne jamais exposer une clé `service_role`.
- Le clic sur une `PropertyCard` ne navigue pas tout seul : le composant émet `viewDetails` et le parent choisit la navigation, l'ouverture d'une modal ou un contrôle d'abonnement.
- `FormsModule` est indispensable au login car le formulaire utilise `[(ngModel)]` et `(ngSubmit)`.
- Le `placeholder=" "` avec un espace est intentionnel : il permet aux variantes Tailwind `peer-[:not(:placeholder-shown)]` de faire flotter les labels quand une valeur est saisie.
- Le formulaire désactive le bouton de soumission pendant `loading()`, mais les champs ne sont pas désactivés dans le template actuel ; conserver ce comportement pour une copie fidèle.
- Le bouton Google suppose que le provider Google et les URL de redirection sont configurés dans Supabase.
- La colonne image du login n'a pas besoin de texte alternatif, car l'image est décorative et l'information utile est répétée dans le panneau de contenu.
- La police Inter retombe sur la pile système lorsque l'import distant reste commenté, comme dans le dépôt actuel.
