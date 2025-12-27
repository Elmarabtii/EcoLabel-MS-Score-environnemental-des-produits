# 🚀 Démarrage rapide CI/CD

Guide rapide pour démarrer Jenkins et SonarQube en 5 minutes.

## 1. Démarrer les services CI/CD

```bash
make ci-up
```

Ou manuellement :
```bash
docker-compose -f docker-compose.ci.yml up -d
```

## 2. Accéder à Jenkins

1. Ouvrez `http://localhost:8080`
2. Récupérez le mot de passe initial :
   ```bash
   docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Suivez l'assistant d'installation

## 3. Accéder à SonarQube

1. Ouvrez `http://localhost:9002`
2. Connectez-vous avec :
   - Username: `admin`
   - Password: `admin`
3. Changez le mot de passe

## 4. Configurer SonarQube dans Jenkins

### Créer un token SonarQube

1. Dans SonarQube : **My Account** > **Security** > **Generate Tokens**
2. Créez un token nommé `jenkins-token`
3. **Copiez le token** (vous ne pourrez plus le voir)

### Ajouter le token dans Jenkins

1. Dans Jenkins : **Manage Jenkins** > **Credentials** > **System** > **Global credentials**
2. **Add Credentials** :
   - Kind: `Secret text`
   - Secret: (collez le token SonarQube)
   - ID: `sonar-token`
   - Description: `SonarQube authentication token`

### Configurer SonarQube Server

1. **Manage Jenkins** > **Configure System**
2. Section **SonarQube servers** :
   - **Name**: `SonarQube`
   - **Server URL**: `http://sonarqube:9000` (ou `http://localhost:9002`)
   - **Server authentication token**: Sélectionnez `sonar-token`

## 5. Installer les plugins Jenkins

**Manage Jenkins** > **Manage Plugins** > **Available** :

- ✅ SonarQube Scanner
- ✅ HTML Publisher
- ✅ Docker Pipeline
- ✅ Coverage
- ✅ Warnings Next Generation

## 6. Créer un job Jenkins

### Exemple : Job pour LCALite

1. **New Item** > **Pipeline** > Nom: `lca-lite`
2. **Pipeline** :
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: (votre repo)
   - Script Path: `LCALite/Jenkinsfile`
3. **Save** > **Build Now**

## 7. Vérifier les résultats

- **Jenkins** : `http://localhost:8080` > Voir les builds
- **SonarQube** : `http://localhost:9002` > Voir les projets

## Commandes utiles

```bash
# Voir les logs
make ci-logs

# Arrêter
make ci-down

# Redémarrer
make ci-restart

# Nettoyer (⚠️ supprime les données)
make ci-clean
```

## 📚 Documentation complète

Voir `GUIDE_JENKINS_SONARQUBE.md` pour la documentation complète.

