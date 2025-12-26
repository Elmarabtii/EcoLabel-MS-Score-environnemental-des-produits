# 📄 Guide d'insertion manuelle des produits via PDF

## Vue d'ensemble

Dans EcoLabel-MS, il y a **deux types de données** :

1. **Données de référence** (facteurs LCA, taxonomies) → Initialisées **une seule fois** au démarrage
2. **Données de produits** → Insérées **manuellement** via upload de PDF

---

## 🔧 Étape 1 : Initialisation des données de référence (une seule fois)

Avant de pouvoir insérer des produits, vous devez initialiser les **données de référence** nécessaires au calcul des scores.

### Pourquoi ?

Les données de référence contiennent :
- **Facteurs LCA** : Impact CO2/eau/énergie des ingrédients, emballages, transports
- **Taxonomies NLP** : Mappings entre noms d'ingrédients et codes LCA

**Sans ces données, le système ne peut pas calculer les scores !**

### Comment initialiser ?

**Linux/Mac:**
```bash
chmod +x init-databases.sh
./init-databases.sh
```

**Windows:**
```bash
init-databases.bat
```

**Ou avec Makefile:**
```bash
make init-db
```

### Vérification

```sql
-- Vérifier que les facteurs de transport sont présents
SELECT * FROM lca_transport_factors;
-- Doit contenir: SEA, ROAD, AIR

-- Vérifier que les taxonomies sont présentes
SELECT * FROM ingredient_taxonomy;
SELECT * FROM packaging_taxonomy;
```

---

## 📤 Étape 2 : Insertion manuelle des produits via PDF

Une fois les données de référence initialisées, vous pouvez insérer des produits manuellement.

### Méthode 1 : Via l'API REST (curl/Postman)

#### Endpoint : `/parse-and-nlp`

**URL :** `http://localhost:8000/parse-and-nlp`

**Méthode :** `POST`

**Type :** `multipart/form-data`

**Paramètre :** `file` (PDF ou image)

#### Exemple avec curl

```bash
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@produit.pdf"
```

#### Exemple avec PowerShell (Windows)

```powershell
$uri = "http://localhost:8000/parse-and-nlp"
$filePath = "C:\chemin\vers\produit.pdf"
$formData = @{
    file = Get-Item -Path $filePath
}
Invoke-RestMethod -Uri $uri -Method Post -Form $formData
```

#### Exemple avec Python

```python
import requests

url = "http://localhost:8000/parse-and-nlp"
with open("produit.pdf", "rb") as f:
    files = {"file": ("produit.pdf", f, "application/pdf")}
    response = requests.post(url, files=files)
    print(response.json())
```

#### Réponse attendue

```json
{
  "product": {
    "id": 1,
    "nom": "Nom du produit",
    "marque": "Marque",
    "categorie": "Catégorie",
    "poids_net_g": 500,
    "ingredients_raw": "...",
    "packaging_raw": "...",
    "origine_raw": "...",
    "labels_raw": "..."
  },
  "nlp": {
    "ingredients": [...],
    "packaging": [...],
    "origins": [...],
    "labels": [...]
  },
  "lca": {
    "product_id": "1",
    "co2_kg": 0.3357,
    "water_l": 14.9045,
    "energy_mj": 0.7072,
    "breakdown": {...},
    "score": {
      "numeric_score": 76.43,
      "grade": "B",
      "confidence": 0.9
    }
  }
}
```

---

### Méthode 2 : Via l'interface web (si disponible)

Si vous avez une interface web pour le frontend, vous pouvez uploader des PDFs directement depuis le navigateur.

**URL :** `http://localhost:3000` (si le frontend est démarré)

---

## 📋 Format du PDF attendu

Le PDF doit contenir les informations suivantes (format libre, le parser les extrait automatiquement) :

```
Nom: Nom du produit
Marque: Marque du produit
Catégorie: Catégorie
GTIN: 3012345678901
Poids net: 500 g
Ingredients (INCI): Liste des ingrédients
Emballage: Description de l'emballage
Origine: Pays d'origine
Destination: Pays de destination
Transport: Mode et distance
Labels: Labels présents
```

### Exemple de PDF

```
Nom: UltraImport – Steak Haché Surgelé
Marque: UltraImport
Catégorie: Viande / Surgelé
GTIN: 3012345678911
Poids net: 500 g
Ingredients (INCI): Viande de bœuf 100%
Emballage: Barquette polystyrène 80 g + Film plastique 15 g (Total 95 g)
Origine: Argentine (Buenos Aires)
Destination: France (Paris)
Transport: Maritime + routier, Distance ~11000 km
Labels: Aucun
```

---

## 🔄 Workflow complet

```
1. Démarrer les services Docker
   └─> docker-compose up -d

2. Initialiser les données de référence (une seule fois)
   └─> ./init-databases.sh

3. Pour chaque produit :
   └─> Upload PDF via /parse-and-nlp
       ├─> Parser extrait le texte
       ├─> NLP extrait les entités
       ├─> LCA calcule les impacts
       ├─> Scoring calcule le score
       └─> Données sauvegardées dans les bases

4. Consulter les résultats
   └─> http://localhost:8005/public/products
```

---

## ✅ Vérification après insertion

### Vérifier qu'un produit a été inséré

```bash
# Via l'API WidgetAPI
curl http://localhost:8005/public/products

# Ou directement dans la base de données
psql -h localhost -p 5433 -U postgres -d ecolabel_ms
SELECT * FROM produits_raw;
```

### Vérifier le score calculé

```bash
# Via l'API WidgetAPI
curl http://localhost:8005/public/product/1
```

---

## 🐛 Dépannage

### Le PDF n'est pas traité

1. Vérifier que le service ParserProduit est démarré :
   ```bash
   curl http://localhost:8000/
   ```

2. Vérifier les logs :
   ```bash
   docker-compose logs -f parser-produit
   ```

3. Vérifier que le PDF contient du texte (pas seulement des images)

### Le score n'est pas calculé

1. Vérifier que les données de référence sont initialisées :
   ```sql
   SELECT COUNT(*) FROM lca_transport_factors;
   -- Doit retourner au moins 3 (SEA, ROAD, AIR)
   ```

2. Vérifier les logs du service LCA :
   ```bash
   docker-compose logs -f lca-lite
   ```

### Erreur "Transport not found"

Cela signifie que le mode de transport extrait n'existe pas dans la base. Vérifiez que les facteurs de transport sont bien insérés :

```sql
SELECT * FROM lca_transport_factors;
```

---

## 📊 Statistiques

### Compter les produits insérés

```sql
-- Base ParserProduit
SELECT COUNT(*) FROM produits_raw;

-- Base Scoring (scores calculés)
SELECT COUNT(*) FROM scores;
```

### Voir les derniers produits

```sql
SELECT id, nom, marque, categorie, created_at 
FROM produits_raw 
ORDER BY id DESC 
LIMIT 10;
```

---

## 🎯 Bonnes pratiques

1. **Format PDF** : Utilisez des PDFs avec du texte (pas seulement des images)
2. **Informations complètes** : Plus le PDF contient d'informations, meilleur sera le score
3. **Vérification** : Vérifiez toujours la réponse de l'API pour confirmer l'insertion
4. **Logs** : Consultez les logs en cas d'erreur

---

## 📝 Résumé

| Action | Fréquence | Méthode |
|--------|-----------|---------|
| Initialiser données de référence | **Une seule fois** | Script `init-databases.sh` |
| Insérer un produit | **Manuel, à chaque produit** | Upload PDF via `/parse-and-nlp` |
| Consulter les résultats | **À la demande** | API `/public/products` ou `/public/product/{id}` |

---

## 🔗 Liens utiles

- **API ParserProduit** : http://localhost:8000/docs (Swagger UI)
- **API WidgetAPI** : http://localhost:8005/docs
- **Frontend** : http://localhost:3000 (si démarré)


