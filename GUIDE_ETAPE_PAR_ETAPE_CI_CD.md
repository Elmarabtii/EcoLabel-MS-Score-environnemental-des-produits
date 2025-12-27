# 📋 Guide Étape par Étape : Configuration Jenkins et SonarQube

Ce guide vous accompagne pas à pas pour configurer Jenkins et SonarQube pour vos microservices.

---

## 🎯 Étape 1 : Vérification des prérequis

### 1.1 Vérifier Docker

```bash
# Vérifier que Docker est installé et fonctionne
docker --version
docker-compose --version

# Vérifier que Docker est démarré
docker ps
```

**✅ Si vous voyez la version et que `docker ps` fonctionne, passez à l'étape 2.**

**❌ Si Docker n'est pas installé :**
- Windows : Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux : `sudo apt-get install docker.io docker-compose`
- Mac : Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1.2 Vérifier les ports disponibles

```bash
# Windows PowerShell
netstat -an | findstr "8080 9002 50000"

# Linux/Mac
netstat -an | grep -E "8080|9002|50000"
```

**✅ Si les ports sont libres, continuez.**

**❌ Si les ports sont utilisés :**
- Modifiez les ports dans `docker-compose.ci.yml` si nécessaire

---

## 🚀 Étape 2 : Démarrer Jenkins et SonarQube

### 2.1 Démarrer les services

```bash
# Depuis la racine du projet
docker-compose -f docker-compose.ci.yml up -d
```

**Attendez 30-60 secondes** pour que les services démarrent complètement.

### 2.2 Vérifier que les services sont démarrés

```bash
# Vérifier l'état des conteneurs
docker-compose -f docker-compose.ci.yml ps
```

Vous devriez voir :
- `ecolabel-jenkins` : Up
- `ecolabel-sonarqube` : Up
- `ecolabel-sonarqube-db` : Up

### 2.3 Vérifier les logs (optionnel)

```bash
# Voir les logs de tous les services
docker-compose -f docker-compose.ci.yml logs -f

# Ou pour un service spécifique
docker-compose -f docker-compose.ci.yml logs jenkins
docker-compose -f docker-compose.ci.yml logs sonarqube
```

**Appuyez sur `Ctrl+C` pour quitter les logs.**

---

## 🔐 Étape 3 : Configuration initiale de Jenkins

### 3.1 Accéder à Jenkins

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:8080**

### 3.2 Récupérer le mot de passe initial

**Windows PowerShell :**
```powershell
docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Linux/Mac :**
```bash
docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Copiez le mot de passe affiché** (c'est une longue chaîne de caractères).

### 3.3 Première connexion à Jenkins

1. Dans votre navigateur sur `http://localhost:8080`
2. Collez le mot de passe dans le champ "Administrator password"
3. Cliquez sur **"Continue"**

### 3.4 Installer les plugins suggérés

1. Sur l'écran "Customize Jenkins", choisissez **"Install suggested plugins"**
2. Attendez que l'installation se termine (2-5 minutes)
3. Une fois terminé, cliquez sur **"Continue"**

### 3.5 Créer un utilisateur administrateur

1. Remplissez le formulaire :
   - **Username** : (choisissez un nom, ex: `admin`)
   - **Password** : (choisissez un mot de passe fort)
   - **Confirm password** : (répétez le mot de passe)
   - **Full name** : (votre nom)
   - **E-mail address** : (votre email)
2. Cliquez sur **"Save and Continue"**

### 3.6 Configuration de l'URL Jenkins

1. Sur l'écran "Instance Configuration"
2. Laissez l'URL par défaut : `http://localhost:8080/`
3. Cliquez sur **"Save and Finish"**

### 3.7 Jenkins est prêt !

1. Cliquez sur **"Start using Jenkins"**
2. Vous êtes maintenant sur le tableau de bord Jenkins

---

## 🔧 Étape 4 : Installation des plugins Jenkins

### 4.1 Accéder à la gestion des plugins

1. Dans Jenkins, cliquez sur **"Manage Jenkins"** (menu de gauche)
2. Cliquez sur **"Manage Plugins"**

### 4.2 Installer les plugins nécessaires

1. Cliquez sur l'onglet **"Available"**
2. Dans la barre de recherche, cherchez et cochez les plugins suivants :

   **Plugins essentiels :**
   - ✅ **SonarQube Scanner** (recherchez "SonarQube")
   - ✅ **HTML Publisher** (recherchez "HTML Publisher")
   - ✅ **Docker Pipeline** (recherchez "Docker Pipeline")
   - ✅ **Coverage** (recherchez "Coverage")
   - ✅ **Warnings Next Generation** (recherchez "Warnings NG")

   **Plugins optionnels mais recommandés :**
   - ✅ **Blue Ocean** (interface moderne)
   - ✅ **Pipeline Stage View** (vue des pipelines)

3. Cliquez sur **"Install without restart"** en bas de la page
4. Attendez que l'installation se termine (2-5 minutes)
5. **Cochez "Restart Jenkins when installation is complete"**
6. Attendez que Jenkins redémarre (30-60 secondes)

---

## 🎯 Étape 5 : Configuration de SonarQube

### 5.1 Accéder à SonarQube

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:9002**
3. **Attendez 1-2 minutes** si c'est la première fois (SonarQube initialise la base de données)

### 5.2 Première connexion

1. Connectez-vous avec :
   - **Username** : `admin`
   - **Password** : `admin`
2. Cliquez sur **"Log in"**

### 5.3 Changer le mot de passe

1. SonarQube vous demandera de changer le mot de passe
2. Entrez un nouveau mot de passe fort
3. Confirmez le mot de passe
4. Cliquez sur **"Update"**

**⚠️ IMPORTANT : Notez ce mot de passe, vous en aurez besoin !**

### 5.4 Créer un token d'authentification

1. Dans SonarQube, cliquez sur votre avatar en haut à droite
2. Cliquez sur **"My Account"**
3. Dans le menu de gauche, cliquez sur **"Security"**
4. Dans la section **"Generate Tokens"**, remplissez :
   - **Name** : `jenkins-token`
   - **Type** : `User Token`
   - **Expires in** : `No expiration` (ou choisissez une date)
5. Cliquez sur **"Generate"**
6. **⚠️ COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après)
   - Exemple : `squ_1234567890abcdef1234567890abcdef12345678`

**💾 Sauvegardez ce token dans un endroit sûr !**

---

## 🔗 Étape 6 : Configurer SonarQube dans Jenkins

### 6.1 Ajouter le token SonarQube dans Jenkins

1. Dans Jenkins, cliquez sur **"Manage Jenkins"**
2. Cliquez sur **"Credentials"**
3. Cliquez sur **"System"** (dans le menu de gauche)
4. Cliquez sur **"Global credentials (unrestricted)"**
5. Cliquez sur **"Add Credentials"** (menu de gauche)

6. Remplissez le formulaire :
   - **Kind** : Sélectionnez `Secret text`
   - **Secret** : Collez le token SonarQube que vous avez copié
   - **ID** : `sonar-token`
   - **Description** : `SonarQube authentication token`
   - **Scope** : Laissez `Global`

7. Cliquez sur **"Create"**

### 6.2 Configurer le serveur SonarQube

1. Dans Jenkins, cliquez sur **"Manage Jenkins"**
2. Cliquez sur **"Configure System"**
3. Faites défiler jusqu'à la section **"SonarQube servers"**
4. Cliquez sur **"Add SonarQube"**
5. Remplissez :
   - **Name** : `SonarQube`
   - **Server URL** : `http://sonarqube:9000` (si Jenkins est dans Docker)
     - **OU** : `http://localhost:9002` (si vous accédez depuis votre machine)
   - **Server authentication token** : Cliquez sur la liste déroulante et sélectionnez `sonar-token`

6. Cliquez sur **"Save"**

### 6.3 Configurer SonarQube Scanner (outil)

1. Dans Jenkins, cliquez sur **"Manage Jenkins"**
2. Cliquez sur **"Global Tool Configuration"**
3. Faites défiler jusqu'à **"SonarQube Scanner"**
4. Cliquez sur **"Add SonarQube Scanner"**
5. Remplissez :
   - **Name** : `SonarQube Scanner`
   - Cochez **"Install automatically"**
   - **Version** : Sélectionnez la dernière version (ex: `Latest`)

6. Cliquez sur **"Save"**

---

## 🐍 Étape 7 : Configurer Python et Node.js dans Jenkins

### 7.1 Configurer Python

1. Dans Jenkins, allez dans **"Manage Jenkins"** > **"Global Tool Configuration"**
2. Faites défiler jusqu'à **"Python"**
3. Cliquez sur **"Add Python"**
4. Remplissez :
   - **Name** : `Python 3.11`
   - **Installation directory** : Laissez vide (auto-détection)
     - **OU** : `/usr/bin/python3` (Linux) ou `C:\Python311\python.exe` (Windows)

5. Cliquez sur **"Save"**

### 7.2 Configurer Node.js (pour le frontend)

1. Toujours dans **"Global Tool Configuration"**
2. Faites défiler jusqu'à **"NodeJS"**
3. Cliquez sur **"Add NodeJS"**
4. Remplissez :
   - **Name** : `NodeJS 18`
   - Cochez **"Install automatically"**
   - **Version** : Sélectionnez `18.x` ou la dernière version LTS

5. Cliquez sur **"Save"**

---

## 📝 Étape 8 : Créer votre premier job Jenkins

### 8.1 Créer un job pour LCALite

1. Dans Jenkins, cliquez sur **"New Item"** (menu de gauche)
2. Remplissez :
   - **Item name** : `lca-lite`
   - **Type** : Sélectionnez **"Pipeline"**
3. Cliquez sur **"OK"**

### 8.2 Configurer le pipeline

1. Faites défiler jusqu'à **"Pipeline"**
2. Dans **"Definition"**, sélectionnez **"Pipeline script from SCM"**
3. Dans **"SCM"**, sélectionnez **"Git"**
4. Remplissez :
   - **Repository URL** : L'URL de votre dépôt Git
     - Exemple : `https://github.com/votre-username/votre-repo.git`
     - **OU** : Si le repo est local, utilisez le chemin du fichier
   - **Credentials** : Si votre repo est privé, ajoutez vos identifiants
   - **Branch Specifier** : `*/main` ou `*/master` (selon votre branche principale)
   - **Script Path** : `LCALite/Jenkinsfile`

5. Cliquez sur **"Save"**

### 8.3 Lancer le premier build

1. Sur la page du job `lca-lite`
2. Cliquez sur **"Build Now"** (menu de gauche)
3. Vous verrez un build apparaître dans **"Build History"**
4. Cliquez sur le numéro du build (ex: `#1`)
5. Cliquez sur **"Console Output"** pour voir les logs en temps réel

**⏳ Le premier build peut prendre 5-10 minutes** (installation des dépendances, etc.)

---

## 🔄 Étape 9 : Créer les autres jobs

Répétez l'étape 8 pour chaque microservice :

### 9.1 Job : nlp-ingredients

1. **New Item** > **Pipeline** > Nom: `nlp-ingredients`
2. **Script Path** : `NLPIngrédients/Jenkinsfile`
3. **Save** > **Build Now**

### 9.2 Job : parser-produit

1. **New Item** > **Pipeline** > Nom: `parser-produit`
2. **Script Path** : `ParserProduit/Jenkinsfile`
3. **Save** > **Build Now**

### 9.3 Job : scoring

1. **New Item** > **Pipeline** > Nom: `scoring`
2. **Script Path** : `Scoring/Jenkinsfile`
3. **Save** > **Build Now**

### 9.4 Job : provenance

1. **New Item** > **Pipeline** > Nom: `provenance`
2. **Script Path** : `Provenance/Jenkinsfile`
3. **Save** > **Build Now**

### 9.5 Job : widget-api

1. **New Item** > **Pipeline** > Nom: `widget-api`
2. **Script Path** : `WidgetAPI/Jenkinsfile`
3. **Save** > **Build Now**

### 9.6 Job : widget-frontend

1. **New Item** > **Pipeline** > Nom: `widget-frontend`
2. **Script Path** : `WidgetAPI/WidgetAPI_frontend/Jenkinsfile`
3. **Save** > **Build Now**

---

## 📊 Étape 10 : Vérifier les résultats

### 10.1 Dans Jenkins

1. Allez sur le tableau de bord Jenkins : `http://localhost:8080`
2. Vous verrez tous vos jobs avec leur statut
3. Cliquez sur un job pour voir :
   - **Build History** : Historique des builds
   - **Console Output** : Logs détaillés
   - **Coverage Report** : Rapport de couverture de code
   - **Flake8 Report** : Rapport de linting

### 10.2 Dans SonarQube

1. Allez sur SonarQube : `http://localhost:9002`
2. Cliquez sur **"Projects"** dans le menu
3. Vous verrez tous vos microservices analysés
4. Cliquez sur un projet pour voir :
   - **Overview** : Vue d'ensemble
   - **Issues** : Bugs, vulnérabilités, code smells
   - **Measures** : Métriques de qualité
   - **Code** : Analyse du code source
   - **Activity** : Historique des analyses

---

## 🔧 Étape 11 : Configuration avancée (optionnel)

### 11.1 Configurer les webhooks Git (déclenchement automatique)

Si vous utilisez GitHub/GitLab :

1. Dans votre dépôt Git, allez dans **Settings** > **Webhooks**
2. Cliquez sur **"Add webhook"**
3. Remplissez :
   - **Payload URL** : `http://votre-ip:8080/github-webhook/`
   - **Content type** : `application/json`
   - **Events** : Cochez `Push events` et `Pull request events`
4. Cliquez sur **"Add webhook"**

Maintenant, chaque push déclenchera automatiquement un build !

### 11.2 Configurer les Quality Gates SonarQube

1. Dans SonarQube, allez dans **Quality Gates** > **Create**
2. Créez une Quality Gate personnalisée avec vos critères
3. Dans Jenkins, les pipelines vérifieront automatiquement ces critères

---

## 🐛 Dépannage

### Problème : Jenkins ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.ci.yml logs jenkins

# Redémarrer
docker-compose -f docker-compose.ci.yml restart jenkins
```

### Problème : SonarQube ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.ci.yml logs sonarqube

# Vérifier que la base de données est prête
docker-compose -f docker-compose.ci.yml logs sonarqube-db
```

### Problème : "Cannot connect to SonarQube" dans Jenkins

1. Vérifiez que SonarQube est accessible : `http://localhost:9002`
2. Vérifiez l'URL dans Jenkins : Utilisez `http://localhost:9002` au lieu de `http://sonarqube:9000`
3. Vérifiez que le token est correct dans les credentials

### Problème : "sonar-scanner: command not found"

1. Dans Jenkins : **Manage Jenkins** > **Global Tool Configuration**
2. Vérifiez que SonarQube Scanner est installé
3. Si non, installez-le automatiquement

### Problème : Les tests échouent

C'est normal si vous n'avez pas encore de tests ! Le pipeline continuera quand même.

Pour ajouter des tests :
1. Créez un dossier `tests/` dans chaque microservice
2. Ajoutez des tests avec pytest (Python) ou jest (React)

---

## ✅ Checklist de vérification

Cochez chaque étape au fur et à mesure :

- [ ] Docker installé et fonctionnel
- [ ] Jenkins et SonarQube démarrés (`docker-compose.ci.yml up -d`)
- [ ] Jenkins accessible sur `http://localhost:8080`
- [ ] Mot de passe initial Jenkins récupéré
- [ ] Utilisateur administrateur Jenkins créé
- [ ] Plugins Jenkins installés
- [ ] SonarQube accessible sur `http://localhost:9002`
- [ ] Mot de passe SonarQube changé
- [ ] Token SonarQube créé et copié
- [ ] Token ajouté aux credentials Jenkins
- [ ] Serveur SonarQube configuré dans Jenkins
- [ ] SonarQube Scanner configuré
- [ ] Python configuré dans Jenkins
- [ ] Node.js configuré dans Jenkins
- [ ] Premier job créé (`lca-lite`)
- [ ] Premier build réussi
- [ ] Tous les jobs créés
- [ ] Analyses SonarQube visibles

---

## 🎉 Félicitations !

Vous avez maintenant Jenkins et SonarQube configurés pour tous vos microservices !

**Prochaines étapes :**
- Ajoutez des tests pour améliorer la couverture de code
- Configurez les webhooks pour le déclenchement automatique
- Personnalisez les Quality Gates selon vos besoins

**Commandes utiles :**
```bash
# Démarrer
make ci-up

# Arrêter
make ci-down

# Voir les logs
make ci-logs

# Redémarrer
make ci-restart
```

---

**Besoin d'aide ?** Consultez `GUIDE_JENKINS_SONARQUBE.md` pour plus de détails.

