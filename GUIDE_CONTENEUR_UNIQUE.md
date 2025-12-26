# 🐳 Guide - Conteneur unique pour tous les microservices

## Vue d'ensemble

Cette configuration regroupe **tous les microservices Python** dans un **seul conteneur** au lieu d'avoir 6 conteneurs séparés.

### Architecture

```
┌─────────────────────────────────────────┐
│  Conteneur unique : all-services        │
│  ┌───────────────────────────────────┐  │
│  │ ParserProduit (8000)              │  │
│  │ NLPIngrédients (8001)             │  │
│  │ LCALite (8002)                    │  │
│  │ Scoring (8004)                    │  │
│  │ WidgetAPI (8005)                  │  │
│  │ Provenance (8006)                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ├──> db-parser (5433)
         ├──> db-nlp (5434)
         ├──> db-lca (5435)
         ├──> db-scoring (5436)
         ├──> db-widget (5437)
         ├──> db-provenance (5438)
         └──> minio (9000, 9001)
```

**Avantages :**
- ✅ Un seul conteneur à gérer
- ✅ Moins de ressources utilisées
- ✅ Démarrage plus rapide
- ✅ Communication inter-services via localhost (plus rapide)

**Inconvénients :**
- ⚠️ Si un service plante, tous les services sont dans le même conteneur
- ⚠️ Plus difficile de scaler un service individuellement

---

## 🚀 Démarrage

### Étape 1 : Construire l'image

```bash
docker-compose -f docker-compose.all-services.yml build
```

⏱️ **Temps :** 10-15 minutes (première fois)

### Étape 2 : Démarrer tous les services

```bash
docker-compose -f docker-compose.all-services.yml up -d
```

### Étape 3 : Attendre que les bases de données soient prêtes

```bash
# Windows
timeout /t 30

# Linux/Mac
sleep 30
```

### Étape 4 : Initialiser les données de référence

```bash
# Windows
init-databases.bat

# Linux/Mac
chmod +x init-databases.sh
./init-databases.sh
```

### Étape 5 : Vérifier que tout fonctionne

```bash
# Voir l'état
docker-compose -f docker-compose.all-services.yml ps

# Voir les logs du conteneur unique
docker-compose -f docker-compose.all-services.yml logs -f all-services
```

---

## 📊 Vérification

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

# Provenance
curl http://localhost:8006/health
```

### Voir les logs de chaque service

Les logs de chaque service sont séparés dans le conteneur :

```bash
# Voir tous les logs
docker-compose -f docker-compose.all-services.yml logs -f all-services

# Voir les logs d'un service spécifique (dans le conteneur)
docker exec ecolabel-all-services tail -f /var/log/supervisor/parser-produit.out.log
docker exec ecolabel-all-services tail -f /var/log/supervisor/nlp-ingredients.out.log
docker exec ecolabel-all-services tail -f /var/log/supervisor/lca-lite.out.log
docker exec ecolabel-all-services tail -f /var/log/supervisor/scoring.out.log
docker exec ecolabel-all-services tail -f /var/log/supervisor/widget-api.out.log
docker exec ecolabel-all-services tail -f /var/log/supervisor/provenance.out.log
```

### Voir l'état des processus dans le conteneur

```bash
# Voir tous les processus supervisord
docker exec ecolabel-all-services supervisorctl status
```

---

## 🔧 Gestion des services

### Redémarrer un service spécifique

```bash
# Redémarrer ParserProduit
docker exec ecolabel-all-services supervisorctl restart parser-produit

# Redémarrer NLPIngrédients
docker exec ecolabel-all-services supervisorctl restart nlp-ingredients

# Redémarrer tous les services
docker exec ecolabel-all-services supervisorctl restart all
```

### Arrêter un service

```bash
docker exec ecolabel-all-services supervisorctl stop parser-produit
```

### Démarrer un service

```bash
docker exec ecolabel-all-services supervisorctl start parser-produit
```

### Voir les logs en temps réel

```bash
docker exec ecolabel-all-services supervisorctl tail -f parser-produit
```

---

## 🛑 Arrêter tous les services

```bash
docker-compose -f docker-compose.all-services.yml down
```

**Pour supprimer aussi les volumes :**
```bash
docker-compose -f docker-compose.all-services.yml down -v
```

---

## 🔄 Comparaison avec l'architecture multi-conteneurs

| Aspect | Multi-conteneurs | Conteneur unique |
|--------|------------------|------------------|
| **Nombre de conteneurs** | 6 conteneurs | 1 conteneur |
| **Ressources** | Plus élevées | Moins élevées |
| **Isolation** | ✅ Excellente | ⚠️ Limitée |
| **Scalabilité** | ✅ Individuelle | ❌ Globale |
| **Démarrage** | Plus lent | Plus rapide |
| **Gestion** | Plus complexe | Plus simple |
| **Debugging** | Plus facile | Plus difficile |

---

## 📝 Commandes rapides

```bash
# Démarrer
docker-compose -f docker-compose.all-services.yml up -d

# Voir les logs
docker-compose -f docker-compose.all-services.yml logs -f

# Arrêter
docker-compose -f docker-compose.all-services.yml down

# Reconstruire
docker-compose -f docker-compose.all-services.yml build --no-cache
docker-compose -f docker-compose.all-services.yml up -d

# Voir l'état des processus
docker exec ecolabel-all-services supervisorctl status
```

---

## 🐛 Dépannage

### Un service ne démarre pas

```bash
# Voir les logs d'erreur
docker exec ecolabel-all-services cat /var/log/supervisor/parser-produit.err.log

# Voir l'état
docker exec ecolabel-all-services supervisorctl status

# Redémarrer
docker exec ecolabel-all-services supervisorctl restart parser-produit
```

### Le conteneur ne démarre pas

```bash
# Voir les logs du conteneur
docker logs ecolabel-all-services

# Reconstruire l'image
docker-compose -f docker-compose.all-services.yml build --no-cache
```

### Les services ne communiquent pas entre eux

Dans le conteneur unique, les services communiquent via `localhost` :
- `http://localhost:8001` (au lieu de `http://nlp-ingredients:8001`)
- `http://localhost:8002` (au lieu de `http://lca-lite:8002`)
- etc.

---

## ✅ Avantages de cette approche

1. **Simplicité** : Un seul conteneur à gérer
2. **Performance** : Communication inter-services via localhost (plus rapide)
3. **Ressources** : Moins de mémoire utilisée
4. **Démarrage** : Plus rapide qu'avec 6 conteneurs

---

## ⚠️ Inconvénients

1. **Isolation** : Si un service plante, il peut affecter les autres
2. **Scalabilité** : Impossible de scaler un service individuellement
3. **Debugging** : Plus difficile de déboguer un service spécifique

---

## 🎯 Quand utiliser cette approche ?

✅ **Utilisez le conteneur unique si :**
- Vous développez localement
- Vous avez des ressources limitées
- Vous voulez une configuration simple
- Vous n'avez pas besoin de scaler individuellement

❌ **Utilisez l'architecture multi-conteneurs si :**
- Vous êtes en production
- Vous avez besoin de scaler des services individuellement
- Vous voulez une meilleure isolation
- Vous avez assez de ressources

---

## 📚 Fichiers créés

- `Dockerfile.all-services` - Image Docker avec tous les services
- `supervisord.conf` - Configuration Supervisor pour gérer les processus
- `docker-compose.all-services.yml` - Configuration Docker Compose
- `GUIDE_CONTENEUR_UNIQUE.md` - Ce guide

---

## 🚀 Prochaines étapes

1. Construire l'image : `docker-compose -f docker-compose.all-services.yml build`
2. Démarrer : `docker-compose -f docker-compose.all-services.yml up -d`
3. Initialiser les données : `init-databases.bat` ou `./init-databases.sh`
4. Tester : Ouvrir http://localhost:8000/docs dans votre navigateur


