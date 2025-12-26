# 📝 Exemple d'insertion d'un produit via PDF

## Exemple complet avec curl

### 1. Préparer un fichier PDF

Créez un fichier `test_product.pdf` avec le contenu suivant :

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

### 2. Insérer le produit

**Linux/Mac:**
```bash
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@test_product.pdf" \
  -o response.json
```

**Windows (PowerShell):**
```powershell
$uri = "http://localhost:8000/parse-and-nlp"
$filePath = "test_product.pdf"
$formData = @{
    file = Get-Item -Path $filePath
}
$response = Invoke-RestMethod -Uri $uri -Method Post -Form $formData
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "response.json"
```

### 3. Vérifier la réponse

Le fichier `response.json` devrait contenir :

```json
{
  "product": {
    "id": 1,
    "nom": "UltraImport – Steak Haché Surgelé",
    "marque": "UltraImport",
    "categorie": "Viande / Surgelé",
    "poids_net_g": 500,
    "ingredients_raw": "Viande de bœuf 100%",
    "packaging_raw": "Emballage: Barquette polystyrène 80 g + Film plastique 15 g (Total 95 g)...",
    "origine_raw": "Argentine (Buenos Aires)",
    "labels_raw": ""
  },
  "nlp": {
    "ingredients": [...],
    "packaging": [...],
    "origins": [...]
  },
  "lca": {
    "co2_kg": 0.3357,
    "water_l": 14.9045,
    "energy_mj": 0.7072,
    "score": {
      "numeric_score": 76.43,
      "grade": "B"
    }
  }
}
```

### 4. Consulter le produit via l'API

```bash
# Liste de tous les produits
curl http://localhost:8005/public/products

# Détails d'un produit spécifique
curl http://localhost:8005/public/product/1
```

---

## Exemple avec Python

```python
import requests

def insert_product_from_pdf(pdf_path: str):
    """Insère un produit depuis un fichier PDF."""
    url = "http://localhost:8000/parse-and-nlp"
    
    with open(pdf_path, "rb") as f:
        files = {"file": (pdf_path, f, "application/pdf")}
        response = requests.post(url, files=files)
        response.raise_for_status()
        return response.json()

# Utilisation
result = insert_product_from_pdf("test_product.pdf")
print(f"Produit inséré avec ID: {result['product']['id']}")
print(f"Score: {result['lca']['score']['grade']} ({result['lca']['score']['numeric_score']})")
```

---

## Exemple avec JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function insertProductFromPDF(pdfPath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(pdfPath));
  
  const response = await axios.post(
    'http://localhost:8000/parse-and-nlp',
    form,
    {
      headers: form.getHeaders()
    }
  );
  
  return response.data;
}

// Utilisation
insertProductFromPDF('test_product.pdf')
  .then(result => {
    console.log(`Produit inséré avec ID: ${result.product.id}`);
    console.log(`Score: ${result.lca.score.grade} (${result.lca.score.numeric_score})`);
  })
  .catch(error => {
    console.error('Erreur:', error.message);
  });
```

---

## Exemple avec Postman

1. Ouvrir Postman
2. Créer une nouvelle requête POST
3. URL : `http://localhost:8000/parse-and-nlp`
4. Onglet "Body" → Sélectionner "form-data"
5. Ajouter une clé "file" de type "File"
6. Sélectionner votre fichier PDF
7. Cliquer sur "Send"

---

## Vérification dans la base de données

```sql
-- Se connecter à la base ParserProduit
psql -h localhost -p 5433 -U postgres -d ecolabel_ms

-- Voir tous les produits
SELECT id, nom, marque, categorie, poids_net_g FROM produits_raw;

-- Voir un produit spécifique
SELECT * FROM produits_raw WHERE id = 1;
```

---

## Vérification via l'API WidgetAPI

```bash
# Liste de tous les produits avec leurs scores
curl http://localhost:8005/public/products | jq

# Détails complets d'un produit
curl http://localhost:8005/public/product/1 | jq
```


