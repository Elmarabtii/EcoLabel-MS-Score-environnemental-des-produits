@echo off
REM Script d'initialisation des bases de données pour Windows
REM Ce script insère les données de référence nécessaires

echo 🚀 Initialisation des bases de données EcoLabel-MS...

REM Attendre que les bases de données soient prêtes
echo ⏳ Attente du démarrage des bases de données...
timeout /t 15 /nobreak >nul

REM Base LCA - Facteurs d'ingrédients
echo 📊 Initialisation de la base LCA...
set PGPASSWORD=admin
psql -h localhost -p 5435 -U postgres -d eco_lca -c "INSERT INTO lca_ingredient_factors (code, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg) VALUES ('WATER', 0.001, 0.1, 0.01), ('SLES', 2.5, 15.0, 8.0), ('GLYCERIN', 1.8, 12.0, 6.0), ('SODIUM_CHLORIDE', 0.5, 2.0, 1.0), ('CITRIC_ACID', 1.2, 8.0, 4.0), ('PARFUM', 3.0, 20.0, 10.0) ON CONFLICT (code) DO NOTHING;"

psql -h localhost -p 5435 -U postgres -d eco_lca -c "INSERT INTO lca_packaging_factors (material, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg) VALUES ('PET', 2.5, 15.0, 4.0), ('PP', 2.8, 18.0, 4.5), ('PLASTIC_GENERIC', 2.6, 16.0, 4.2), ('GLASS_GENERIC', 1.2, 8.0, 2.5), ('CARDBOARD_GENERIC', 1.5, 10.0, 3.0) ON CONFLICT (material) DO NOTHING;"

psql -h localhost -p 5435 -U postgres -d eco_lca -c "INSERT INTO lca_transport_factors (mode, co2_kg_per_tkm, water_l_per_tkm, energy_mj_per_tkm) VALUES ('SEA', 0.015, 0.1, 0.05), ('ROAD', 0.1, 0.5, 0.3), ('AIR', 0.5, 2.0, 1.0) ON CONFLICT (mode) DO NOTHING;"

REM Base NLP - Taxonomies
echo 📊 Initialisation de la base NLP...
psql -h localhost -p 5434 -U postgres -d ecolabel_nlp -c "INSERT INTO ingredient_taxonomy (name, synonyms, eco_ref_code) VALUES ('Aqua', 'water;eau', 'WATER'), ('Water', 'aqua;eau', 'WATER'), ('Sodium Laureth Sulfate', 'sles;SLES', 'SLES'), ('SLES', 'sodium laureth sulfate', 'SLES'), ('Glycerin', 'glycerine', 'GLYCERIN'), ('Glycerine', 'glycerin', 'GLYCERIN'), ('Sodium Chloride', 'salt;sel', 'SODIUM_CHLORIDE'), ('Citric Acid', 'acide citrique', 'CITRIC_ACID'), ('Parfum', 'fragrance', 'PARFUM') ON CONFLICT (name) DO NOTHING;"

psql -h localhost -p 5434 -U postgres -d ecolabel_nlp -c "INSERT INTO packaging_taxonomy (name, synonyms, eco_ref_code) VALUES ('PET', 'polyethylene terephthalate', 'PET'), ('PP', 'polypropylene', 'PP'), ('Plastique', 'plastic', 'PLASTIC_GENERIC'), ('Verre', 'glass', 'GLASS_GENERIC'), ('Carton', 'cardboard;papier;paper', 'CARDBOARD_GENERIC') ON CONFLICT (name) DO NOTHING;"

psql -h localhost -p 5434 -U postgres -d ecolabel_nlp -c "INSERT INTO label_taxonomy (name, synonyms) VALUES ('Vegan', 'vegane'), ('Bio', 'organic;biologique'), ('Recyclable', 'recyclable;100%% recyclable'), ('Commerce équitable', 'fairtrade;fair trade') ON CONFLICT (name) DO NOTHING;"

echo ✅ Initialisation terminée !


