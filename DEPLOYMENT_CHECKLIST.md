# ✅ Checklist de déploiement Docker

## Avant de démarrer

- [ ] Docker Desktop installé et démarré
- [ ] Au moins 4 GB de RAM disponible
- [ ] Ports 8000-8005 et 5433-5437 disponibles

## Étapes de déploiement

### 1. Configuration initiale

- [ ] Copier `.env.example` vers `.env` (optionnel)
- [ ] Vérifier que tous les Dockerfiles sont présents
- [ ] Vérifier que `docker-compose.yml` est à la racine

### 2. Construction et démarrage

```bash
# Construire les images
docker-compose build

# Démarrer tous les services
docker-compose up -d
```

- [ ] Vérifier que tous les conteneurs sont "Up"
- [ ] Vérifier que toutes les bases de données sont "healthy"

### 3. Initialisation des données de référence (une seule fois)

⚠️ **Important** : Cette étape initialise les **données de référence** (facteurs LCA, taxonomies) nécessaires au calcul des scores. Les **produits** seront insérés manuellement via PDF (voir étape 5).

**Linux/Mac:**
```bash
chmod +x init-databases.sh
./init-databases.sh
```

**Windows:**
```bash
init-databases.bat
```

- [ ] Vérifier que les données de référence sont insérées
- [ ] Vérifier les facteurs de transport (SEA, ROAD, AIR)
- [ ] Vérifier les taxonomies d'ingrédients et d'emballage

### 4. Vérification des services

```bash
# Tester chaque endpoint
curl http://localhost:8000/  # ParserProduit
curl http://localhost:8001/  # NLPIngrédients
curl http://localhost:8002/  # LCALite
curl http://localhost:8004/health  # Scoring
curl http://localhost:8005/  # WidgetAPI
```

- [ ] Tous les services répondent correctement

### 5. Test d'insertion manuelle d'un produit via PDF

Les produits sont insérés **manuellement** via upload de PDF. Voir `GUIDE_INSERTION_PRODUITS.md` pour plus de détails.

```bash
# Tester avec un produit PDF
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@test_product.pdf"
```

- [ ] Le pipeline complet fonctionne
- [ ] Un score est généré
- [ ] Les données sont sauvegardées dans les bases
- [ ] Le produit est visible via `/public/products`

## Données de référence à vérifier

### Base LCA (eco_lca)

```sql
-- Vérifier les facteurs de transport
SELECT * FROM lca_transport_factors;
-- Doit contenir: SEA, ROAD, AIR

-- Vérifier les facteurs d'emballage
SELECT * FROM lca_packaging_factors;
-- Doit contenir: PET, PP, PLASTIC_GENERIC, GLASS_GENERIC, CARDBOARD_GENERIC

-- Vérifier les facteurs d'ingrédients
SELECT * FROM lca_ingredient_factors;
-- Doit contenir: WATER, SLES, GLYCERIN, etc.
```

### Base NLP (ecolabel_nlp)

```sql
-- Vérifier les taxonomies
SELECT * FROM ingredient_taxonomy;
SELECT * FROM packaging_taxonomy;
SELECT * FROM label_taxonomy;
```

## Problèmes courants et solutions

### ❌ Les services ne démarrent pas

**Solution:**
1. Vérifier les logs : `docker-compose logs [service-name]`
2. Vérifier les ports disponibles
3. Vérifier que Docker a assez de ressources

### ❌ Erreur de connexion à la base de données

**Solution:**
1. Attendre que les bases soient "healthy" (healthcheck)
2. Vérifier les variables d'environnement DATABASE_URL
3. Vérifier que les noms de conteneurs sont corrects

### ❌ Le transport n'est pas calculé

**Solution:**
1. Vérifier que les facteurs de transport sont dans la base LCA
2. Vérifier les logs du service LCA
3. Vérifier que le mode de transport existe (SEA, ROAD, etc.)

### ❌ Les scores sont tous A

**Solution:**
1. Vérifier que le transport est calculé
2. Ajuster MAX_CO2 dans Scoring/app/scoring_service.py
3. Vérifier que les données de référence sont insérées

## Commandes de maintenance

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Redémarrer un service
docker-compose restart [service-name]

# Reconstruire un service
docker-compose build [service-name]
docker-compose up -d [service-name]

# Arrêter tout
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v
```

## Sauvegarde des données

```bash
# Sauvegarder une base de données
docker exec ecolabel-db-lca pg_dump -U postgres eco_lca > backup_lca.sql

# Restaurer une base de données
docker exec -i ecolabel-db-lca psql -U postgres eco_lca < backup_lca.sql
```

## Monitoring

```bash
# Voir l'utilisation des ressources
docker stats

# Voir l'état des services
docker-compose ps

# Voir les logs d'un service
docker-compose logs -f [service-name]
```

