# ✅ Vérification : Création Automatique des Projets SonarQube

Pour que les projets SonarQube soient créés automatiquement lors du premier build, vérifiez les points suivants :

## 🔍 Vérifications à faire

### 1. Token SonarQube dans Jenkins

1. Dans Jenkins : **Manage Jenkins** > **Credentials** > **System** > **Global credentials**
2. Vérifiez qu'il existe une credential avec :
   - **ID** : `sonar-token`
   - **Kind** : `Secret text`
   - **Secret** : (doit contenir votre token SonarQube)

**Si le token n'existe pas ou est incorrect :**

1. Dans SonarQube (http://localhost:9002) : **My Account** > **Security**
2. **Generate Tokens** :
   - Name : `jenkins-token`
   - Type : `User Token`
   - Generate
3. **Copiez le token**
4. Dans Jenkins : **Add Credentials** :
   - Kind : `Secret text`
   - Secret : (collez le token)
   - ID : `sonar-token`
   - Description : `SonarQube authentication token`

### 2. Configuration SonarQube Server dans Jenkins

1. Dans Jenkins : **Manage Jenkins** > **Configure System**
2. Section **SonarQube servers** :
   - **Name** : `SonarQube`
   - **Server URL** : `http://localhost:9002` (depuis votre machine)
     - **OU** : `http://sonarqube:9000` (depuis les conteneurs Docker)
   - **Server authentication token** : Sélectionnez `sonar-token`

### 3. Vérifier que Jenkins et SonarQube sont dans le même réseau Docker

```bash
# Vérifier que les conteneurs sont dans le même réseau
docker network inspect ecolabel-network | grep -E "jenkins|sonarqube"
```

Les deux conteneurs doivent apparaître dans le même réseau.

### 4. Tester la connexion depuis le conteneur Jenkins

```bash
# Tester depuis le conteneur Jenkins
docker exec ecolabel-jenkins curl -s http://sonarqube:9000/api/system/status
```

Vous devriez voir une réponse JSON avec le statut de SonarQube.

## 🚀 Comment ça fonctionne

Lors du premier build réussi avec SonarQube :

1. Le `sonar-scanner` s'exécute dans un conteneur Docker
2. Il se connecte à SonarQube via `http://sonarqube:9000` (nom du service Docker)
3. Si le `projectKey` n'existe pas, SonarQube crée automatiquement le projet
4. L'analyse est effectuée et les résultats sont stockés

## 📝 Projets qui seront créés automatiquement

| Project Key | Project Name | Jenkinsfile |
|-------------|--------------|-------------|
| `lca-lite` | `LCA-Lite` | `LCALite/Jenkinsfile` |
| `nlp-ingredients` | `NLP-Ingredients` | `NLPIngrédients/Jenkinsfile` |
| `parser-produit` | `Parser-Produit` | `ParserProduit/Jenkinsfile` |
| `scoring` | `Scoring` | `Scoring/Jenkinsfile` |
| `provenance` | `Provenance` | `Provenance/Jenkinsfile` |
| `widget-api` | `Widget-API` | `WidgetAPI/Jenkinsfile` |
| `widget-frontend` | `Widget-Frontend` | `WidgetAPI/WidgetAPI_frontend/Jenkinsfile` |

## ✅ Test

1. Relancez un build dans Jenkins (ex: `lca-lite`)
2. Attendez que l'étape "SonarQube Analysis" se termine
3. Allez sur SonarQube : http://localhost:9002
4. Cliquez sur **"Projects"** dans le menu
5. Vous devriez voir le projet `lca-lite` apparaître automatiquement

## 🐛 Si les projets ne sont pas créés automatiquement

### Vérifier les logs SonarQube

```bash
docker logs ecolabel-sonarqube | tail -50
```

### Vérifier les logs du build Jenkins

Dans Jenkins, consultez "Console Output" de l'étape "SonarQube Analysis" pour voir les erreurs éventuelles.

### Erreurs courantes

1. **"Unable to connect to SonarQube"**
   - Vérifiez que SonarQube est démarré : `docker ps | grep sonarqube`
   - Vérifiez l'URL dans le Jenkinsfile : doit être `http://sonarqube:9000`

2. **"Invalid token"**
   - Vérifiez que le token est correct dans les credentials Jenkins
   - Régénérez un nouveau token dans SonarQube si nécessaire

3. **"Project already exists"**
   - C'est normal si le projet existe déjà
   - L'analyse sera mise à jour au lieu de créer un nouveau projet

---

**Note** : Les projets sont créés automatiquement lors de la première analyse réussie. Si l'analyse échoue, le projet ne sera pas créé.

