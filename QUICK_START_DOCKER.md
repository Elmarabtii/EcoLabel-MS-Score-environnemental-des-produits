# 🚀 Guide de démarrage rapide Docker - EcoLabel-MS

## Installation en 3 étapes

### 1. Prérequis
- Docker Desktop installé et démarré
- Au moins 4 GB de RAM disponible

### 2. Démarrer tous les services

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Ou avec le Makefile (si disponible)
make up
```

### 3. Initialiser les données de référence (une seule fois)

⚠️ **Important** : Les données de référence (facteurs LCA, taxonomies) doivent être initialisées **une seule fois** avant de pouvoir insérer des produits.

```bash
# Attendre que tous les services soient prêts (30 secondes)
sleep 30

# Initialiser les données de référence
chmod +x init-databases.sh
./init-databases.sh

# Ou avec le Makefile
make init-db
```

**Note** : Les produits seront insérés **manuellement** via upload de PDF. Voir `GUIDE_INSERTION_PRODUITS.md` pour plus de détails.

## ✅ Vérification

### Vérifier que tous les services sont démarrés

```bash
docker-compose ps
```

Tous les services doivent être "Up" et "healthy".

### Tester les endpoints

```bash
# ParserProduit
curl http://localhost:8000/

# NLPIngrédients
curl http://localhost:8001/

# LCALite
curl http://localhost:8002/

# Scoring
curl http://localhost:8004/health

# WidgetAPI
curl http://localhost:8005/
```

### Ou utiliser le Makefile

```bash
make test
```

## 📊 Accès aux services

| Service | URL | Port |
|---------|-----|------|
| ParserProduit | http://localhost:8000 | 8000 |
| NLPIngrédients | http://localhost:8001 | 8001 |
| LCALite | http://localhost:8002 | 8002 |
| Provenance | http://localhost:8006 | 8006 |
| Scoring | http://localhost:8004 | 8004 |
| WidgetAPI | http://localhost:8005 | 8005 |
| MinIO Console | http://localhost:9001 | 9001 |
| Frontend | http://localhost:3000 | 3000 |

## 🗄️ Accès aux bases de données

| Base de données | Port | Commande de connexion |
|----------------|------|----------------------|
| db-parser | 5433 | `psql -h localhost -p 5433 -U postgres -d ecolabel_ms` |
| db-nlp | 5434 | `psql -h localhost -p 5434 -U postgres -d ecolabel_nlp` |
| db-lca | 5435 | `psql -h localhost -p 5435 -U postgres -d eco_lca` |
| db-scoring | 5436 | `psql -h localhost -p 5436 -U postgres -d ecolabel_scoring` |
| db-widget | 5437 | `psql -h localhost -p 5437 -U postgres -d ecolabel_widget` |
| db-provenance | 5438 | `psql -h localhost -p 5438 -U postgres -d provenance_db` |

**Identifiants** : `postgres` / `admin`

## 📝 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Redémarrer un service
docker-compose restart parser-produit

# Reconstruire les images
docker-compose build

# Voir l'utilisation des ressources
docker stats
```

## ⚠️ Problèmes courants

### Les services ne démarrent pas
1. Vérifiez que Docker Desktop est démarré
2. Vérifiez les ports disponibles : `netstat -an | grep LISTEN`
3. Vérifiez les logs : `docker-compose logs [nom-service]`

### Erreurs de connexion entre services
Les services utilisent les noms de conteneurs Docker pour communiquer. Vérifiez que tous les services sont sur le même réseau (`ecolabel-network`).

### Les bases de données ne sont pas initialisées
Exécutez le script d'initialisation : `./init-databases.sh`

## 🎯 Test complet

Une fois tout démarré, testez avec un produit :

```bash
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@votre_produit.pdf"
```

Vous devriez recevoir une réponse complète avec le score EcoScore !

