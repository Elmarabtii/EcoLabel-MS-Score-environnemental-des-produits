#!/bin/bash
# Script pour installer les plugins Jenkins nécessaires

JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_PASSWORD=""  # À remplir avec votre mot de passe

# Liste des plugins à installer
PLUGINS=(
    "sonarqube-scanner"
    "htmlpublisher"
    "workflow-aggregator"
    "docker-workflow"
    "coverage"
    "warnings-ng"
    "pipeline-stage-view"
    "blueocean"
)

echo "Installation des plugins Jenkins..."

for plugin in "${PLUGINS[@]}"; do
    echo "Installation de $plugin..."
    curl -X POST -u "$JENKINS_USER:$JENKINS_PASSWORD" \
        "$JENKINS_URL/pluginManager/installNecessaryPlugins" \
        -d "<install plugin='$plugin@latest' />" \
        -H "Content-Type: text/xml"
done

echo "Plugins installés! Redémarrez Jenkins pour finaliser l'installation."

