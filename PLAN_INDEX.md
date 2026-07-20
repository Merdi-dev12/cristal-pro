# 📖 Index - Analyse et Plan Service Requests + Backend Supabase

## 🚀 Commencer ici

**Tous les documents sont dans le dossier racine du projet.**

Choisis en fonction de ton rôle:

### 👨‍💼 Product / Manager / Décideur
→ Lire: **[PLAN_RESUME_EXECUTIF.md](PLAN_RESUME_EXECUTIF.md)** ⏱️ 15 min
- Quoi: Fonctionnalité + backend Supabase
- Pourquoi: Objectif utilisateur
- Combien: Budget (frontend 8-12h + backend, voir plan)
- Risques: Identifiés

### 👨‍💻 Développeur qui va implémenter
→ Lire dans cet ordre:
1. **[PLAN_RESUME_EXECUTIF.md](PLAN_RESUME_EXECUTIF.md)** (15 min) - Vue d'ensemble
2. **[PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)** (40 min) - Tables, RLS, Edge Functions, seed
3. **[PLAN_SERVICE_REQUESTS.md](PLAN_SERVICE_REQUESTS.md)** (30 min) - Plan détaillé frontend
4. **[PLAN_PATTERNS_IMPLEMENTATION.md](PLAN_PATTERNS_IMPLEMENTATION.md)** (20 min) - Patterns
5. **[agents.md](agents.md)** (10 min) - Architecture générale du projet

### 🏗️ Architecte / Tech lead
→ Lire dans cet ordre:
1. **[PLAN_ARCHITECTURE_VISUELLE.md](PLAN_ARCHITECTURE_VISUELLE.md)** (20 min) - Flux et diagrammes
2. **[PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)** (40 min) - Schéma SQL complet, RLS, Edge Functions
3. **[PLAN_SERVICE_REQUESTS.md](PLAN_SERVICE_REQUESTS.md)** (40 min) - Plan détaillé
4. **[PLAN_PATTERNS_IMPLEMENTATION.md](PLAN_PATTERNS_IMPLEMENTATION.md)** (20 min) - Patterns
5. **[agents.md](agents.md)** (10 min) - Conventions projet

### 🗄️ DBA / Responsable Supabase
→ Lire: **[PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)** en entier ⏱️ 40 min
- Schéma des 9 tables (SQL complet)
- RLS + policies détaillées table par table
- Triggers de sécurité
- Edge Functions (code complet)
- Ordre des migrations
- Checklist avant exécution

### 🧪 QA / Testeur
→ Lire:
1. **[PLAN_SERVICE_REQUESTS.md](PLAN_SERVICE_REQUESTS.md)** - Section "Tests et validation"
2. **[PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md)** - Section "Checklist avant exécution" + "Risques"
3. **[PLAN_PATTERNS_IMPLEMENTATION.md](PLAN_PATTERNS_IMPLEMENTATION.md)** - Section "Pattern Tests"

---

## 📚 Tous les documents

### 0. [PLAN_BACKEND_SUPABASE.md](PLAN_BACKEND_SUPABASE.md) 🆕
**Type:** Plan technique backend complet
**Durée:** 40 min
**Contenu:**
- ✅ État des lieux vérifié du projet Supabase `rheodyce-db`
- ✅ Schéma complet des 9 tables (SQL)
- ✅ RLS + policies détaillées, table par table
- ✅ Trigger de sécurité `service_requests` (client vs admin)
- ✅ 2 Edge Functions MVP (code complet) + 3 optionnelles documentées
- ✅ Authentification Supabase Auth
- ✅ Plan de données fictives (seed) pour les 9 tables
- ✅ Adaptation Angular (supabase-js, environments, refactor services)
- ✅ Ordre des migrations
- ✅ Checklist avant exécution + risques

**Quand le lire:**
- Avant toute connexion backend (obligatoire)
- Pour comprendre le schéma SQL exact
- Référence pendant l'implémentation des tables/RLS/Edge Functions

---

### 1. [PLAN_RESUME_EXECUTIF.md](PLAN_RESUME_EXECUTIF.md)
**Type:** Synthèse  
**Durée:** 10-15 min  
**Contenu:**
- ✅ Résumé 1 phrase du projet
- ✅ Architecture haute niveau
- ✅ Fichiers à créer (liste simple)
- ✅ Routes à ajouter
- ✅ Mockups UI
- ✅ Timeline et effort
- ✅ Checklist de démarrage
- ✅ FAQ rapide

**Quand le lire:**
- Besoin de comprendre rapidement
- Prendre une décision
- Briefer une équipe
- Valider le scope

---

### 2. [PLAN_SERVICE_REQUESTS.md](PLAN_SERVICE_REQUESTS.md)
**Type:** Plan complet détaillé  
**Durée:** 30-45 min  
**Contenu:**
- ✅ Analyse situation actuelle
- ✅ Architecture 3 couches
- ✅ Modèles de données (complets)
- ✅ Services (structure)
- ✅ Composants (pages)
- ✅ Routes à ajouter
- ✅ Plan étape par étape (6 phases)
- ✅ Tests (unit, intégration, checklist)
- ✅ Données de test
- ✅ Design système
- ✅ Points de contact métier
- ✅ État du projet
- ✅ Roadmap

**Quand le lire:**
- Avant de coder (obligatoire)
- Planifier le sprint
- Documenter
- Référence pendant développement

---

### 3. [PLAN_ARCHITECTURE_VISUELLE.md](PLAN_ARCHITECTURE_VISUELLE.md)
**Type:** Diagrammes et visualisations  
**Durée:** 20-30 min  
**Contenu:**
- ✅ Flux de données (diagrame)
- ✅ Pages et composants (arbre)
- ✅ Flux utilisateur (happy path)
- ✅ Cas d'usage détaillés
- ✅ État des données (Signals)
- ✅ Statuts et couleurs (tableau)
- ✅ Responsive breakdown
- ✅ Arborescence fichiers finale
- ✅ Timeline par phase (Gantt-like)

**Quand le lire:**
- Besoin de visualiser l'architecture
- Comprendre les dépendances
- Valider les flux
- Discuter avec l'équipe

---

### 4. [PLAN_PATTERNS_IMPLEMENTATION.md](PLAN_PATTERNS_IMPLEMENTATION.md)
**Type:** Guide de codage  
**Durée:** 20-30 min  
**Contenu:**
- ✅ 10 patterns du projet
- ✅ Modèle à suivre pour chacun
- ✅ Comment l'appliquer
- ✅ Points clés
- ✅ Exemples concrets
- ✅ Patterns couverts:
  - Signals
  - Injection DI
  - Composants standalone
  - Inputs/Outputs
  - Templates (@for, @if)
  - Routing
  - Styling Tailwind
  - Pipes
  - Tests Vitest
  - localStorage
- ✅ Checklist d'implémentation
- ✅ Validation final

**Quand le lire:**
- Pendant le développement
- Avant de coder un composant
- Checker la cohérence du code
- Référence de patterns

---

### 5. [agents.md](agents.md)
**Type:** Documentation projet générale  
**Durée:** 15-20 min (skim), 45 min (complet)  
**Contenu:**
- ✅ Vue d'ensemble Rheodyce
- ✅ Stack technologique
- ✅ Architecture générale
- ✅ Conventions (nommage, TypeScript)
- ✅ Patterns Angular
- ✅ Styling Tailwind
- ✅ Workflow et processus
- ✅ Pièges courants
- ✅ Points de contact métier
- ✅ État du projet
- ✅ Objectifs futurs

**Quand le lire:**
- Premier jour du projet
- Référence continue
- Comprendre le contexte global
- Avant les patterns détaillés

---

## 🗂️ Relation entre documents

```
agents.md (Contexte projet général)
    ↓
PLAN_RESUME_EXECUTIF.md (Synthèse rapide, inclut le résumé backend)
    ↓
    ├─→ PLAN_BACKEND_SUPABASE.md (Schéma SQL, RLS, Edge Functions, seed) 🆕
    │       ↓
    ├─→ PLAN_SERVICE_REQUESTS.md (Plan détaillé frontend) ←─┐
    │   └─→ PLAN_PATTERNS_IMPLEMENTATION.md                 │
    │                   (Comment coder)                       │
    └─→ PLAN_ARCHITECTURE_VISUELLE.md (Visualiser) ──────────┘
```

## ⏱️ Temps de lecture

| Document | Skim | Complet | Référence |
|----------|------|---------|-----------|
| agents.md | 10 min | 45 min | 📚 Continue |
| PLAN_RESUME_EXECUTIF.md | 5 min | 15 min | 📌 Avant décision |
| **PLAN_BACKEND_SUPABASE.md** 🆕 | 15 min | 40 min | 🗄️ Avant connexion backend |
| PLAN_SERVICE_REQUESTS.md | 15 min | 45 min | 📚 Avant coding |
| PLAN_ARCHITECTURE_VISUELLE.md | 10 min | 30 min | 📊 Pour discuter |
| PLAN_PATTERNS_IMPLEMENTATION.md | 15 min | 30 min | 📝 Pendant coding |

---

## 🎯 Scénarios

### "Je dois valider le scope en 10 minutes"
→ Lire: **PLAN_RESUME_EXECUTIF.md** sections:
- Objectif
- Fichiers à créer
- Timeline
- Checklist de démarrage

### "Je dois implémenter cette feature"
→ Progression:
1. Lire PLAN_RESUME_EXECUTIF.md (10 min)
2. Lire PLAN_SERVICE_REQUESTS.md (45 min)
3. Consulter PLAN_PATTERNS_IMPLEMENTATION.md pendant coding (20 min total)
4. Garder PLAN_ARCHITECTURE_VISUELLE.md ouvert pour référence

### "Je dois coder une page"
→ Utiliser:
1. PLAN_PATTERNS_IMPLEMENTATION.md - Pattern "Composants Standalone" + "Template"
2. PLAN_SERVICE_REQUESTS.md - Section "Phase 2" ou "Phase 3"
3. agents.md - Section "Conventions" pour cohérence

### "Je dois reviewer le code"
→ Utiliser:
1. PLAN_PATTERNS_IMPLEMENTATION.md - Checklist d'implémentation
2. agents.md - Section "Pièges courants"
3. PLAN_SERVICE_REQUESTS.md - Section "État du projet"

### "Je dois tester cette feature"
→ Utiliser:
1. PLAN_SERVICE_REQUESTS.md - Section "Tests et validation"
2. PLAN_PATTERNS_IMPLEMENTATION.md - Pattern "Tests"
3. PLAN_RESUME_EXECUTIF.md - Cas de test prioritaires

---

## 🔗 Navigation rapide

### Par phase d'implémentation

#### Phase 1: Fondations (Models + Service)
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 1
- 🛠️ Patterns: PLAN_PATTERNS_IMPLEMENTATION.md → Signals, localStorage
- 📊 Fichiers: Models section

#### Phase 2: Liste des demandes
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 2
- 🛠️ Patterns: PLAN_PATTERNS_IMPLEMENTATION.md → Standalone, Inputs/Outputs, Templates
- 📊 Fichiers: Pages section
- 🎨 Design: PLAN_ARCHITECTURE_VISUELLE.md → Responsive Breakdown

#### Phase 3: Détail d'une demande
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 3
- 🛠️ Patterns: PLAN_PATTERNS_IMPLEMENTATION.md → Routing
- 📊 Fichiers: Pages section

#### Phase 4: Intégration
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 4
- 🛠️ Patterns: PLAN_PATTERNS_IMPLEMENTATION.md → Routing
- ✅ Checklist: PLAN_RESUME_EXECUTIF.md → Checklist Phase 4

#### Phase 5: Formulaire (optionnel)
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 5
- 🛠️ Patterns: agents.md → Pas de patterns nouveaux

#### Phase 6: API Ready
- 📚 Ressource: PLAN_SERVICE_REQUESTS.md → Phase 6 + Section "API"
- 🔌 HttpClient: PLAN_PATTERNS_IMPLEMENTATION.md → localStorage (adapter pour HttpClient)

---

## 💾 Fichiers à créer (résumé rapide)

Copier-coller pour la checklist:

```
Models:
  [ ] src/app/shared/models/service-request.model.ts

Services:
  [ ] src/app/core/services/service-request.service.ts

Pages:
  [ ] src/app/features/my-account/service-requests/service-requests.ts
  [ ] src/app/features/my-account/service-requests/service-requests.html
  [ ] src/app/features/my-account/service-requests/service-requests.css
  [ ] src/app/features/my-account/service-requests/service-requests.spec.ts
  [ ] src/app/features/my-account/service-requests/service-request-detail/service-request-detail.ts
  [ ] src/app/features/my-account/service-requests/service-request-detail/service-request-detail.html
  [ ] src/app/features/my-account/service-requests/service-request-detail/service-request-detail.css
  [ ] src/app/features/my-account/service-requests/service-request-detail/service-request-detail.spec.ts

Shared Components:
  [ ] src/app/shared/components/request-status-badge/request-status-badge.ts
  [ ] src/app/shared/components/request-status-badge/request-status-badge.html

Optionnel (Phase 5):
  [ ] src/app/features/my-account/service-requests/service-request-form/service-request-form.ts
  [ ] src/app/features/my-account/service-requests/service-request-form/service-request-form.html
  [ ] src/app/features/my-account/service-requests/service-request-form/service-request-form.css

Modifier:
  [ ] src/app/app.routes.ts (ajouter 2-3 routes)
  [ ] src/app/layout/header/header.ts (optionnel: lien "Mon compte")
```

---

## 🚨 Pièges à éviter

Vérifier dans les documents:

| Piège | Document | Section |
|-------|----------|---------|
| Oublier `standalone: true` | PLAN_PATTERNS_IMPLEMENTATION.md | Pattern Composants |
| Utiliser RxJS | agents.md | Pièges courants |
| Import oubliés | PLAN_PATTERNS_IMPLEMENTATION.md | Pattern Standalone |
| Typage flou | agents.md | Conventions TypeScript |
| localStorage inexistant | agents.md | État du projet |
| Pas de tests | PLAN_PATTERNS_IMPLEMENTATION.md | Pattern Tests |
| Routes mal placées | PLAN_PATTERNS_IMPLEMENTATION.md | Pattern Routing |
| Dépendances circulaires | agents.md | Pièges courants |

---

## ❓ Questions avant de commencer

Valider que tu peux répondre à:

1. **Quoi?** Voir PLAN_RESUME_EXECUTIF.md → Objectif
2. **Pourquoi?** Voir PLAN_RESUME_EXECUTIF.md → Cas d'usage
3. **Combien de temps?** Voir PLAN_RESUME_EXECUTIF.md → Timeline
4. **Comment architecturer?** Voir PLAN_SERVICE_REQUESTS.md → Architecture
5. **Quels patterns appliquer?** Voir PLAN_PATTERNS_IMPLEMENTATION.md
6. **Quels fichiers créer?** Voir PLAN_SERVICE_REQUESTS.md → Phase X
7. **Comment tester?** Voir PLAN_SERVICE_REQUESTS.md → Tests
8. **Quand passer à l'API?** Voir PLAN_SERVICE_REQUESTS.md → Phase 6

Si tu peux répondre à tout → Go!

---

## 📞 Support

Besoin d'aide?

- **Architecture:** Relire PLAN_ARCHITECTURE_VISUELLE.md
- **Patterns:** Relire PLAN_PATTERNS_IMPLEMENTATION.md
- **Détails:** Relire PLAN_SERVICE_REQUESTS.md
- **Contexte projet:** Relire agents.md
- **Decision rapide:** Relire PLAN_RESUME_EXECUTIF.md

**Tous les documents sont auto-contenus et can être consultés indépendamment.**

---

## ✅ Checklist avant de coder

- [ ] J'ai lu le PLAN_RESUME_EXECUTIF.md
- [ ] J'ai lu le PLAN_BACKEND_SUPABASE.md
- [ ] J'ai lu le PLAN_SERVICE_REQUESTS.md
- [ ] J'ai des notes sur les patterns (PLAN_PATTERNS_IMPLEMENTATION.md)
- [ ] J'ai la liste des fichiers à créer (frontend + migrations SQL)
- [ ] Je comprends le modèle ServiceRequest
- [ ] Je comprends les 5 statuts
- [ ] Je peux dessiner le flux utilisateur
- [ ] Je connais les 4 types de services
- [ ] Je sais comment le code sera testé
- [ ] Je connais les 9 tables et leur RLS respectif
- [ ] Je comprends pourquoi `service_requests` a besoin d'un trigger en plus du RLS
- [ ] Je sais quelle clé (anon vs service_role) va où

✅ Si tout coché → **Attendre le Go avant toute exécution SQL/déploiement.**

