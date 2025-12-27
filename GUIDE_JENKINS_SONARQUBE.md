# Guide d'intégration Jenkins et SonarQube

Ce guide vous explique comment configurer Jenkins et SonarQube pour chaque microservice du projet EcoLabel.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration SonarQube](#configuration-sonarqube)
4. [Configuration Jenkins](#configuration-jenkins)
5. [Création des jobs Jenkins](#création-des-jobs-jenkins)
6. [Utilisation](#utilisation)
7. [Dépannage](#dépannage)

## 🔧 Prérequis

- Docker et Docker Compose installés
- Au moins 8 GB de RAM disponible (4 GB pour Jenkins + 4 GB pour SonarQube)
- Ports disponibles :
  - `8080` : Jenkins
  - `9002` : SonarQube (port 9000 utilisé par MinIO)
  - `50000` : Jenkins Agent (optionnel)

## 🚀 Installation

### 1. Démarrer Jenkins et SonarQube

```bash
# Démarrer les services CI/CD
docker-compose -f docker-compose.ci.yml up -d

# Vérifier que les services sont démarrés
docker-compose -f docker-compose.ci.yml ps
```

### 2. Accéder à Jenkins

1. Ouvrez votre navigateur et allez sur `http://localhost:8080`
2. Récupérez le mot de passe initial :
   ```bash
   docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Collez le mot de passe dans l'interface Jenkins
4. Choisissez "Install suggested plugins"
5. Créez un utilisateur administrateur

### 3. Accéder à SonarQube

1. Ouvrez votre navigateur et allez sur `http://localhost:9002`
2. Connectez-vous avec les identifiants par défaut :
   - **Username** : `admin`
   - **Password** : `admin`
3. Vous serez invité à changer le mot de passe (recommandé)

## ⚙️ Configuration SonarQube

### 1. Créer un token d'authentification

1. Dans SonarQube, allez dans **My Account** > **Security**
2. Dans la section **Generate Tokens**, créez un nouveau token :
   - **Name** : `jenkins-token`
   - **Type** : `User Token`
   - **Expires in** : `No expiration` (ou une date appropriée)
3. **Copiez le token** (vous ne pourrez plus le voir après)

### 2. Configurer les Quality Gates (optionnel)

Les Quality Gates définissent les critères de qualité minimum pour votre code.

1. Allez dans **Quality Gates** > **Create**
2. Créez une Quality Gate personnalisée ou utilisez la "Sonar way" par défaut

## 🔨 Configuration Jenkins

### 1. Installer les plugins nécessaires

1. Dans Jenkins, allez dans **Manage Jenkins** > **Manage Plugins**
2. Dans l'onglet **Available**, installez les plugins suivants :
   - **SonarQube Scanner** (pour l'analyse de code)
   - **HTML Publisher** (pour les rapports HTML)
   - **Pipeline** (déjà installé normalement)
   - **Docker Pipeline** (pour les builds Docker)
   - **Coverage** (pour les rapports de couverture de code)
   - **Warnings Next Generation** (pour les rapports de linting)

### 2. Configurer SonarQube dans Jenkins

1. Allez dans **Manage Jenkins** > **Configure System**
2. Faites défiler jusqu'à la section **SonarQube servers**
3. Cliquez sur **Add SonarQube**
4. Configurez :
   - **Name** : `SonarQube`
   - **Server URL** : `http://sonarqube:9000` (depuis Jenkins) ou `http://localhost:9002` (depuis votre machine)
   - **Server authentication token** : Cliquez sur **Add** > **Jenkins** et créez une nouvelle credential :
     - **Kind** : `Secret text`
     - **Secret** : Le token SonarQube que vous avez créé précédemment
     - **ID** : `sonar-token`
     - **Description** : `SonarQube authentication token`

### 3. Configurer les outils

1. Allez dans **Manage Jenkins** > **Global Tool Configuration**
2. Configurez **Python** :
   - Cliquez sur **Add Python**
   - **Name** : `Python 3.11`
   - **Installation directory** : `/usr/bin/python3` (ou laissez vide pour auto-détection)
3. Configurez **Node.js** (pour le frontend) :
   - Cliquez sur **Add NodeJS**
   - **Name** : `NodeJS 18`
   - **Version** : Sélectionnez `18.x` ou laissez installer automatiquement
4. Configurez **SonarQube Scanner** :
   - Cliquez sur **Add SonarQube Scanner**
   - **Name** : `SonarQube Scanner`
   - Cochez **Install automatically**

### 4. Configurer Docker (si nécessaire)

Si Jenkins doit construire des images Docker, assurez-vous que :
- Le socket Docker est monté dans le conteneur (déjà fait dans `docker-compose.ci.yml`)
- L'utilisateur Jenkins a les permissions nécessaires

## 📝 Création des jobs Jenkins

### Option 1 : Jobs Pipeline (recommandé)

Pour chaque microservice, créez un job Pipeline :

#### Pour les microservices Python

1. **New Item** > **Pipeline** > Donnez un nom (ex: `lca-lite`)
2. Dans **Pipeline configuration** :
   - **Definition** : `Pipeline script from SCM`
   - **SCM** : `Git` (ou votre système de contrôle de version)
   - **Repository URL** : URL de votre dépôt
   - **Script Path** : `LCALite/Jenkinsfile`
3. Cliquez sur **Save**

Répétez pour chaque microservice :
- `LCALite/Jenkinsfile` → Job `lca-lite`
- `NLPIngrédients/Jenkinsfile` → Job `nlp-ingredients`
- `ParserProduit/Jenkinsfile` → Job `parser-produit`
- `Scoring/Jenkinsfile` → Job `scoring`
- `Provenance/Jenkinsfile` → Job `provenance`
- `WidgetAPI/Jenkinsfile` → Job `widget-api`
- `WidgetAPI/WidgetAPI_frontend/Jenkinsfile` → Job `widget-frontend`

#### Pour le frontend React

1. Créez un job Pipeline similaire
2. Utilisez `WidgetAPI/WidgetAPI_frontend/Jenkinsfile` comme script path

### Option 2 : Multibranch Pipeline (recommandé pour Git)

1. **New Item** > **Multibranch Pipeline**
2. Configurez :
   - **Branch Sources** : Ajoutez votre dépôt Git
   - **Build Configuration** : `Mode: by Jenkinsfile`
   - **Script Path** : `LCALite/Jenkinsfile` (pour chaque microservice)

## 🎯 Utilisation

### Lancer un build manuellement

1. Allez dans le job Jenkins souhaité
2. Cliquez sur **Build Now**
3. Suivez la progression dans **Console Output**

### Déclencher automatiquement

Les pipelines peuvent être déclenchés :
- **Par webhook Git** : À chaque push/merge
- **Par polling** : Vérification périodique du dépôt
- **Par schedule** : À des heures fixes (cron)

Pour configurer un webhook Git :
1. Dans votre dépôt Git, allez dans **Settings** > **Webhooks**
2. Ajoutez un webhook pointant vers : `http://votre-jenkins:8080/github-webhook/`

### Consulter les résultats

#### Dans Jenkins

- **Console Output** : Logs détaillés du build
- **Coverage Report** : Couverture de code
- **Flake8 Report** : Rapports de linting
- **Test Results** : Résultats des tests

#### Dans SonarQube

1. Allez sur `http://localhost:9002`
2. Dans **Projects**, vous verrez tous vos microservices
3. Cliquez sur un projet pour voir :
   - **Issues** : Bugs, vulnérabilités, code smells
   - **Measures** : Métriques de qualité
   - **Code** : Analyse du code source
   - **Activity** : Historique des analyses

## 🔍 Structure des pipelines

Chaque pipeline Jenkins exécute les étapes suivantes :

1. **Checkout** : Récupération du code source
2. **Install Dependencies** : Installation des dépendances Python/Node
3. **Lint** : Analyse statique du code (Pylint, Flake8, ESLint)
4. **Tests** : Exécution des tests unitaires avec couverture
5. **SonarQube Analysis** : Analyse de qualité de code
6. **Build Docker Image** : Construction de l'image Docker
7. **Quality Gate** : Vérification des critères de qualité

## 🐛 Dépannage

### Jenkins ne peut pas se connecter à SonarQube

**Problème** : `Connection refused` ou `Unable to connect to SonarQube`

**Solutions** :
1. Vérifiez que SonarQube est démarré : `docker ps | grep sonarqube`
2. Vérifiez l'URL dans Jenkins : Utilisez `http://sonarqube:9000` si Jenkins est dans Docker, `http://localhost:9002` sinon
3. Vérifiez le token SonarQube dans les credentials Jenkins

### SonarQube Scanner non trouvé

**Problème** : `sonar-scanner: command not found`

**Solutions** :
1. Installez SonarQube Scanner dans Jenkins : **Manage Jenkins** > **Global Tool Configuration**
2. Ou installez-le dans le conteneur Jenkins :
   ```bash
   docker exec -it ecolabel-jenkins bash
   wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
   unzip sonar-scanner-cli-4.8.0.2856-linux.zip
   mv sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner
   ```

### Tests échouent

**Problème** : Les tests ne passent pas

**Solutions** :
1. Vérifiez que les tests existent dans le dossier `tests/`
2. Si pas de tests, le pipeline continuera (avec `|| true`)
3. Ajoutez des tests pour améliorer la qualité du code

### Docker build échoue

**Problème** : `Cannot connect to the Docker daemon`

**Solutions** :
1. Vérifiez que le socket Docker est monté : `docker exec ecolabel-jenkins ls -la /var/run/docker.sock`
2. Vérifiez les permissions : L'utilisateur Jenkins doit avoir accès à Docker

### Quality Gate échoue

**Problème** : Le Quality Gate bloque le pipeline

**Solutions** :
1. Consultez les résultats dans SonarQube pour voir quels critères échouent
2. Ajustez les seuils dans SonarQube > Quality Gates
3. Ou modifiez le Jenkinsfile pour ne pas bloquer : `abortPipeline: false`

## 📊 Métriques SonarQube

Les métriques suivantes sont analysées pour chaque microservice :

- **Bugs** : Erreurs dans le code
- **Vulnerabilities** : Failles de sécurité
- **Code Smells** : Problèmes de qualité/maintenabilité
- **Coverage** : Pourcentage de code couvert par les tests
- **Duplications** : Code dupliqué
- **Technical Debt** : Dette technique estimée

## 🔐 Sécurité

### Bonnes pratiques

1. **Changez les mots de passe par défaut** :
   - SonarQube : Changez le mot de passe `admin`
   - Jenkins : Créez un utilisateur avec un mot de passe fort

2. **Utilisez des tokens** :
   - Ne stockez jamais de mots de passe en clair
   - Utilisez des tokens SonarQube pour l'authentification

3. **Restreignez l'accès** :
   - Configurez les permissions dans Jenkins et SonarQube
   - Limitez l'accès aux ports (firewall)

## 📚 Ressources supplémentaires

- [Documentation Jenkins](https://www.jenkins.io/doc/)
- [Documentation SonarQube](https://docs.sonarqube.org/)
- [SonarQube Scanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)

## ✅ Checklist de configuration

- [ ] Jenkins et SonarQube démarrés
- [ ] Plugins Jenkins installés
- [ ] SonarQube configuré dans Jenkins
- [ ] Token SonarQube créé et ajouté aux credentials Jenkins
- [ ] Outils configurés (Python, Node.js, SonarQube Scanner)
- [ ] Jobs Jenkins créés pour chaque microservice
- [ ] Premier build réussi
- [ ] Analyses SonarQube visibles
- [ ] Quality Gates configurées

---

**Note** : Ce guide suppose que vous utilisez Docker. Si vous installez Jenkins/SonarQube différemment, adaptez les URLs et chemins en conséquence.

