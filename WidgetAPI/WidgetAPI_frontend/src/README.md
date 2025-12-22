# Architecture EcoScore Frontend

## Principe : Single Source of Truth

**Le backend est l'unique source de vérité pour le score environnemental.**

Le frontend se contente de consommer et d'afficher les données sans jamais les modifier ou recalculer.

## Structure des fichiers

```
src/
│
├── services/
│   └── ecoScoreApi.ts          # Appel API unique vers /public/product/:id
│
├── hooks/
│   └── useEcoScore.ts          # Hook React centralisé pour récupérer les données
│
├── components/
│   ├── EcoScoreCore.tsx        # Composant central qui délègue selon le mode
│   ├── EcoScorePage.tsx        # Vue détaillée (mode "page")
│   ├── EcoScoreWidget.tsx      # Vue compacte (mode "widget")
│   ├── EcoScoreLoading.tsx     # État de chargement
│   ├── EcoScoreError.tsx       # État d'erreur
│   ├── shared/
│   │   ├── Tooltip.tsx         # Composant tooltip réutilisable
│   │   └── Modal.tsx           # Composant modal réutilisable
│   └── modals/
│       ├── MethodologyModal.tsx    # Modal méthodologie
│       └── ComparisonModal.tsx      # Modal comparaison
│
├── pages/
│   ├── ProductEcoScore.tsx     # Page principale
│   └── ProductList.tsx         # Liste des produits
│
└── utils/
    └── ecoScoreUtils.ts         # Fonctions utilitaires partagées
```

## Rôle de chaque élément

### 1. `services/ecoScoreApi.ts`

**Responsabilité unique :** Appel API vers le backend

- Contient l'appel HTTP unique vers `/public/product/:id`
- Gère uniquement la requête HTTP
- Retourne les données typées (`EcoScoreData`)
- Gère les erreurs HTTP (404, etc.)

### 2. `hooks/useEcoScore.ts`

**Responsabilité :** Logique de récupération des données

- Utilise `fetchEcoScore` du service API
- Gère les états : `loading`, `error`, `data`
- Expose une fonction `retry` pour réessayer
- **Aucune logique UI ici**

### 3. `components/EcoScoreCore.tsx`

**Responsabilité :** Composant central qui délègue

- Reçoit `productId` et `mode` ("page" | "widget")
- Utilise `useEcoScore` pour récupérer les données
- Gère les états de chargement et d'erreur
- Délègue le rendu à :
  - `EcoScorePage` si `mode = "page"`
  - `EcoScoreWidget` si `mode = "widget"`

### 4. `components/EcoScorePage.tsx`

**Responsabilité :** Vue détaillée complète

Affiche :
- Header avec informations produit (nom, marque, catégorie, etc.)
- Score global + barre de progression avec repères
- Grade avec tooltip explicatif
- Résumé en 3 points (points forts, améliorations, conseils)
- Impact par catégorie (CO₂, Eau, Énergie) avec barres
- Pondérations transparentes
- Packaging et pénalités
- Traçabilité (dernière mise à jour, source)
- Actions (méthodologie, comparaison, partage, PDF)

### 5. `components/EcoScoreWidget.tsx`

**Responsabilité :** Vue compacte intégrable

Affiche uniquement :
- Grade (A-E)
- Score global (0-100)
- Indicateurs clés (CO₂, Eau, Énergie)
- Bouton "Voir détails" (redirige vers la page)

**Le widget est léger, responsive et intégrable dans n'importe quelle page e-commerce.**

### 6. `pages/ProductEcoScore.tsx`

**Responsabilité :** Page principale

- Point d'entrée pour afficher l'EcoScore
- Gère le `productId` (props ou URL)
- Gère le mode d'affichage initial
- Utilise `EcoScoreCore`

### 7. `pages/ProductList.tsx`

**Responsabilité :** Liste des produits

- Affiche tous les produits disponibles
- Permet la navigation vers les détails
- Affiche les scores et grades

## Flux de données

```
Backend (API)
    ↓
services/ecoScoreApi.ts (fetchEcoScore)
    ↓
hooks/useEcoScore.ts (useEcoScore)
    ↓
components/EcoScoreCore.tsx
    ↓
    ├── EcoScorePage.tsx (mode "page")
    └── EcoScoreWidget.tsx (mode "widget")
```

## Utilisation

### Mode Page (détaillé)

```tsx
import ProductEcoScore from "./pages/ProductEcoScore";

<ProductEcoScore productId={1} initialMode="page" />
```

### Mode Widget (compact)

```tsx
import ProductEcoScore from "./pages/ProductEcoScore";

<ProductEcoScore productId={1} initialMode="widget" />
```

## Points importants

1. **Single Source of Truth** : Le backend calcule le score. Le frontend l'affiche.
2. **Même API, même données** : Page et Widget utilisent exactement la même API et le même modèle de données.
3. **Différence uniquement visuelle** : La différence entre page et widget est uniquement dans le rendu, pas dans les données.
4. **Pas de recalcul** : Le frontend ne modifie jamais le score ou les données.
5. **Architecture modulaire** : Chaque composant a une responsabilité unique et claire.

## Endpoint API

```
GET /public/product/:id
GET /public/products
```

Retourne un JSON avec :
- `product_id`, `grade`, `numeric_score`, `confidence`
- `details.weights` (co2, water, energy)
- `details.normalized_indicators` (co2, water, energy)
- `details.packaging_type`, `details.packaging_penalty`
- Métadonnées (created_at, updated_at, data_source, etc.)

