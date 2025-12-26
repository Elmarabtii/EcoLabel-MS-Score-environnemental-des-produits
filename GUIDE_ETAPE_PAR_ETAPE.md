# 📋 Guide étape par étape - Démarrage Docker EcoLabel-MS

## ✅ Prérequis

Avant de commencer, vérifiez que vous avez :

- [ ] Docker Desktop installé et **démarré**
- [ ] Au moins 4 GB de RAM disponible
- [ ] Les ports 8000-8005, 5433-5438, 9000-9001 libres

---

## 🚀 ÉTAPE 1 : Ouvrir le terminal

### Windows :
1. Appuyez sur `Windows + R`
2. Tapez `powershell` ou `cmd`
3. Appuyez sur `Entrée`

### Linux/Mac :
1. Ouvrez le terminal (Ctrl+Alt+T ou Cmd+Space puis "Terminal")

---

## 📁 ÉTAPE 2 : Naviguer vers le dossier du projet

```bash
cd C:\Users\elmar\Downloads\EcoLabel-MS
```

**Vérification :** Vous devriez voir le fichier `docker-compose.yml` dans ce dossier.

```bash
# Vérifier que vous êtes au bon endroit
dir docker-compose.yml    # Windows
# ou
ls docker-compose.yml     # Linux/Mac
```

---

## 🔧 ÉTAPE 3 : Vérifier que Docker fonctionne

```bash
docker --version
docker-compose --version
```

**Résultat attendu :** Vous devriez voir les versions de Docker et Docker Compose.

Si vous obtenez une erreur, **démarrez Docker Desktop** et réessayez.

---

## 🏗️ ÉTAPE 4 : Construire les images Docker (première fois uniquement)

Cette étape peut prendre 5-10 minutes la première fois.

```bash
docker-compose build
```

**Ce qui se passe :**
- Docker construit les images pour chaque microservice
- Télécharge les dépendances Python
- Installe les packages nécessaires

**Résultat attendu :** Vous verrez des messages comme :
```
Building parser-produit...
Building nlp-ingredients...
...
Successfully built ...
```

**⚠️ Note :** Cette étape n'est nécessaire que la première fois. Les fois suivantes, vous pouvez passer directement à l'étape 5.

---

## 🚀 ÉTAPE 5 : Démarrer tous les services

```bash
docker-compose up -d
```

**Ce qui se passe :**
- Démarre toutes les bases de données PostgreSQL (6 bases)
- Démarre tous les microservices (6 services)
- Démarre MinIO (stockage objet)
- Démarre le frontend (optionnel)

**Résultat attendu :** Vous verrez :
```
Creating network "ecolabel-network" ... done
Creating ecolabel-db-parser ... done
Creating ecolabel-db-nlp ... done
...
Creating ecolabel-parser ... done
Creating ecolabel-nlp ... done
...
```

---

## ⏳ ÉTAPE 6 : Attendre que les services soient prêts

**Attendez 30 secondes** pour que toutes les bases de données soient prêtes.

### Windows :
```powershell
timeout /t 30
```

### Linux/Mac :
```bash
sleep 30
```

**Pourquoi attendre ?** Les bases de données ont besoin de temps pour initialiser avant d'accepter des connexions.

---

## ✅ ÉTAPE 7 : Vérifier que tous les services sont démarrés

```bash
docker-compose ps
```

**Résultat attendu :** Tous les services doivent être "Up" et les bases de données "healthy" :

```
NAME                      STATUS
ecolabel-db-parser        Up (healthy)
ecolabel-db-nlp           Up (healthy)
ecolabel-db-lca           Up (healthy)
ecolabel-db-scoring       Up (healthy)
ecolabel-db-widget        Up (healthy)
ecolabel-db-provenance    Up (healthy)
ecolabel-parser           Up
ecolabel-nlp              Up
ecolabel-lca              Up
ecolabel-provenance       Up
ecolabel-scoring          Up
ecolabel-widget-api       Up
ecolabel-minio            Up
ecolabel-frontend         Up
```

**Si un service n'est pas "Up" :** Consultez les logs (étape 8).

---

## 📊 ÉTAPE 8 : Voir les logs (optionnel mais recommandé)

```bash
docker-compose logs -f
```

**Ce qui se passe :** Vous voyez les logs de tous les services en temps réel.

**Pour arrêter :** Appuyez sur `Ctrl + C`

**Pour voir les logs d'un service spécifique :**
```bash
docker-compose logs -f parser-produit
docker-compose logs -f nlp-ingredients
docker-compose logs -f provenance
```

---

## 🗄️ ÉTAPE 9 : Initialiser les données de référence

Cette étape est **OBLIGATOIRE** avant de pouvoir utiliser le système.

### Windows :
```bash
init-databases.bat
```

### Linux/Mac :
```bash
chmod +x init-databases.sh
./init-databases.sh
```

**Ce qui se passe :**
- Insère les facteurs LCA (ingrédients, emballage, transport)
- Insère les taxonomies NLP (ingrédients, emballage, labels)

**Résultat attendu :**
```
🚀 Initialisation des bases de données EcoLabel-MS...
⏳ Attente du démarrage des bases de données...
📊 Initialisation de la base LCA...
📊 Initialisation de la base NLP...
✅ Initialisation terminée !
```

**⚠️ Important :** Si vous voyez des erreurs de connexion, attendez encore 10 secondes et réessayez.

---

## 🧪 ÉTAPE 10 : Tester que tous les services répondent

### Option 1 : Avec curl (si disponible)

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

### Option 2 : Avec le navigateur

Ouvrez votre navigateur et allez sur :
- http://localhost:8000/docs (ParserProduit - Swagger UI)
- http://localhost:8001/docs (NLPIngrédients)
- http://localhost:8002/docs (LCALite)
- http://localhost:8006/docs (Provenance)
- http://localhost:8004/docs (Scoring)
- http://localhost:8005/docs (WidgetAPI)
- http://localhost:3000 (Frontend)

**Résultat attendu :** Vous devriez voir les interfaces Swagger ou des réponses JSON.

---

## ✅ ÉTAPE 11 : Vérification finale

### Vérifier les bases de données

```bash
# Se connecter à une base de données (exemple : LCA)
docker exec -it ecolabel-db-lca psql -U postgres -d eco_lca

# Dans psql, vérifier les tables
\dt

# Vérifier les facteurs de transport
SELECT * FROM lca_transport_factors;

# Quitter psql
\q
```

### Vérifier les volumes Docker

```bash
docker volume ls
```

Vous devriez voir :
- `ecolabel-ms_db-parser-data`
- `ecolabel-ms_db-nlp-data`
- `ecolabel-ms_db-lca-data`
- `ecolabel-ms_db-scoring-data`
- `ecolabel-ms_db-widget-data`
- `ecolabel-ms_db-provenance-data`
- `ecolabel-ms_minio-data`

---

## 🎯 ÉTAPE 12 : Tester avec un produit (optionnel)

Une fois tout démarré, vous pouvez tester l'insertion d'un produit :

```bash
# Créer un fichier test_product.txt avec le contenu suivant :
# Nom: Test Product
# Marque: Test Brand
# Catégorie: Test
# Poids net: 500 g
# Ingredients (INCI): Water, Glycerin
# Emballage: PET 50 g
# Origine: France
# Destination: France
# Transport: Routier, Distance ~100 km

# Puis convertir en PDF ou utiliser directement avec curl
curl -X POST "http://localhost:8000/parse-and-nlp" \
  -F "file=@test_product.pdf"
```

---

## 🛑 ARRÊTER LES SERVICES

Quand vous avez terminé :

```bash
docker-compose down
```

**Pour arrêter et supprimer toutes les données :**
```bash
docker-compose down -v
```

⚠️ **Attention :** `-v` supprime tous les volumes, donc toutes les données seront perdues !

---

## 🔄 REDÉMARRER UN SERVICE

Si un service ne fonctionne pas :

```bash
# Redémarrer un service spécifique
docker-compose restart parser-produit

# Voir les logs pour comprendre l'erreur
docker-compose logs parser-produit
```

---

## 🐛 DÉPANNAGE

### Problème : "Port already in use"

**Solution :**
```bash
# Voir quels ports sont utilisés
netstat -an | findstr "8000"  # Windows
# ou
lsof -i :8000                 # Linux/Mac

# Arrêter le processus qui utilise le port ou changer le port dans docker-compose.yml
```

### Problème : "Cannot connect to Docker daemon"

**Solution :**
1. Vérifiez que Docker Desktop est démarré
2. Redémarrez Docker Desktop
3. Réessayez

### Problème : Les services ne démarrent pas

**Solution :**
```bash
# Voir les logs d'erreur
docker-compose logs

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

### Problème : Les bases de données ne sont pas "healthy"

**Solution :**
```bash
# Attendre plus longtemps (1 minute)
timeout /t 60  # Windows
sleep 60       # Linux/Mac

# Vérifier les logs de la base de données
docker-compose logs db-parser
```

---

## 📝 RÉSUMÉ DES COMMANDES ESSENTIELLES

```bash
# 1. Construire (première fois)
docker-compose build

# 2. Démarrer
docker-compose up -d

# 3. Attendre 30 secondes
timeout /t 30  # Windows
sleep 30       # Linux/Mac

# 4. Initialiser les données
init-databases.bat  # Windows
./init-databases.sh # Linux/Mac

# 5. Vérifier
docker-compose ps

# 6. Voir les logs
docker-compose logs -f

# 7. Arrêter
docker-compose down
```

---

## ✅ CHECKLIST FINALE

- [ ] Docker Desktop est démarré
- [ ] Tous les services sont "Up" (`docker-compose ps`)
- [ ] Toutes les bases de données sont "healthy"
- [ ] Les données de référence sont initialisées
- [ ] Les endpoints répondent (test avec curl ou navigateur)
- [ ] Les logs ne montrent pas d'erreurs critiques

**Si toutes les cases sont cochées, votre système est prêt ! 🎉**

---

## 📚 PROCHAINES ÉTAPES

Une fois tout démarré, consultez :
- `GUIDE_INSERTION_PRODUITS.md` - Comment insérer des produits via PDF
- `README_DOCKER.md` - Documentation complète
- `QUICK_START_DOCKER.md` - Guide rapide

