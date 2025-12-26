# Guide de refactorisation - Interface EcoScore

## 📋 Vue d'ensemble

Refactorisation complète de l'interface EcoScore pour un design SaaS moderne, professionnel et cohérent, sans modification de la logique métier ni des endpoints API.

## 🎨 Design System

### Fichier : `src/styles/theme.ts`

**Contenu :**
- Palette de couleurs cohérente (neutres + couleur principale + grades A-E)
- Typographie standardisée
- Spacing basé sur une grille 8px
- Border radius et ombres cohérentes
- Helpers pour obtenir les couleurs de grade et de score

**Utilisation :**
```typescript
import { theme, getGradeColors, getScoreColor } from "../styles/theme";
```

## 🧩 Composants UI réutilisables

Tous les composants sont dans `src/components/ui/` :

### 1. **GradeBadge** (`GradeBadge.tsx` + `GradeBadge.css`)
Badge élégant pour afficher le grade A-E avec différentes tailles.

**Props :**
- `grade`: string | undefined | null
- `size`: "sm" | "md" | "lg" (défaut: "md")
- `showLabel`: boolean (défaut: false)
- `className`: string

### 2. **ScoreBar** (`ScoreBar.tsx` + `ScoreBar.css`)
Barre de progression avec labels et animation.

**Props :**
- `score`: number
- `max`: number (défaut: 100)
- `showLabels`: boolean (défaut: false)
- `showValue`: boolean (défaut: false)
- `height`: "sm" | "md" | "lg" (défaut: "md")
- `animated`: boolean (défaut: true)

### 3. **Skeleton** (`Skeleton.tsx` + `Skeleton.css`)
Composants de chargement avec variantes :
- `Skeleton`: composant de base
- `ProductCardSkeleton`: skeleton pour les cartes produit
- `ProductDetailSkeleton`: skeleton pour la page détail

### 4. **CategoryImpactCard** (`CategoryImpactCard.tsx` + `CategoryImpactCard.css`)
Carte d'impact par catégorie avec mini-barre et tooltip.

**Props :**
- `label`: string
- `value`: number
- `weight`: number (optionnel)
- `description`: string

### 5. **InfoAlert** (`InfoAlert.tsx` + `InfoAlert.css`)
Composant d'alerte avec icône et action optionnelle.

**Props :**
- `type`: "info" | "warning" | "success" | "error"
- `title`: string (optionnel)
- `children`: React.ReactNode
- `icon`: string (optionnel)
- `onAction`: () => void (optionnel)
- `actionLabel`: string (optionnel)

### 6. **ProductCard** (`ProductCard.tsx` + `ProductCard.css`)
Carte produit premium avec header, métriques et CTA.

**Props :**
- `id`: number
- `name`: string (optionnel)
- `score`: number (optionnel)
- `grade`: string (optionnel)
- `onClick`: () => void (optionnel)

### 7. **Breadcrumb** (`Breadcrumb.tsx` + `Breadcrumb.css`)
Composant de navigation breadcrumb.

**Props :**
- `items`: Array<{ label: string; onClick?: () => void }>

## 📁 Structure des fichiers

### Nouveaux fichiers créés

```
src/
├── styles/
│   └── theme.ts                    # Design system
├── components/
│   ├── ui/
│   │   ├── GradeBadge.tsx         # Badge grade A-E
│   │   ├── GradeBadge.css
│   │   ├── ScoreBar.tsx           # Barre de progression
│   │   ├── ScoreBar.css
│   │   ├── Skeleton.tsx           # Composants skeleton
│   │   ├── Skeleton.css
│   │   ├── CategoryImpactCard.tsx  # Carte impact catégorie
│   │   ├── CategoryImpactCard.css
│   │   ├── InfoAlert.tsx           # Composant alerte
│   │   ├── InfoAlert.css
│   │   ├── ProductCard.tsx        # Carte produit
│   │   ├── ProductCard.css
│   │   ├── Breadcrumb.tsx         # Navigation breadcrumb
│   │   ├── Breadcrumb.css
│   │   └── index.ts               # Exports centralisés
│   ├── EcoScorePage.tsx           # ✅ Refactorisé
│   ├── EcoScorePage.css           # ✅ Refactorisé
│   ├── EcoScoreWidget.tsx         # ✅ Refactorisé
│   ├── EcoScoreWidget.css         # ✅ Refactorisé
│   ├── EcoScoreLoading.tsx        # ✅ Refactorisé
│   ├── EcoScoreError.tsx          # ✅ Refactorisé
│   └── EcoScoreError.css          # ✅ Nouveau
└── pages/
    ├── ProductList.tsx            # ✅ Refactorisé
    ├── ProductList.css             # ✅ Refactorisé
    ├── ProductEcoScore.tsx         # ✅ Refactorisé
    └── ProductEcoScore.css         # ✅ Nouveau
```

### Fichiers modifiés

- `src/index.css` : Styles globaux améliorés
- `src/pages/ProductList.tsx` : Utilise maintenant `ProductCard`, `Skeleton`, `InfoAlert`
- `src/components/EcoScorePage.tsx` : Utilise tous les nouveaux composants UI
- `src/components/EcoScoreWidget.tsx` : Utilise `GradeBadge`
- `src/components/EcoScoreLoading.tsx` : Utilise `Skeleton`
- `src/components/EcoScoreError.tsx` : Utilise `InfoAlert`

## 🎯 Améliorations apportées

### 1. Design System
- ✅ Palette de couleurs cohérente
- ✅ Typographie standardisée
- ✅ Spacing basé sur grille 8px
- ✅ Border radius et ombres uniformes

### 2. Layout
- ✅ Largeur max 1100px centrée
- ✅ Hiérarchie visuelle claire
- ✅ Alignements et marges uniformes

### 3. Composants
- ✅ Cartes produit premium avec header + badge + métriques + CTA
- ✅ Badge Grade A-E élégant (chip/pill)
- ✅ Progress bar fine avec animation smooth + labels
- ✅ Section "Impact par catégorie" : cartes uniformes avec mini-bar
- ✅ "Pondérations" : affichage compact (3 chips)
- ✅ "Emballage" : bloc info avec icône + pénalité + bouton

### 4. UX
- ✅ États loading avec skeleton
- ✅ Empty state avec `InfoAlert`
- ✅ Error state avec `InfoAlert`
- ✅ Transitions légères (hover, focus)
- ✅ Navigation claire avec breadcrumb

### 5. Code
- ✅ Refactor en composants réutilisables
- ✅ Fichier theme centralisé
- ✅ CSS dupliqué évité
- ✅ Nommage propre et cohérent

## 🔧 Utilisation

### Importer les composants UI

```typescript
import { 
  GradeBadge, 
  ScoreBar, 
  ProductCard, 
  CategoryImpactCard,
  InfoAlert,
  Skeleton,
  Breadcrumb 
} from "../components/ui";
```

### Utiliser le theme

```typescript
import { theme, getGradeColors, getScoreColor } from "../styles/theme";

// Accéder aux couleurs
const primaryColor = theme.colors.primary[500];
const gradeColors = getGradeColors("A");

// Obtenir la couleur du score
const scoreColor = getScoreColor(85);
```

## 📱 Responsive

Tous les composants sont responsive avec des breakpoints :
- Mobile : < 768px
- Desktop : >= 768px

Les grilles s'adaptent automatiquement (grid-template-columns: repeat(auto-fit, minmax(...))).

## ♿ Accessibilité

- ✅ Contraste des couleurs respecté
- ✅ Focus visible sur tous les éléments interactifs
- ✅ aria-label sur les boutons et éléments importants
- ✅ Navigation au clavier fonctionnelle
- ✅ Rôles ARIA appropriés (progressbar, alert, etc.)

## 🚀 Prochaines étapes (optionnel)

1. Ajouter des animations plus sophistiquées (framer-motion si nécessaire)
2. Implémenter le dark mode
3. Ajouter des tests unitaires pour les composants UI
4. Optimiser les performances (lazy loading, memoization)
5. Ajouter Storybook pour documenter les composants

## 📝 Notes importantes

- **Aucune modification de la logique métier** : Tous les appels API et la logique de calcul restent identiques
- **Aucune modification des endpoints** : Les endpoints API ne sont pas modifiés
- **Rétrocompatibilité** : L'interface fonctionne exactement comme avant, avec une meilleure présentation
- **Pas de dépendances lourdes** : Seulement React, pas de bibliothèques UI externes

