# Guide de déploiement Docker - EcoLabel-MS

Ce guide explique comment déployer tous les microservices EcoLabel-MS avec Docker.

## Architecture

- **ParserProduit** (MS1) : Port 8000 - Base de données `ecolabel_ms`
- **NLPIngrédients** (MS2) : Port 8001 - Base de données `ecolabel_nlp`
- **LCALite** (MS3) : Port 8002 - Base de données `eco_lca`
- **Scoring** (MS4) : Port 8004 - Base de données `ecolabel_scoring`
- **WidgetAPI** (MS5) : Port 8005 - Base de données `ecolabel_widget`
- **Provenance** (MS6) : Port 8006 - Base de données `provenance_db`
- **MinIO** : Ports 9000 (API), 9001 (Console) - Stockage objet (optionnel)
- **Frontend** : Port 3000 (optionnel)

## Prérequis

- Docker Desktop installé
- Docker Compose installé
- Au moins 4 GB de RAM disponible

## Démarrage rapide

### 1. Démarrer tous les services

```bash
docker-compose up -d
```

### 2. Vérifier que tous les services sont démarrés

```bash
docker-compose ps
```

### 3. Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f parser-produit
docker-compose logs -f nlp-ingredients
docker-compose logs -f lca-lite
docker-compose logs -f scoring
docker-compose logs -f widget-api
```

## Initialisation des bases de données

Les bases de données sont créées automatiquement au démarrage. Cependant, vous devez initialiser les **données de référence** (facteurs LCA, taxonomies) **une seule fois**.

### ⚠️ Important : Distinction entre données de référence et produits

- **Données de référence** (facteurs LCA, taxonomies) → Initialisées **une seule fois** via script
- **Produits** → Insérés **manuellement** via upload de PDF (voir `GUIDE_INSERTION_PRODUITS.md`)

### Initialisation des données de référence

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

Ces scripts insèrent :
- Les facteurs LCA (ingrédients, emballage, transport)
- Les taxonomies NLP (ingrédients, emballage, labels)

**⚠️ Sans ces données, le système ne peut pas calculer les scores !**

## Accès aux services

Une fois démarrés, les services sont accessibles sur :

- **ParserProduit** : http://localhost:8000
- **NLPIngrédients** : http://localhost:8001
- **LCALite** : http://localhost:8002
- **Provenance** : http://localhost:8006
- **Scoring** : http://localhost:8004
- **WidgetAPI** : http://localhost:8005
- **MinIO Console** : http://localhost:9001 (minioadmin/minioadmin)
- **Frontend** : http://localhost:3000

## Accès aux bases de données

Les bases de données sont accessibles sur les ports suivants :

- **db-parser** : localhost:5433
- **db-nlp** : localhost:5434
- **db-lca** : localhost:5435
- **db-scoring** : localhost:5436
- **db-widget** : localhost:5437
- **db-provenance** : localhost:5438

**Identifiants** :
- User: `postgres`
- Password: `admin`

### Exemple de connexion

```bash
psql -h localhost -p 5433 -U postgres -d ecolabel_ms
```

## Commandes utiles

### Arrêter tous les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données)

```bash
docker-compose down -v
```

### Redémarrer un service spécifique

```bash
docker-compose restart parser-produit
```

### Reconstruire les images

```bash
docker-compose build
docker-compose up -d
```

### Voir l'utilisation des ressources

```bash
docker stats
```

## Configuration

### Variables d'environnement

Vous pouvez créer un fichier `.env` à la racine du projet pour personnaliser les configurations :

```env
# Bases de données
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin

# Ports des services
PARSER_PORT=8000
NLP_PORT=8001
LCA_PORT=8002
SCORING_PORT=8004
WIDGET_PORT=8005
```

### Modifier les ports

Si vous voulez changer les ports, modifiez le fichier `docker-compose.yml` :

```yaml
ports:
  - "VOTRE_PORT:8000"  # Port externe:Port interne
```

## Dépannage

### Les services ne démarrent pas

1. Vérifiez les logs : `docker-compose logs`
2. Vérifiez que les ports ne sont pas déjà utilisés
3. Vérifiez que Docker a assez de ressources (RAM, CPU)

### Erreurs de connexion à la base de données

1. Attendez que les bases de données soient prêtes (healthcheck)
2. Vérifiez les variables d'environnement dans `docker-compose.yml`
3. Vérifiez les logs des bases de données : `docker-compose logs db-parser`

### Les tables ne sont pas créées

Les tables sont créées automatiquement au démarrage si le code utilise `Base.metadata.create_all()`. Sinon, créez des scripts d'initialisation.

## Données de référence à insérer

Après le premier démarrage, vous devez insérer les données de référence dans chaque base :

### Base LCA (eco_lca)

```sql
-- Facteurs d'ingrédients
INSERT INTO lca_ingredient_factors (code, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg) VALUES
('WATER', 0.001, 0.1, 0.01),
('SLES', 2.5, 15.0, 8.0),
('GLYCERIN', 1.8, 12.0, 6.0);

-- Facteurs d'emballage
INSERT INTO lca_packaging_factors (material, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg) VALUES
('PET', 2.5, 15.0, 4.0),
('PP', 2.8, 18.0, 4.5),
('PLASTIC_GENERIC', 2.6, 16.0, 4.2),
('GLASS_GENERIC', 1.2, 8.0, 2.5),
('CARDBOARD_GENERIC', 1.5, 10.0, 3.0);

-- Facteurs de transport
INSERT INTO lca_transport_factors (mode, co2_kg_per_tkm, water_l_per_tkm, energy_mj_per_tkm) VALUES
('SEA', 0.015, 0.1, 0.05),
('ROAD', 0.1, 0.5, 0.3),
('AIR', 0.5, 2.0, 1.0);
```

### Base NLP (ecolabel_nlp)

```sql
-- Taxonomie d'ingrédients
INSERT INTO ingredient_taxonomy (name, synonyms, eco_ref_code) VALUES
('Aqua', 'water;eau', 'WATER'),
('Sodium Laureth Sulfate', 'sles;SLES', 'SLES'),
('Glycerin', 'glycerine', 'GLYCERIN');

-- Taxonomie d'emballage
INSERT INTO packaging_taxonomy (name, synonyms, eco_ref_code) VALUES
('PET', 'polyethylene terephthalate', 'PET'),
('PP', 'polypropylene', 'PP'),
('Plastique', 'plastic', 'PLASTIC_GENERIC');
```

## Production

Pour la production, modifiez :

1. **Sécurité** : Changez les mots de passe par défaut
2. **Volumes** : Utilisez des volumes nommés persistants
3. **Ressources** : Limitez les ressources avec `deploy.resources`
4. **Logs** : Configurez la rotation des logs
5. **HTTPS** : Ajoutez un reverse proxy (nginx) avec SSL

## Support

En cas de problème, consultez les logs :
```bash
docker-compose logs -f [nom-du-service]
```

