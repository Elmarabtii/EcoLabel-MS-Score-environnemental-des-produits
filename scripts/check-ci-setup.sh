#!/bin/bash
# Script de vérification de la configuration CI/CD

echo "🔍 Vérification de la configuration CI/CD..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier si un service est accessible
check_service() {
    local name=$1
    local url=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302\|401"; then
        echo -e "${GREEN}✅${NC} $name est accessible sur $url"
        return 0
    else
        echo -e "${RED}❌${NC} $name n'est pas accessible sur $url"
        return 1
    fi
}

# Vérifier Docker
echo "1. Vérification de Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker est installé"
    docker --version
else
    echo -e "${RED}❌${NC} Docker n'est pas installé"
    exit 1
fi

if docker ps &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker est démarré"
else
    echo -e "${RED}❌${NC} Docker n'est pas démarré"
    exit 1
fi
echo ""

# Vérifier les conteneurs
echo "2. Vérification des conteneurs CI/CD..."
if docker ps | grep -q "ecolabel-jenkins"; then
    echo -e "${GREEN}✅${NC} Conteneur Jenkins est en cours d'exécution"
else
    echo -e "${YELLOW}⚠️${NC} Conteneur Jenkins n'est pas en cours d'exécution"
    echo "   Lancez: docker-compose -f docker-compose.ci.yml up -d"
fi

if docker ps | grep -q "ecolabel-sonarqube"; then
    echo -e "${GREEN}✅${NC} Conteneur SonarQube est en cours d'exécution"
else
    echo -e "${YELLOW}⚠️${NC} Conteneur SonarQube n'est pas en cours d'exécution"
    echo "   Lancez: docker-compose -f docker-compose.ci.yml up -d"
fi

if docker ps | grep -q "ecolabel-sonarqube-db"; then
    echo -e "${GREEN}✅${NC} Conteneur SonarQube DB est en cours d'exécution"
else
    echo -e "${YELLOW}⚠️${NC} Conteneur SonarQube DB n'est pas en cours d'exécution"
fi
echo ""

# Vérifier les ports
echo "3. Vérification des ports..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
    echo -e "${GREEN}✅${NC} Port 8080 (Jenkins) est utilisé"
else
    echo -e "${YELLOW}⚠️${NC} Port 8080 (Jenkins) n'est pas utilisé"
fi

if lsof -Pi :9002 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":9002.*LISTEN"; then
    echo -e "${GREEN}✅${NC} Port 9002 (SonarQube) est utilisé"
else
    echo -e "${YELLOW}⚠️${NC} Port 9002 (SonarQube) n'est pas utilisé"
fi
echo ""

# Vérifier l'accessibilité des services
echo "4. Vérification de l'accessibilité des services..."
sleep 2

if check_service "Jenkins" "http://localhost:8080"; then
    echo "   📝 Mot de passe initial:"
    echo "   docker exec ecolabel-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
fi

if check_service "SonarQube" "http://localhost:9002"; then
    echo "   🔐 Identifiants par défaut: admin / admin"
fi
echo ""

# Vérifier les fichiers de configuration
echo "5. Vérification des fichiers de configuration..."
if [ -f "docker-compose.ci.yml" ]; then
    echo -e "${GREEN}✅${NC} docker-compose.ci.yml existe"
else
    echo -e "${RED}❌${NC} docker-compose.ci.yml n'existe pas"
fi

jenkinsfiles=(
    "LCALite/Jenkinsfile"
    "NLPIngrédients/Jenkinsfile"
    "ParserProduit/Jenkinsfile"
    "Scoring/Jenkinsfile"
    "Provenance/Jenkinsfile"
    "WidgetAPI/Jenkinsfile"
    "WidgetAPI/WidgetAPI_frontend/Jenkinsfile"
)

for file in "${jenkinsfiles[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file existe"
    else
        echo -e "${RED}❌${NC} $file n'existe pas"
    fi
done
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résumé:"
echo ""
echo "Pour démarrer les services CI/CD:"
echo "  docker-compose -f docker-compose.ci.yml up -d"
echo ""
echo "Pour accéder aux services:"
echo "  Jenkins:    http://localhost:8080"
echo "  SonarQube:  http://localhost:9002"
echo ""
echo "Consultez GUIDE_ETAPE_PAR_ETAPE_CI_CD.md pour la configuration complète"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

