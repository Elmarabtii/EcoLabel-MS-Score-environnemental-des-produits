@echo off
REM Script de vérification de la configuration CI/CD (Windows)

echo 🔍 Vérification de la configuration CI/CD...
echo.

REM Vérifier Docker
echo 1. Vérification de Docker...
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Docker est installé
    docker --version
) else (
    echo ❌ Docker n'est pas installé
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Docker est démarré
) else (
    echo ❌ Docker n'est pas démarré
    exit /b 1
)
echo.

REM Vérifier les conteneurs
echo 2. Vérification des conteneurs CI/CD...
docker ps | findstr "ecolabel-jenkins" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Conteneur Jenkins est en cours d'exécution
) else (
    echo ⚠️  Conteneur Jenkins n'est pas en cours d'exécution
    echo    Lancez: docker-compose -f docker-compose.ci.yml up -d
)

docker ps | findstr "ecolabel-sonarqube" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Conteneur SonarQube est en cours d'exécution
) else (
    echo ⚠️  Conteneur SonarQube n'est pas en cours d'exécution
    echo    Lancez: docker-compose -f docker-compose.ci.yml up -d
)
echo.

REM Vérifier les ports
echo 3. Vérification des ports...
netstat -an | findstr ":8080" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Port 8080 (Jenkins) est utilisé
) else (
    echo ⚠️  Port 8080 (Jenkins) n'est pas utilisé
)

netstat -an | findstr ":9002" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Port 9002 (SonarQube) est utilisé
) else (
    echo ⚠️  Port 9002 (SonarQube) n'est pas utilisé
)
echo.

REM Vérifier les fichiers
echo 4. Vérification des fichiers de configuration...
if exist "docker-compose.ci.yml" (
    echo ✅ docker-compose.ci.yml existe
) else (
    echo ❌ docker-compose.ci.yml n'existe pas
)

if exist "LCALite\Jenkinsfile" (
    echo ✅ LCALite\Jenkinsfile existe
) else (
    echo ❌ LCALite\Jenkinsfile n'existe pas
)
echo.

REM Résumé
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 Résumé:
echo.
echo Pour démarrer les services CI/CD:
echo   docker-compose -f docker-compose.ci.yml up -d
echo.
echo Pour accéder aux services:
echo   Jenkins:    http://localhost:8080
echo   SonarQube:  http://localhost:9002
echo.
echo Consultez GUIDE_ETAPE_PAR_ETAPE_CI_CD.md pour la configuration complète
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pause

