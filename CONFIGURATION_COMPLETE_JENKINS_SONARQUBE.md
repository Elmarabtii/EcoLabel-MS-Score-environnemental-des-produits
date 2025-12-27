# 🔧 Configuration Complète Jenkins et SonarQube - Guide Étape par Étape

Ce guide vous accompagne pour configurer complètement Jenkins et SonarQube.

---

## 📋 Étape 1 : Configuration Initiale de Jenkins

### 1.1 Première connexion à Jenkins

1. Ouvrez votre navigateur : **http://localhost:8080**
2. Récupérez le mot de passe initial :
   ```powershell
   docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Collez le mot de passe dans Jenkins
4. Cliquez sur **"Continue"**

### 1.2 Installer les plugins suggérés

1. Choisissez **"Install suggested plugins"**
2. Attendez 2-5 minutes que l'installation se termine
3. Cliquez sur **"Continue"**

### 1.3 Créer un utilisateur administrateur

1. Remplissez le formulaire :
   - **Username** : `admin` (ou votre choix)
   - **Password** : (choisissez un mot de passe fort)
   - **Confirm password** : (répétez)
   - **Full name** : (votre nom)
   - **E-mail address** : (votre email)
2. Cliquez sur **"Save and Continue"**

### 1.4 Configuration de l'URL

1. Laissez l'URL par défaut : `http://localhost:8080/`
2. Cliquez sur **"Save and Finish"**
3. Cliquez sur **"Start using Jenkins"**

---

## 🔌 Étape 2 : Installer les Plugins Jenkins Nécessaires

### 2.1 Accéder à la gestion des plugins

1. Dans Jenkins, cliquez sur **"Manage Jenkins"** (menu de gauche)
2. Cliquez sur **"Manage Plugins"**

### 2.2 Installer les plugins

1. Cliquez sur l'onglet **"Available"**
2. Dans la barre de recherche, cherchez et **cochez** les plugins suivants :

   **Plugins essentiels :**
   - ✅ **SonarQube Scanner** (recherchez "SonarQube")
   - ✅ **HTML Publisher** (recherchez "HTML Publisher")
   - ✅ **Docker Pipeline** (recherchez "Docker Pipeline")
   - ✅ **Coverage** (recherchez "Coverage")
   - ✅ **Warnings Next Generation** (recherchez "Warnings NG")

   **Plugins optionnels mais recommandés :**
   - ✅ **Blue Ocean** (interface moderne pour les pipelines)
   - ✅ **Pipeline Stage View** (vue des étapes des pipelines)

3. Cliquez sur **"Install without restart"** en bas de la page
4. Attendez que l'installation se termine (2-5 minutes)
5. **Cochez "Restart Jenkins when installation is complete"**
6. Attendez que Jenkins redémarre (30-60 secondes)

---

## 🎯 Étape 3 : Configurer SonarQube

### 3.1 Accéder à SonarQube

1. Ouvrez votre navigateur : **http://localhost:9002**
2. **Attendez 1-2 minutes** si c'est la première fois (SonarQube initialise)

### 3.2 Première connexion

1. Connectez-vous avec :
   - **Username** : `admin`
   - **Password** : `admin`
2. Cliquez sur **"Log in"**

### 3.3 Changer le mot de passe

1. SonarQube vous demandera de changer le mot de passe
2. Entrez un nouveau mot de passe fort
3. Confirmez le mot de passe
4. Cliquez sur **"Update"**

**⚠️ IMPORTANT : Notez ce mot de passe !**

### 3.4 Créer un token d'authentification

1. Dans SonarQube, cliquez sur votre **avatar** (en haut à droite)
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

## 🔗 Étape 4 : Lier Jenkins à SonarQube

### 4.1 Ajouter le token SonarQube dans Jenkins

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

### 4.2 Configurer le serveur SonarQube dans Jenkins

1. Dans Jenkins, cliquez sur **"Manage Jenkins"**
2. Cliquez sur **"Configure System"**
3. Faites défiler jusqu'à la section **"SonarQube servers"**
4. Cliquez sur **"Add SonarQube"**
5. Remplissez :
   - **Name** : `SonarQube`
   - **Server URL** : `http://localhost:9002` (depuis votre machine)
     - **Note** : Si Jenkins est dans Docker, utilisez `http://sonarqube:9000` (port interne)
   - **Server authentication token** : Cliquez sur la liste déroulante et sélectionnez `sonar-token`

6. Cliquez sur **"Save"**

### 4.3 Configurer SonarQube Scanner (outil)

1. Dans Jenkins, cliquez sur **"Manage Jenkins"**
2. Cliquez sur **"Global Tool Configuration"**
3. Faites défiler jusqu'à **"SonarQube Scanner"**
4. Cliquez sur **"Add SonarQube Scanner"**
5. Remplissez :
   - **Name** : `SonarQube Scanner`
   - Cochez **"Install automatically"**
   - **Version** : Sélectionnez `Latest` ou la dernière version disponible

6. Cliquez sur **"Save"**

---

## 🐍 Étape 5 : Configurer Python et Node.js dans Jenkins

### 5.1 Configurer Python

1. Dans Jenkins, allez dans **"Manage Jenkins"** > **"Global Tool Configuration"**
2. Faites défiler jusqu'à **"Python"**
3. Cliquez sur **"Add Python"**
4. Remplissez :
   - **Name** : `Python 3.11`
   - **Installation directory** : Laissez vide (auto-détection)
     - **OU** : `/usr/bin/python3` (Linux) ou `C:\Python311\python.exe` (Windows)

5. Cliquez sur **"Save"**

### 5.2 Configurer Node.js (pour le frontend)

1. Toujours dans **"Global Tool Configuration"**
2. Faites défiler jusqu'à **"NodeJS"**
3. Cliquez sur **"Add NodeJS"**
4. Remplissez :
   - **Name** : `NodeJS 18`
   - Cochez **"Install automatically"**
   - **Version** : Sélectionnez `18.x` ou la dernière version LTS

5. Cliquez sur **"Save"**

---

## 📝 Étape 6 : Créer les Jobs Jenkins

Pour chaque microservice, créez un job Pipeline. Voici comment faire :

### 6.1 Job : lca-lite

1. Dans Jenkins, cliquez sur **"New Item"** (menu de gauche)
2. Remplissez :
   - **Item name** : `lca-lite`
   - **Type** : Sélectionnez **"Pipeline"**
3. Cliquez sur **"OK"**

4. Dans la configuration du pipeline :
   - Faites défiler jusqu'à **"Pipeline"**
   - Dans **"Definition"**, sélectionnez **"Pipeline script from SCM"**
   - Dans **"SCM"**, sélectionnez **"Git"**
   - Remplissez :
     - **Repository URL** : 
       - Si vous avez un repo Git : `https://github.com/votre-username/votre-repo.git`
       - Si c'est local : Utilisez le chemin du fichier ou créez un repo Git local
     - **Credentials** : Si votre repo est privé, ajoutez vos identifiants
     - **Branch Specifier** : `*/main` ou `*/master` (selon votre branche principale)
     - **Script Path** : `LCALite/Jenkinsfile`

5. Cliquez sur **"Save"**

6. Pour tester, cliquez sur **"Build Now"** (menu de gauche)

### 6.2 Job : nlp-ingredients

Répétez les étapes 6.1 avec :
- **Item name** : `nlp-ingredients`
- **Script Path** : `NLPIngrédients/Jenkinsfile`

### 6.3 Job : parser-produit

Répétez les étapes 6.1 avec :
- **Item name** : `parser-produit`
- **Script Path** : `ParserProduit/Jenkinsfile`

### 6.4 Job : scoring

Répétez les étapes 6.1 avec :
- **Item name** : `scoring`
- **Script Path** : `Scoring/Jenkinsfile`

### 6.5 Job : provenance

Répétez les étapes 6.1 avec :
- **Item name** : `provenance`
- **Script Path** : `Provenance/Jenkinsfile`

### 6.6 Job : widget-api

Répétez les étapes 6.1 avec :
- **Item name** : `widget-api`
- **Script Path** : `WidgetAPI/Jenkinsfile`

### 6.7 Job : widget-frontend

Répétez les étapes 6.1 avec :
- **Item name** : `widget-frontend`
- **Script Path** : `WidgetAPI/WidgetAPI_frontend/Jenkinsfile`

---

## 🔍 Étape 7 : Si vous n'avez pas de repo Git

Si votre code est local et que vous n'avez pas de repo Git, vous avez deux options :

### Option A : Créer un repo Git local

```powershell
# Dans le dossier de votre projet
git init
git add .
git commit -m "Initial commit"
```

Puis dans Jenkins, utilisez :
- **Repository URL** : `file:///F:/AllMyFille/5eme_annees/Architecture_des_composants_dentreprises/EcoLabel-MS-Score-environnemental-des-produits`
  - **Note** : Adaptez le chemin selon votre système

### Option B : Utiliser "Pipeline script" directement

1. Dans la configuration du job, au lieu de "Pipeline script from SCM"
2. Choisissez **"Pipeline script"**
3. Copiez le contenu du Jenkinsfile correspondant dans le champ de texte

**Mais l'Option A est recommandée !**

---

## ✅ Étape 8 : Vérifier que tout fonctionne

### 8.1 Vérifier dans Jenkins

1. Allez sur le tableau de bord Jenkins : **http://localhost:8080**
2. Vous devriez voir tous vos jobs
3. Cliquez sur un job (ex: `lca-lite`)
4. Cliquez sur **"Build Now"**
5. Cliquez sur le numéro du build (ex: `#1`)
6. Cliquez sur **"Console Output"** pour voir les logs

**⏳ Le premier build peut prendre 5-10 minutes** (installation des dépendances, etc.)

### 8.2 Vérifier dans SonarQube

1. Allez sur SonarQube : **http://localhost:9002**
2. Cliquez sur **"Projects"** dans le menu
3. Après le premier build réussi, vous devriez voir vos projets apparaître
4. Cliquez sur un projet pour voir :
   - **Overview** : Vue d'ensemble
   - **Issues** : Bugs, vulnérabilités, code smells
   - **Measures** : Métriques de qualité
   - **Code** : Analyse du code source

---

## 🐛 Dépannage

### Problème : "Cannot connect to SonarQube" dans Jenkins

**Solution :**
1. Vérifiez que SonarQube est accessible : `http://localhost:9002`
2. Vérifiez l'URL dans Jenkins : Utilisez `http://localhost:9002`
3. Vérifiez que le token est correct dans les credentials

### Problème : "sonar-scanner: command not found"

**Solution :**
1. Dans Jenkins : **Manage Jenkins** > **Global Tool Configuration**
2. Vérifiez que SonarQube Scanner est installé
3. Si non, installez-le automatiquement

### Problème : Les tests échouent

**C'est normal si vous n'avez pas encore de tests !** Le pipeline continuera quand même.

Pour ajouter des tests :
1. Créez un dossier `tests/` dans chaque microservice
2. Ajoutez des tests avec pytest (Python) ou jest (React)

### Problème : "Repository not found" ou erreur Git

**Solutions :**
1. Vérifiez que le chemin du repo est correct
2. Si repo local, utilisez le format `file:///chemin/absolu`
3. Ou créez un repo Git local (voir Option A ci-dessus)

---

## 📊 Résumé des URLs

- **Jenkins** : http://localhost:8080
- **SonarQube** : http://localhost:9002
- **MinIO** : http://localhost:9000 (déjà en cours d'exécution)

---

## ✅ Checklist de configuration

Cochez chaque étape au fur et à mesure :

- [ ] Jenkins accessible et configuré
- [ ] Plugins Jenkins installés
- [ ] SonarQube accessible et configuré
- [ ] Token SonarQube créé
- [ ] Token ajouté aux credentials Jenkins
- [ ] Serveur SonarQube configuré dans Jenkins
- [ ] SonarQube Scanner configuré
- [ ] Python configuré dans Jenkins
- [ ] Node.js configuré dans Jenkins
- [ ] Tous les jobs créés (7 jobs)
- [ ] Premier build réussi
- [ ] Analyses SonarQube visibles

---

**🎉 Félicitations ! Vous avez maintenant Jenkins et SonarQube complètement configurés !**

