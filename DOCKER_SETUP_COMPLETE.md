# 🐳 Configuration Docker complète - EcoLabel-MS

## 📁 Fichiers créés

### Configuration Docker
- ✅ `docker-compose.yml` - Orchestration de tous les services
- ✅ `ParserProduit/Dockerfile` - Image pour MS1
- ✅ `NLPIngrédients/Dockerfile` - Image pour MS2
- ✅ `LCALite/Dockerfile` - Image pour MS3
- ✅ `Provenance/Dockerfile` - Image pour MS6
- ✅ `Scoring/Dockerfile` - Image pour MS4
- ✅ `WidgetAPI/Dockerfile` - Image pour MS5
- ✅ `WidgetAPI/WidgetAPI_frontend/Dockerfile` - Image pour le frontend

### Scripts d'initialisation
- ✅ `init-databases.sh` - Script Linux/Mac pour initialiser les BDD
- ✅ `init-databases.bat` - Script Windows pour initialiser les BDD

### Documentation
- ✅ `README_DOCKER.md` - Guide complet de déploiement
- ✅ `QUICK_START_DOCKER.md` - Guide de démarrage rapide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Checklist de déploiement
- ✅ `GUIDE_INSERTION_PRODUITS.md` - Guide d'insertion manuelle via PDF
- ✅ `EXEMPLE_INSERTION_PRODUIT.md` - Exemples d'insertion (curl, Python, etc.)
- ✅ `.env.example` - Exemple de configuration
- ✅ `Makefile` - Commandes utiles
- ✅ `.dockerignore` - Fichiers à ignorer lors du build

## 🚀 Démarrage rapide

### 1. Démarrer tous les services

```bash
docker-compose up -d
```

### 2. Attendre que les bases de données soient prêtes (30 secondes)

```bash
sleep 30
```

### 3. Initialiser les données de référence

**Linux/Mac:**
```bash
chmod +x init-databases.sh
./init-databases.sh
```

**Windows:**
```bash
init-databases.bat
```

### 4. Vérifier que tout fonctionne

```bash
# Voir l'état des services
docker-compose ps

# Tester les endpoints
curl http://localhost:8000/  # ParserProduit
curl http://localhost:8001/  # NLPIngrédients
curl http://localhost:8002/  # LCALite
curl http://localhost:8004/health  # Scoring
curl http://localhost:8005/  # WidgetAPI
```

## 📊 Architecture Docker

```
┌─────────────────────────────────────────────────┐
│           Docker Network: ecolabel-network     │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │ db-parser    │    │ db-nlp       │         │
│  │ (PostgreSQL│    │ (PostgreSQL) │         │
│  │  Port: 5433) │    │  Port: 5434) │         │
│  └──────────────┘    └──────────────┘         │
│         │                    │                 │
│  ┌──────▼──────┐    ┌───────▼────────┐        │
│  │ parser-     │    │ nlp-           │        │
│  │ produit     │    │ ingredients    │        │
│  │ :8000       │───▶│ :8001          │        │
│  └─────────────┘    └───────────────┘        │
│                          │                     │
│  ┌──────────────┐    ┌──▼────────────┐        │
│  │ db-lca       │    │ lca-lite      │        │
│  │ (PostgreSQL) │    │ :8002         │        │
│  │ Port: 5435   │◀───└───────────────┘        │
│  └──────────────┘         │                    │
│                            │                    │
│  ┌──────────────┐    ┌────▼──────────┐        │
│  │ db-scoring   │    │ scoring       │        │
│  │ (PostgreSQL) │◀───│ :8004         │        │
│  │ Port: 5436   │    └───────────────┘        │
│  └──────────────┘                             │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │ db-widget    │    │ widget-api   │         │
│  │ (PostgreSQL) │    │ :8005        │         │
│  │ Port: 5437   │◀───└──────────────┘         │
│  └──────────────┘                             │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │ db-provenance│    │ provenance   │         │
│  │ (PostgreSQL) │    │ :8006        │         │
│  │ Port: 5438   │◀───└──────────────┘         │
│  └──────────────┘         │                    │
│                            │                    │
│  ┌──────────────┐    ┌────▼──────────┐        │
│  │ minio-data   │    │ minio         │        │
│  │ (Storage)    │◀───│ :9000, :9001  │        │
│  └──────────────┘    └───────────────┘        │
│                                                 │
│  ┌──────────────┐                              │
│  │ widget-      │                              │
│  │ frontend     │                              │
│  │ :3000        │                              │
│  └──────────────┘                              │
└─────────────────────────────────────────────────┘
```

## 🔧 Configuration des URLs entre services

Les services communiquent via les noms de conteneurs Docker :

- `parser-produit` → `nlp-ingredients:8001`
- `nlp-ingredients` → `lca-lite:8002`
- `lca-lite` → `scoring:8004`
- `provenance` → `minio:9000` (optionnel, pour stockage d'artefacts)

Ces URLs sont configurées via les variables d'environnement dans `docker-compose.yml`.

## 📝 Notes importantes

1. **Volumes persistants** : Les données des bases de données sont stockées dans des volumes Docker nommés
2. **Hot reload** : Les services sont configurés avec `--reload` pour le développement
3. **Healthchecks** : Les bases de données ont des healthchecks pour s'assurer qu'elles sont prêtes
4. **Dépendances** : Les services démarrent dans le bon ordre grâce à `depends_on`

## 🎯 Prochaines étapes

1. **Tester le pipeline complet** avec un produit PDF
2. **Vérifier les logs** si quelque chose ne fonctionne pas
3. **Ajuster les valeurs MAX** dans Scoring si nécessaire
4. **Insérer plus de données de référence** selon vos besoins

## 📚 Documentation

- `README_DOCKER.md` - Guide complet
- `QUICK_START_DOCKER.md` - Démarrage rapide
- `DEPLOYMENT_CHECKLIST.md` - Checklist de déploiement
- `GUIDE_INSERTION_PRODUITS.md` - **Guide d'insertion manuelle des produits via PDF**
- `EXEMPLE_INSERTION_PRODUIT.md` - Exemples pratiques d'insertion

## 🆘 Support

En cas de problème :
1. Consultez les logs : `docker-compose logs -f [service-name]`
2. Vérifiez l'état : `docker-compose ps`
3. Vérifiez les ressources : `docker stats`

