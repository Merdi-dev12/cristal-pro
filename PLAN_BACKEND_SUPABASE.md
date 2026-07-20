# 🗄️ Plan Backend — Connexion Rheodyce ↔ Supabase (`rheodyce-db`)

> **Statut : PLAN UNIQUEMENT — aucune exécution tant que le Go n'est pas donné.**
> Ce document est le plan technique détaillé et complet pour rendre le site **entièrement opérationnel** depuis un vrai backend Supabase : tables, RLS, Edge Functions, données fictives, et adaptation du frontend Angular.

---

## 0. État des lieux vérifié

**Projet Supabase cible :** `rheodyce-db` — `project_id: pjbgqnkmffrmdlkokbmo` — https://pjbgqnkmffrmdlkokbmo.supabase.co

**Contenu actuel (vérifié) :**
- Schéma `public` : **1 seule table** → `properties` (17 colonnes, **0 ligne**, **RLS désactivé** ⚠️)
- Aucune autre table, aucune Edge Function, aucune migration historisée
- Projet 100% dédié à Rheodyce (aucun risque de collision avec Bicount — projet différent, `yudjgfypbsahpukruqta`)

**Frontend actuel (vérifié) :**
- 100% données statiques via `RheodyceDataService` (`properties`, `stats`, `services`, `process`, `faqs`, `testimonials`)
- `AuthService` : abonnement géré uniquement en `localStorage` (`rheodyce:isSubscriber`), pas d'auth réelle
- Aucune dépendance Supabase installée, aucun fichier `.env`/`environment.ts`
- Formulaire de contact (`/contact`) sans backend
- Feature `ServiceRequest` (voir `PLAN_SERVICE_REQUESTS.md`) prévue mais pas encore backée par une vraie table

**Conséquence :** on part d'une base vierge → liberté totale sur le schéma, pas de dette technique à gérer.

---

## 1. Principe directeur : ne rien casser côté frontend

Les services Angular existants (`RheodyceDataService`, `AuthService`) exposent une **API publique stable** (signals `properties`, `stats`, `services`, `process`, `faqs`, `testimonials`, `isSubscriber`, méthode `setSubscriber()`). 

**Règle du plan : on ne change QUE la source de données à l'intérieur de ces services** (statique → Supabase). Les composants (`Home`, `ServicesPage`, `FaqPage`, etc.) ne seront **quasiment pas modifiés** — ils consomment déjà les signals via `inject()` et ne savent pas d'où viennent les données.

Ça respecte directement `agents.md` (conventions du projet) et évite une refonte inutile.

---

## 2. Schéma complet des tables (9 tables)

Toutes les tables vivent dans `public` (projet dédié, pas besoin de schéma séparé).

| # | Table | Rôle | Remplace |
|---|-------|------|----------|
| 1 | `profiles` | Profil utilisateur lié à `auth.users` (rôle, abonnement) | `AuthService` localStorage |
| 2 | `properties` | Annonces immobilières (déjà créée, à compléter) | `RheodyceDataService.properties` |
| 3 | `service_offers` | Catalogue de services (maintenance, décoration...) | `RheodyceDataService.services` |
| 4 | `service_requests` | Demandes de services des clients | Feature `PLAN_SERVICE_REQUESTS.md` |
| 5 | `faqs` | Questions fréquentes | `RheodyceDataService.faqs` |
| 6 | `testimonials` | Témoignages clients | `RheodyceDataService.testimonials` |
| 7 | `stats` | Statistiques page d'accueil | `RheodyceDataService.stats` |
| 8 | `process_steps` | Étapes du parcours (rechercher/comparer/sécuriser) | `RheodyceDataService.process` |
| 9 | `contact_messages` | Messages du formulaire de contact | Page `/contact` (sans backend actuellement) |

**Volontairement exclu du MVP** (non présent dans le frontend actuel, pour ne pas sur-ingénierer) :
- `property_images` (galerie multi-images) — la carte propriété n'affiche qu'une seule image aujourd'hui
- `favorites` (propriétés sauvegardées) — aucune UI existante pour ça

---

### 2.1 `profiles`

Étend `auth.users` (1-1). C'est la vraie remplaçante du `localStorage` d'`AuthService`.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  is_subscriber boolean not null default false,
  subscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Trigger de création automatique** (standard Supabase — dès qu'un utilisateur s'inscrit via `auth.signUp`, sa ligne `profiles` est créée automatiquement) :

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Fonction utilitaire `is_admin()`** (utilisée par toutes les policies admin, `security definer` pour éviter la récursion RLS) :

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

**RLS `profiles`** :

```sql
alter table public.profiles enable row level security;

-- Chacun voit son propre profil, l'admin voit tout
create policy profiles_select_own_or_admin
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Chacun modifie son propre profil, MAIS ne peut pas s'auto-promouvoir admin
create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'client');

-- L'admin peut tout modifier (y compris promouvoir un rôle)
create policy profiles_update_admin
  on public.profiles for update
  using (public.is_admin());

-- Pas de policy INSERT publique : la création passe uniquement par le trigger (security definer)
-- Pas de policy DELETE : suppression du profil gérée par cascade depuis auth.users
```

---

### 2.2 `properties` (déjà créée — à compléter)

**Ajouts nécessaires** (via `ALTER TABLE`, sans perte de données car table vide) :

```sql
alter table public.properties
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  add column if not exists owner_id uuid references public.profiles(id);
```

- `status` : indispensable pour que le RLS ne montre au public que les annonces publiées
- `owner_id` : nullable, prévu pour une future fonctionnalité (propriétaire qui liste son bien) — pas utilisé par le frontend actuel, coût nul

**RLS `properties`** :

```sql
alter table public.properties enable row level security;

-- Le public (anon + authenticated) voit uniquement les annonces publiées, l'admin voit tout
create policy properties_select_published_or_admin
  on public.properties for select
  using (status = 'published' or public.is_admin());

-- Seul l'admin peut créer/modifier/supprimer (pas de flow "propriétaire dépose son annonce" pour l'instant)
create policy properties_write_admin
  on public.properties for all
  using (public.is_admin())
  with check (public.is_admin());
```

---

### 2.3 `service_offers`

```sql
create table public.service_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text not null,
  description text not null,
  icon text not null,
  cta text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.service_offers enable row level security;

create policy service_offers_select_all
  on public.service_offers for select
  using (true);

create policy service_offers_write_admin
  on public.service_offers for all
  using (public.is_admin())
  with check (public.is_admin());
```

---

### 2.4 `service_requests` (le cœur de la feature `PLAN_SERVICE_REQUESTS.md`)

```sql
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) default auth.uid(),
  service_type text not null
    check (service_type in ('maintenance', 'decoration', 'juridique', 'demenagement')),
  status text not null default 'reçue'
    check (status in ('reçue', 'en traitement', 'assignée', 'terminée', 'annulée')),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  description text not null,
  property_id uuid references public.properties(id),
  budget numeric,
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
```

**RLS `service_requests`** — c'est la table la plus sensible car un client normal doit pouvoir **créer** et **annuler** sa propre demande, mais **jamais** changer son statut vers autre chose ni modifier les champs admin (`assigned_to`, `notes`) :

```sql
alter table public.service_requests enable row level security;

create policy service_requests_select_own_or_admin
  on public.service_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy service_requests_insert_own
  on public.service_requests for insert
  with check (user_id = auth.uid());

create policy service_requests_update_own_or_admin
  on public.service_requests for update
  using (user_id = auth.uid() or public.is_admin());
```

`USING` seul ne suffit pas à empêcher un client de modifier `notes` ou `assigned_to` sur sa propre ligne (Postgres RLS ne fait pas de restriction colonne par colonne nativement). On complète avec un **trigger** qui bloque toute modification hors périmètre autorisé pour un non-admin :

```sql
create or replace function public.enforce_service_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new; -- l'admin peut tout modifier
  end if;

  -- Un client ne peut modifier AUCUN champ sauf status
  if new.user_id != old.user_id
     or new.service_type != old.service_type
     or new.client_name != old.client_name
     or new.client_email != old.client_email
     or new.client_phone != old.client_phone
     or new.description != old.description
     or coalesce(new.property_id::text, '') != coalesce(old.property_id::text, '')
     or coalesce(new.budget, 0) != coalesce(old.budget, 0)
     or coalesce(new.assigned_to, '') != coalesce(old.assigned_to, '')
     or coalesce(new.notes, '') != coalesce(old.notes, '')
  then
    raise exception 'Seul un administrateur peut modifier ces champs';
  end if;

  -- Un client ne peut que passer sa demande à "annulée"
  if new.status != old.status and new.status != 'annulée' then
    raise exception 'Vous ne pouvez qu''annuler votre demande';
  end if;

  -- Et seulement si elle n'est pas déjà en cours avancé
  if old.status not in ('reçue', 'en traitement') and new.status = 'annulée' then
    raise exception 'Cette demande ne peut plus être annulée';
  end if;

  return new;
end;
$$;

create trigger trg_enforce_service_request_update
  before update on public.service_requests
  for each row execute function public.enforce_service_request_update();
```

> ⚠️ **Compromis documenté** : le client voit `notes` et `assigned_to` en lecture (colonnes visibles via `SELECT`, pas de column-level security). Pour ce MVP c'est acceptable (les notes admin resteront factuelles, ex: "RDV jeudi 14h"), mais si un jour des notes vraiment confidentielles sont nécessaires, il faudra soit une vue dédiée `service_requests_client_view` sans `notes`, soit du column-level `REVOKE`. À garder en tête, non bloquant pour le MVP.

---

### 2.5 `faqs`, `testimonials`, `stats`, `process_steps` (même patron RLS)

Ces 4 tables sont du contenu éditorial en lecture publique, écriture admin uniquement.

```sql
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.process_steps (
  id uuid primary key default gen_random_uuid(),
  step text not null,
  title text not null,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
```

**RLS identique pour les 4 tables** (à répéter avec le nom de table correct) :

```sql
alter table public.faqs enable row level security;
create policy faqs_select_all on public.faqs for select using (true);
create policy faqs_write_admin on public.faqs for all using (public.is_admin()) with check (public.is_admin());

alter table public.testimonials enable row level security;
create policy testimonials_select_all on public.testimonials for select using (true);
create policy testimonials_write_admin on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

alter table public.stats enable row level security;
create policy stats_select_all on public.stats for select using (true);
create policy stats_write_admin on public.stats for all using (public.is_admin()) with check (public.is_admin());

alter table public.process_steps enable row level security;
create policy process_steps_select_all on public.process_steps for select using (true);
create policy process_steps_write_admin on public.process_steps for all using (public.is_admin()) with check (public.is_admin());
```

---

### 2.6 `contact_messages`

```sql
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- PAS de policy INSERT publique ici volontairement (voir section Edge Functions ci-dessous)
create policy contact_messages_select_admin
  on public.contact_messages for select
  using (public.is_admin());

create policy contact_messages_update_admin
  on public.contact_messages for update
  using (public.is_admin());
```

**Pourquoi pas d'INSERT direct pour les visiteurs anonymes ?** Une policy `INSERT ... with check (true)` ouverte à tout le monde expose la table au spam/flood sans aucun contrôle. Le formulaire de contact passe donc par une **Edge Function** (`contact-submit`) qui valide les champs côté serveur et insère avec la clé `service_role` (qui contourne le RLS en toute sécurité car le contrôle se fait dans le code de la fonction, pas côté client).

---

## 3. Tableau récapitulatif RLS (vue d'ensemble)

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `profiles` | ✅ | own + admin | (trigger auto) | own (sauf role) + admin (tout) | — |
| `properties` | ✅ | published + admin | admin only | admin only | admin only |
| `service_offers` | ✅ | tous | admin only | admin only | admin only |
| `service_requests` | ✅ | own + admin | own (`user_id=auth.uid()`) | own limité (trigger) + admin (tout) | — |
| `faqs` | ✅ | tous | admin only | admin only | admin only |
| `testimonials` | ✅ | tous | admin only | admin only | admin only |
| `stats` | ✅ | tous | admin only | admin only | admin only |
| `process_steps` | ✅ | tous | admin only | admin only | admin only |
| `contact_messages` | ✅ | admin only | via Edge Function (service_role) | admin only | — |

**Toutes les tables ont RLS activé** — conformément à ta demande. Aucune table ouverte sans policy.

---

## 4. Edge Functions

### 4.1 Essentielles pour le MVP

#### `contact-submit` (`verify_jwt: false` — public, formulaire anonyme)

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.json();
  const { full_name, email, phone, subject, message } = body;

  if (!full_name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase.from('contact_messages').insert({
    full_name, email, phone, subject, message,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Pourquoi une Edge Function ici est nécessaire (pas juste "nice to have")** : sans elle, il faudrait soit ouvrir `INSERT` à `anon` (risque de spam), soit bloquer complètement le formulaire de contact anonyme. La fonction centralise aussi le point d'ajout futur d'un email de notification (Resend, etc.) sans toucher au frontend.

---

#### `create-service-request` (`verify_jwt: true` — utilisateur authentifié)

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { service_type, client_name, client_email, client_phone, description, property_id, budget } = body;

  const { data, error } = await supabase
    .from('service_requests')
    .insert({ user_id: user.id, service_type, client_name, client_email, client_phone, description, property_id, budget })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Pourquoi une Edge Function plutôt qu'un simple insert Supabase-js direct depuis Angular ?** Le RLS + trigger suffiraient techniquement à sécuriser un insert direct. La fonction est retenue pour préparer proprement un point d'ajout futur (email de confirmation client + notification interne à l'équipe Rheodyce) sans devoir modifier le frontend le jour où cette logique arrivera.

---

### 4.2 Optionnelles / Phase 2 (documentées, non prioritaires pour le MVP)

| Fonction | Rôle | Pourquoi optionnelle |
|----------|------|----------------------|
| `service-request-admin-update` | Update statut/assigné par un admin | Pas de panel admin frontend prévu à ce stade → l'admin peut utiliser directement le Table Editor Supabase (protégé par RLS + `is_admin()`) |
| `subscribe-user` | Marquer un profil comme abonné | Un simple `UPDATE profiles SET is_subscriber = true` protégé par RLS suffit pour le MVP ; utile plus tard si un vrai flux de paiement/vérification est ajouté |
| `properties-search` | Recherche avancée agrégée | `supabase-js` gère déjà le filtrage (type, catégorie, ville) directement contre la table avec RLS respecté ; pas besoin de fonction dédiée sauf optimisation future (une requête pour toute la home) |

---

## 5. Authentification (Supabase Auth)

- **Provider** : email + mot de passe (`supabase.auth.signUp` / `signInWithPassword`), aligné avec les pages existantes `LoginPage` / `RegisterPage`
- Dès l'inscription → trigger `handle_new_user()` crée automatiquement la ligne `profiles`
- `AuthService` Angular sera adapté (voir section 7) pour :
  - Exposer la session Supabase (`supabase.auth.onAuthStateChange`)
  - Dériver `isSubscriber` depuis `profiles.is_subscriber` (au lieu du `localStorage`)
  - `setSubscriber(true)` → `UPDATE profiles SET is_subscriber = true WHERE id = auth.uid()`

---

## 6. Données fictives (seed)

### 6.1 Utilisateurs de démo (via Auth, pas du SQL direct)

`auth.users` ne s'alimente pas par un simple `INSERT SQL` (GoTrue gère le hashing de mot de passe, les contraintes internes). Il faut créer les comptes de démo via l'API Admin Supabase (`supabase.auth.admin.createUser`) ou le Dashboard :

| Email | Rôle | Abonné |
|-------|------|--------|
| admin@rheodyce.cd | admin | — |
| mireille.k@example.com | client | ✅ |
| patrick.m@example.com | client | ✅ |
| jean.d@example.com | client | ❌ |

Une fois créés, le trigger `handle_new_user()` peuple `profiles` automatiquement ; il suffit ensuite d'un `UPDATE` SQL pour ajuster `role` et `is_subscriber`.

### 6.2 `service_offers` (5 lignes, reprend le contenu actuel)

```sql
insert into public.service_offers (slug, title, eyebrow, description, icon, cta, display_order) values
('verification', 'Vérification anti-fraude', 'Confiance', 'Contrôle des informations, cohérence des pièces et statut du bien avant mise en relation.', '✓', 'Voir le protocole', 1),
('location-vente', 'Location & vente', 'Transaction', 'Un parcours clair pour trouver, visiter, comparer et sécuriser votre prochain bien.', '⌂', 'Explorer', 2),
('maintenance', 'Maintenance immobilière', 'Après-vente', 'Plomberie, électricité, climatisation, peinture et remise en état avec prestataires suivis.', '⚙', 'Demander un devis', 3),
('decoration', 'Décoration intérieure', 'Valorisation', 'Aménagement, rénovation légère et mise en scène pour louer ou vendre plus vite.', '◐', 'S''inspirer', 4),
('juridique', 'Assistance juridique', 'Protection', 'Appui documentaire et orientation vers un cabinet partenaire en droit immobilier.', '§', 'Être accompagné', 5);
```

### 6.3 `faqs`, `testimonials`, `stats`, `process_steps`

Réutilisation exacte du contenu déjà présent dans `RheodyceDataService` (4 FAQs, 4 stats, 3 étapes, 2 témoignages + 2-4 ajoutés pour varier).

### 6.4 `properties` (extension de 6 → ~24 lignes)

Élargir la diversité géographique (Kinshasa, Lubumbashi, Goma, Matadi, + Bukavu, Kisangani), les catégories et les fourchettes de prix. Les 6 lignes déjà rédigées dans `RheodyceDataService` servent de base ; ~18 variantes supplémentaires générées sur le même modèle (statut `published` pour toutes, sauf 2-3 en `draft` pour tester le filtrage RLS).

### 6.5 `service_requests` (~12-15 lignes)

Réparties sur les 4 `service_type` × les 5 `status`, liées aux `user_id` des comptes de démo et à quelques `property_id` existants. Reprend et étend les exemples déjà rédigés dans `PLAN_SERVICE_REQUESTS.md` (section "Données de test").

### 6.6 `contact_messages` (5-6 lignes)

Messages fictifs avec statuts variés (`new`, `read`, `archived`) pour tester l'affichage admin futur.

---

## 7. Adaptation Angular (frontend)

### 7.1 Dépendance

```
npm install @supabase/supabase-js
```

### 7.2 Configuration des clés (variables d'environnement)

**Nuance importante** : la clé `anon` (publique) et l'URL du projet **ne sont pas des secrets** — c'est le design même de Supabase (comme une config Firebase), la sécurité repose sur le RLS, pas sur le secret de la clé. Seule la clé **`service_role`** est un vrai secret (utilisée uniquement côté Edge Functions, jamais dans le bundle Angular).

Structure proposée (standard Angular CLI) :

```
src/environments/
├── environment.ts             (production — url + anon key)
└── environment.development.ts (dev local — url + anon key du même projet)
```

```typescript
// environment.ts
export const environment = {
  production: true,
  supabaseUrl: 'https://pjbgqnkmffrmdlkokbmo.supabase.co',
  supabaseAnonKey: '__SUPABASE_ANON_KEY__', // injecté au build via CI
};
```

**Récupération des clés depuis GitHub** : les secrets `SUPABASE_URL` et `SUPABASE_ANON_KEY` (et `SUPABASE_SERVICE_ROLE_KEY` pour le déploiement des Edge Functions uniquement, jamais côté Angular) sont stockés en tant que **GitHub Actions secrets** du repo. Une étape de CI génère `environment.ts` à partir de ces secrets juste avant `ng build` (ex: `envsubst` ou un petit script Node), pour ne jamais committer la vraie clé en clair dans le repo public.

### 7.3 Client Supabase (nouveau service)

```typescript
// src/app/core/services/supabase-client.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );
}
```

### 7.4 Refactor des services existants (API publique préservée)

| Service | Avant | Après | Composants impactés |
|---------|-------|-------|----------------------|
| `RheodyceDataService` | Tableaux statiques en dur | Signals peuplés via requêtes Supabase au démarrage (`properties`, `service_offers`, `faqs`, `testimonials`, `stats`, `process_steps`) | **Aucun** — même API publique |
| `AuthService` | `localStorage` | Session Supabase Auth + `profiles.is_subscriber` | **Aucun** — `isSubscriber` reste un signal, `setSubscriber()` reste la méthode |
| `ServiceRequestService` (nouveau, voir `PLAN_SERVICE_REQUESTS.md`) | Prévu en `localStorage` | Directement branché sur `service_requests` via `supabase-js` (le plan `localStorage` initial est court-circuité — on a maintenant un vrai backend) | Composants pas encore créés, donc zéro migration nécessaire |
| `ContactService` (nouveau) | N'existe pas | Appelle l'Edge Function `contact-submit` | `ContactPage` (à créer/adapter) |

C'est le point clé : **aucun composant existant ne change**, seule l'implémentation interne des services change.

---

## 8. Ordre des migrations (nommage proposé)

À exécuter dans cet ordre via `apply_migration` (chaque nom = un fichier de migration Supabase) :

1. `create_is_admin_helper_and_profiles_table`
2. `create_handle_new_user_trigger`
3. `alter_properties_add_status_and_owner`
4. `enable_rls_and_policies_properties`
5. `create_service_offers_table`
6. `create_faqs_testimonials_stats_process_steps_tables`
7. `create_service_requests_table`
8. `create_enforce_service_request_update_trigger`
9. `create_contact_messages_table`
10. `seed_content_tables` (service_offers, faqs, testimonials, stats, process_steps)
11. `seed_properties_demo`
12. *(hors SQL : création des comptes de démo via Auth Admin API)*
13. `seed_service_requests_demo`
14. `seed_contact_messages_demo`

---

## 9. Checklist avant exécution

- [ ] Valider le schéma des 9 tables (noms de colonnes, contraintes)
- [ ] Valider les policies RLS table par table (section 3)
- [ ] Valider le trigger `enforce_service_request_update` (comportement client vs admin)
- [ ] Confirmer les 2 Edge Functions MVP (`contact-submit`, `create-service-request`)
- [ ] Confirmer la liste des comptes de démo à créer
- [ ] Confirmer le volume de données fictives (24 propriétés, 12-15 demandes, etc.)
- [ ] Ajouter les secrets GitHub (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] **Attendre le Go avant toute exécution SQL/déploiement**

---

## 10. Risques et points d'attention

| Risque | Mitigation |
|--------|-----------|
| RLS mal configuré bloque tout accès | Chaque policy testée immédiatement après création (`SELECT` en tant qu'`anon`, `authenticated`, `admin`) |
| Client peut lire les `notes` admin sur `service_requests` | Documenté comme compromis MVP (section 2.4), vue dédiée possible plus tard |
| Clé `service_role` exposée par erreur | Utilisée **uniquement** dans les Edge Functions (variable d'env Deno), jamais dans le code Angular ni les secrets frontend |
| Comptes de démo avec mots de passe faibles | Comptes clairement labellisés "démo", à supprimer/changer avant mise en prod réelle |
| Migration `ALTER TABLE properties` sur table déjà créée | Table vide (0 lignes) → aucun risque de perte de données |

