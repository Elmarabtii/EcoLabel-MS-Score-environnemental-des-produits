# Configuration Jenkins pour EcoLabel

Ce dossier contient les fichiers de configuration et templates pour Jenkins.

## Fichiers

- `Jenkinsfile.template` : Template pour les microservices Python
- `Jenkinsfile.frontend.template` : Template pour le frontend React
- `install-plugins.sh` : Script pour installer les plugins Jenkins nécessaires

## Utilisation

Les Jenkinsfiles spécifiques sont déjà créés dans chaque microservice :
- `LCALite/Jenkinsfile`
- `NLPIngrédients/Jenkinsfile`
- `ParserProduit/Jenkinsfile`
- `Scoring/Jenkinsfile`
- `Provenance/Jenkinsfile`
- `WidgetAPI/Jenkinsfile`
- `WidgetAPI/WidgetAPI_frontend/Jenkinsfile`

## Installation des plugins

```bash
# Modifiez le script avec vos identifiants Jenkins
chmod +x jenkins/install-plugins.sh
./jenkins/install-plugins.sh
```

Ou installez-les manuellement via l'interface Jenkins :
1. Manage Jenkins > Manage Plugins
2. Installer les plugins listés dans `GUIDE_JENKINS_SONARQUBE.md`

