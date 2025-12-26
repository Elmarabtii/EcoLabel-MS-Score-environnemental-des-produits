.PHONY: help build up down restart logs clean init-db

help: ## Affiche cette aide
	@echo "Commandes disponibles :"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construire toutes les images Docker
	docker-compose build

up: ## Démarrer tous les services
	docker-compose up -d
	@echo "⏳ Attente du démarrage des services..."
	@sleep 10
	@echo "✅ Services démarrés !"
	@echo "📊 Vérifiez les logs avec: make logs"

down: ## Arrêter tous les services
	docker-compose down

restart: ## Redémarrer tous les services
	docker-compose restart

logs: ## Voir les logs de tous les services
	docker-compose logs -f

logs-parser: ## Voir les logs du service Parser
	docker-compose logs -f parser-produit

logs-nlp: ## Voir les logs du service NLP
	docker-compose logs -f nlp-ingredients

logs-lca: ## Voir les logs du service LCA
	docker-compose logs -f lca-lite

logs-scoring: ## Voir les logs du service Scoring
	docker-compose logs -f scoring

logs-widget: ## Voir les logs du service WidgetAPI
	docker-compose logs -f widget-api

logs-provenance: ## Voir les logs du service Provenance
	docker-compose logs -f provenance

clean: ## Arrêter et supprimer tous les conteneurs et volumes
	docker-compose down -v
	@echo "⚠️  Toutes les données ont été supprimées !"

init-db: ## Initialiser les bases de données avec les données de référence
	@chmod +x init-databases.sh
	./init-databases.sh

ps: ## Voir l'état de tous les services
	docker-compose ps

stats: ## Voir l'utilisation des ressources
	docker stats

rebuild: ## Reconstruire et redémarrer tous les services
	docker-compose build
	docker-compose up -d

test: ## Tester que tous les services répondent
	@echo "🧪 Test des services..."
	@curl -s http://localhost:8000/ | grep -q "OK" && echo "✅ ParserProduit (8000)" || echo "❌ ParserProduit (8000)"
	@curl -s http://localhost:8001/ | grep -q "OK" && echo "✅ NLPIngrédients (8001)" || echo "❌ NLPIngrédients (8001)"
	@curl -s http://localhost:8002/ | grep -q "OK" && echo "✅ LCALite (8002)" || echo "❌ LCALite (8002)"
	@curl -s http://localhost:8006/health | grep -q "ok" && echo "✅ Provenance (8006)" || echo "❌ Provenance (8006)"
	@curl -s http://localhost:8004/health | grep -q "ok" && echo "✅ Scoring (8004)" || echo "❌ Scoring (8004)"
	@curl -s http://localhost:8005/ | grep -q "OK" && echo "✅ WidgetAPI (8005)" || echo "❌ WidgetAPI (8005)"

