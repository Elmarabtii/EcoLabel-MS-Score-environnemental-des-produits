# 🌱 EcoLabel-MS - Système d'Évaluation Environnementale des Produits

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Docker](https://img.shields.io/badge/docker-compose-blue)

## 📋 Description

EcoLabel-MS est un système microservices complet pour l'évaluation environnementale des produits de consommation. Il analyse les ingrédients, l'emballage et le transport d'un produit pour calculer son impact environnemental (CO2, eau, énergie) et attribuer un score écologique (A à E).

Le système utilise l'Intelligence Artificielle pour extraire automatiquement les informations des documents produits (PDF, images) et calcule un score environnemental basé sur l'Analyse du Cycle de Vie (ACV).

## 🏗️ Architecture

Le système est composé de **6 microservices** qui communiquent entre eux :

```
┌─────────────────────────────────────────────────────────────┐
│                    EcoLabel-MS Pipeline                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Parser    │────▶│     NLP      │────▶│     LCA     │
│  Produit    │     │ Ingrédients  │     │    Lite     │
│   (8000)    │     │    (8001)    │     │   (8002)    │
└─────────────┘     └──────────────┘     └─────────────┘
     │                     │                     │
     │                     │                     ▼
     │                     │              ┌─────────────┐
     │                     │              │   Scoring   │
     │                     │              │   (8004)    │
     │                     │              └─────────────┘
     │                     │                     │
     │                     │                     ▼
     ▼                     ▼              ┌─────────────┐
┌─────────────┐     ┌──────────────┐     │ Provenance  │
│  WidgetAPI  │     │   Frontend   │     │   (8006)    │
│   (8005)    │◀────│    (3000)    │     └─────────────┘
└─────────────┘     └──────────────┘
```

### Microservices

| Service | Port | Description |
|---------|------|-------------|
| **ParserProduit** | 8000 | Extraction de texte depuis PDF/images |
| **NLPIngrédients** | 8001 | Extraction et normalisation d'entités (ingrédients, emballage, origine) |
| **LCALite** | 8002 | Calcul des impacts environnementaux (ACV) |
| **Scoring** | 8004 | Calcul du score final (A-E) et grade |
| **WidgetAPI** | 8005 | API publique pour consulter les scores |
| **Provenance** | 8006 | Traçabilité et historique des calculs |

### Bases de données

Chaque microservice a sa propre base PostgreSQL :

- `ecolabel_ms` (Port 5433) - ParserProduit
- `ecolabel_nlp` (Port 5434) - NLPIngrédients
- `eco_lca` (Port 5435) - LCALite
- `ecolabel_scoring` (Port 5436) - Scoring
- `ecolabel_widget` (Port 5437) - WidgetAPI
- `provenance_db` (Port 5438) - Provenance

## ✨ Fonctionnalités

- ✅ **Extraction automatique** : Analyse de PDF et d'images avec OCR
- ✅ **Traitement NLP** : Reconnaissance et normalisation d'entités (ingrédients, emballage, labels)
- ✅ **Calcul ACV** : Impact environnemental (CO2, eau, énergie)
- ✅ **Scoring intelligent** : Attribution d'un grade A-E avec confiance
- ✅ **API RESTful** : Endpoints pour intégration externe
- ✅ **Frontend React** : Interface utilisateur moderne
- ✅ **Traçabilité** : Historique complet des calculs

## 🚀 Démarrage rapide

### Prérequis

- Docker Desktop installé et démarré
- Au moins 4 GB de RAM disponible
- Ports 8000-8006, 5433-5438, 9000-9001 disponibles

### Installation avec Docker Compose (Recommandé)

#### Option 1 : Architecture multi-conteneurs (Production)

```bash
# 1. Cloner ou télécharger le projet
cd EcoLabel-MS

# 2. Construire les images
docker-compose build

# 3. Démarrer tous les services
docker-compose up -d

# 4. Attendre 30 secondes que les bases de données soient prêtes
timeout /t 30  # Windows
sleep 30       # Linux/Mac

# 5. Initialiser les données de référence
init-databases.bat  # Windows
./init-databases.sh # Linux/Mac

# 6. Vérifier que tout fonctionne
docker-compose ps
```

#### Option 2 : Conteneur unique (Développement)

```bash
# 1. Construire l'image unique
docker-compose -f docker-compose.all-services.yml build

# 2. Démarrer tous les services
docker-compose -f docker-compose.all-services.yml up -d

# 3. Attendre 30 secondes
timeout /t 30  # Windows
sleep 30       # Linux/Mac

# 4. Initialiser les données de référence
init-databases.bat  # Windows
./init-databases.sh # Linux/Mac
```

### Vérification

Vérifiez que tous les services sont démarrés :

```bash
docker-compose ps
```

Testez les endpoints :

```bash
# ParserProduit
curl http://localhost:8000/

# NLPIngrédients
curl http://localhost:8001/

# LCALite
curl http://localhost:8002/

# Provenance
curl http://localhost:8006/health

# Scoring
curl http://localhost:8004/health

# WidgetAPI
curl http://localhost:8005/
```

Ouvrez les interfaces Swagger :
- http://localhost:8000/docs (ParserProduit)
- http://localhost:8001/docs (NLPIngrédients)
- http://localhost:8003/docs (Provenance)
- http://localhost:8005/docs (WidgetAPI)

## 📖 Utilisation

### Insertion d'un produit via PDF

```bash
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@produit.pdf"
```

**Format du PDF attendu :**
```
Nom: Nom du produit
Marque: Marque
Catégorie: Catégorie
GTIN: 3012345678901
Poids net: 500 g
Ingredients (INCI): Liste des ingrédients
Emballage: Description de l'emballage
Origine: Pays d'origine
Destination: Pays de destination
Transport: Mode et distance (ex: Maritime, Distance ~10000 km)
Labels: Labels présents
```

**Réponse :**
```json
{
  "product": {
    "id": 1,
    "nom": "Nom du produit",
    "marque": "Marque",
    ...
  },
  "nlp": {
    "ingredients": [...],
    "packaging": [...],
    ...
  },
  "lca": {
    "co2_kg": 0.3357,
    "water_l": 14.9045,
    "energy_mj": 0.7072,
    "score": {
      "numeric_score": 76.43,
      "grade": "B",
      "confidence": 0.9
    }
  }
}
```

### Consulter les scores

```bash
# Liste de tous les produits
curl http://localhost:8005/public/products

# Détails d'un produit spécifique
curl http://localhost:8005/public/product/1
```

### Interface Web

Ouvrez votre navigateur sur : http://localhost:3000

## 🔧 Configuration

### Variables d'environnement

Les variables d'environnement sont définies dans `docker-compose.yml`. Principales configurations :

- **Bases de données** : User `postgres`, Password `admin`
- **Ports** : Configurables via variables d'environnement
- **MinIO** : Stockage objet optionnel (Ports 9000, 9001)

### Personnalisation

Pour modifier les ports, créez un fichier `.env` :

```env
PARSER_PORT=8000
NLP_PORT=8001
LCA_PORT=8002
SCORING_PORT=8004
WIDGET_PORT=8005
PROVENANCE_PORT=8006
```

## 📁 Structure du projet

```
EcoLabel-MS/
├── ParserProduit/          # MS1 - Extraction PDF/OCR
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── services/
│   └── Dockerfile
├── NLPIngrédients/         # MS2 - Traitement NLP
│   ├── app/
│   │   ├── main.py
│   │   ├── nlp_pipeline.py
│   │   └── lca_mapping.py
│   └── Dockerfile
├── LCALite/                # MS3 - Calcul ACV
│   ├── app/
│   │   ├── main.py
│   │   └── lca_calculator.py
│   └── Dockerfile
├── Scoring/                # MS4 - Calcul du score
│   ├── app/
│   │   ├── main.py
│   │   └── scoring_service.py
│   └── Dockerfile
├── WidgetAPI/              # MS5 - API publique
│   ├── app/
│   │   ├── main.py
│   │   └── routes/
│   ├── WidgetAPI_frontend/ # Frontend React
│   └── Dockerfile
├── Provenance/             # MS6 - Traçabilité
│   ├── app/
│   │   ├── main.py
│   │   └── routers/
│   └── Dockerfile
├── docker-compose.yml      # Configuration multi-conteneurs
├── docker-compose.all-services.yml  # Configuration conteneur unique
├── init-databases.sh       # Script d'initialisation (Linux/Mac)
├── init-databases.bat      # Script d'initialisation (Windows)
└── README.md              # Ce fichier
```

## 🛠️ Développement

### Commandes utiles

```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer un service
docker-compose restart parser-produit

# Voir l'état
docker-compose ps

# Voir l'utilisation des ressources
docker stats
```

### Logs par service

```bash
docker-compose logs -f parser-produit
docker-compose logs -f nlp-ingredients
docker-compose logs -f lca-lite
docker-compose logs -f scoring
docker-compose logs -f widget-api
docker-compose logs -f provenance
```

### Accès aux bases de données

```bash
# Se connecter à une base de données
psql -h localhost -p 5433 -U postgres -d ecolabel_ms  # Parser
psql -h localhost -p 5434 -U postgres -d ecolabel_nlp  # NLP
psql -h localhost -p 5435 -U postgres -d eco_lca       # LCA
psql -h localhost -p 5436 -U postgres -d ecolabel_scoring  # Scoring
psql -h localhost -p 5437 -U postgres -d ecolabel_widget    # Widget
psql -h localhost -p 5438 -U postgres -d provenance_db      # Provenance

# Identifiants : postgres / admin
```

## 📊 Données de référence

Le système nécessite des données de référence pour fonctionner :

- **Facteurs LCA** : Impact CO2/eau/énergie des ingrédients, emballages, transports
- **Taxonomies NLP** : Mappings entre noms d'ingrédients et codes LCA
- **Labels** : Reconnaissance des labels environnementaux

Ces données sont initialisées automatiquement via les scripts `init-databases.sh` ou `init-databases.bat`.

## 🧪 Tests

### Test d'un produit exemple

```bash
# Créer un fichier test_product.txt
echo "Nom: Test Product
Marque: Test Brand
Poids net: 500 g
Ingredients (INCI): Water, Glycerin
Emballage: PET 50 g
Origine: France
Transport: Routier, Distance ~100 km" > test_product.txt

# Convertir en PDF puis uploader
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@test_product.pdf"
```

## 🐛 Dépannage

### Les services ne démarrent pas

1. Vérifiez que Docker Desktop est démarré
2. Vérifiez les logs : `docker-compose logs`
3. Vérifiez que les ports ne sont pas déjà utilisés

### Erreur de connexion à la base de données

1. Attendez que les bases soient "healthy" : `docker-compose ps`
2. Vérifiez les variables d'environnement DATABASE_URL
3. Attendez 30-60 secondes après le démarrage

### Le score n'est pas calculé

1. Vérifiez que les données de référence sont initialisées
2. Vérifiez les logs du service LCA : `docker-compose logs -f lca-lite`
3. Vérifiez que le transport est calculé dans les logs

### Les facteurs LCA ne sont pas trouvés

Exécutez le script d'initialisation :
```bash
init-databases.bat  # Windows
./init-databases.sh # Linux/Mac
```

## 📚 Documentation

- `README_DOCKER.md` - Guide complet de déploiement Docker
- `QUICK_START_DOCKER.md` - Démarrage rapide
- `GUIDE_INSERTION_PRODUITS.md` - Guide d'insertion de produits
- `GUIDE_CONTENEUR_UNIQUE.md` - Utilisation du conteneur unique
- `GUIDE_ETAPE_PAR_ETAPE.md` - Guide pas à pas
- `DEPLOYMENT_CHECKLIST.md` - Checklist de déploiement

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre nom / Équipe

## 🙏 Remerciements

- FastAPI pour le framework web
- spaCy pour le traitement NLP
- PostgreSQL pour les bases de données
- Docker pour la containerisation

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Vérifiez les logs : `docker-compose logs -f`

---



