import pandas as pd
import numpy as np
from typing import Tuple, List, Optional
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')


class DatasetLoader:
    """Classe pour charger et préparer les données d'entraînement"""
    
    def __init__(self, dataset_path: Optional[str] = None, use_kaggle_calibration: bool = True):
        self.dataset_path = dataset_path
        self.use_kaggle_calibration = use_kaggle_calibration
        
        # Paramètres Gamma par défaut (seront remplacés si calibration Kaggle disponible)
        self.k_co2, self.th_co2 = 2.0, 0.5
        self.k_water, self.th_water = 3.0, 20.0
        self.k_energy, self.th_energy = 2.0, 8.0
        
        # Calibrer depuis Kaggle si demandé et disponible
        if use_kaggle_calibration:
            try:
                self._calibrate_from_kaggle()
            except Exception:
                # En cas d'erreur, utiliser les valeurs par défaut (déjà initialisées)
                pass
    
    def _find_col(self, df: pd.DataFrame, keywords: List[str]) -> str:
        """Find a column name by matching keywords (case-insensitive)"""
        cols = df.columns.tolist()
        lower = {c: c.lower() for c in cols}
        
        # match all keywords
        for c in cols:
            name = lower[c]
            if all(k.lower() in name for k in keywords):
                return c
        
        # match any keyword
        for c in cols:
            name = lower[c]
            if any(k.lower() in name for k in keywords):
                return c
        
        raise KeyError(f"No column found for keywords={keywords}. Available cols: {cols[:60]}")
    
    def _to_numeric_series(self, s: pd.Series) -> pd.Series:
        """Convert a Series to numeric robustly (handles commas/spaces)"""
        return pd.to_numeric(
            s.astype(str).str.replace(",", "").str.strip(),
            errors="coerce"
        )
    
    def _gamma_mom_fit(self, x: np.ndarray) -> Tuple[float, float]:
        """
        Fit Gamma(k, theta) using method of moments:
        mean = k*theta, var = k*theta^2  => k = mean^2/var, theta = var/mean
        """
        x = x[np.isfinite(x)]
        x = x[x > 0]
        if len(x) < 10:
            return 2.0, 1.0
        mean = x.mean()
        var = x.var(ddof=0)
        if mean <= 0 or var <= 0:
            return 2.0, 1.0
        k = (mean * mean) / var
        theta = var / mean
        return float(k), float(theta)
    
    def _calibrate_from_kaggle(self):
        """Calibre les distributions Gamma depuis les datasets Kaggle"""
        try:
            # Chemins vers les datasets Kaggle
            base_path = Path(__file__).parent
            dataset_dir = base_path / "datasets"
            emissions_csv = dataset_dir / "Food_Product_Emissions.csv"
            food_prod_csv = dataset_dir / "Food_Production.csv"
            
            if not emissions_csv.exists() or not food_prod_csv.exists():
                raise FileNotFoundError(f"Fichiers Kaggle non trouvés dans {dataset_dir}")
            
            # Charger les datasets
            df_em = pd.read_csv(emissions_csv)
            df_fp = pd.read_csv(food_prod_csv)
            
            # Détecter les colonnes
            co2_col_em = self._find_col(df_em, ["emission"])
            co2_em = self._to_numeric_series(df_em[co2_col_em]).dropna()
            
            water_col_fp = self._find_col(df_fp, ["water"])
            water_fp = self._to_numeric_series(df_fp[water_col_fp]).dropna()
            
            # Energy (optionnel)
            try:
                energy_col_fp = self._find_col(df_fp, ["energy"])
                energy_fp = self._to_numeric_series(df_fp[energy_col_fp]).dropna()
            except (KeyError, Exception):
                energy_fp = None
            
            # Calibrer les distributions Gamma
            if len(co2_em) > 0:
                self.k_co2, self.th_co2 = self._gamma_mom_fit(co2_em.to_numpy())
            if len(water_fp) > 0:
                self.k_water, self.th_water = self._gamma_mom_fit(water_fp.to_numpy())
            
            if energy_fp is not None and len(energy_fp) > 0:
                self.k_energy, self.th_energy = self._gamma_mom_fit(energy_fp.to_numpy())
            
        except Exception as e:
            # En cas d'erreur, utiliser les valeurs par défaut
            raise Exception(f"Erreur lors de la calibration Kaggle: {e}")
    
    def generate_synthetic_dataset(self, n_samples: int = 5000, use_calibrated: bool = True, noise_level: float = 0.05, balanced: bool = True) -> pd.DataFrame:
        """
        Génère un dataset synthétique pour l'entraînement
        
        Args:
            n_samples: Nombre d'échantillons à générer (recommandé: 5000-10000 pour meilleurs résultats ML)
            use_calibrated: Si True, utilise les paramètres calibrés depuis Kaggle (si disponible)
            noise_level: Niveau de bruit à ajouter au target_score (0.0 = aucun bruit, 0.05 = 5% de bruit)
                        Simule l'incertitude de mesure dans les données réelles
            balanced: Si True, génère une distribution équilibrée (même nombre d'échantillons par grade)
        """
        np.random.seed(42)
        
        # Valeurs max pour clipping (alignées avec scoring_service.py)
        MAX_CO2 = 2.0
        MAX_WATER = 100.0
        MAX_ENERGY = 20.0
        
        # Pénalités emballage
        PACKAGING_PENALTY = {
            "plastic": 0.10,
            "glass": 0.05,
            "paper": 0.02,
            "other": 0.08
        }
        
        if balanced:
            # GÉNÉRATION STRATIFIÉE : générer le même nombre d'échantillons pour chaque grade
            # avec une distribution UNIFORME des scores numériques (pas seulement des grades)
            samples_per_grade = n_samples // 5
            all_data = []
            
            # Nouvelle approche : générer des scores uniformément répartis, puis trouver les valeurs d'entrée
            # Générer des scores cibles uniformément répartis sur 0-100
            uniform_scores = np.random.uniform(0, 100, n_samples)
            
            # OPTIMISATION: Génération vectorisée par batch pour améliorer les performances
            batch_size = min(1000, n_samples)  # Traiter par batches pour équilibrer mémoire et performance
            
            for batch_start in range(0, n_samples, batch_size):
                batch_end = min(batch_start + batch_size, n_samples)
                batch_scores = uniform_scores[batch_start:batch_end]
                
                for target_score in batch_scores:
                    # Tolérance adaptative : plus stricte pour les scores moyens, plus lâche aux extrêmes
                    if 30 <= target_score <= 70:
                        target_tolerance = 1.0  # Tolérance stricte pour la zone moyenne
                        max_iterations = 200
                    else:
                        target_tolerance = 2.0  # Tolérance plus large pour les extrêmes
                        max_iterations = 150
                    
                    best_diff = float('inf')
                    best_values = None
                    
                    # Déterminer le grade cible basé sur le score
                    if target_score >= 80:
                        grade = 'A'
                        co2_range = (0.05, 0.5)
                        water_range = (5, 35)
                        energy_range = (1, 7)
                        pkg_probs = {"paper": 0.7, "glass": 0.2, "other": 0.1, "plastic": 0.0}
                    elif target_score >= 60:
                        grade = 'B'
                        co2_range = (0.3, 0.9)
                        water_range = (25, 55)
                        energy_range = (5, 11)
                        pkg_probs = {"paper": 0.4, "glass": 0.35, "other": 0.15, "plastic": 0.1}
                    elif target_score >= 40:
                        grade = 'C'
                        co2_range = (0.7, 1.3)
                        water_range = (45, 75)
                        energy_range = (9, 15)
                        pkg_probs = {"glass": 0.3, "paper": 0.3, "other": 0.25, "plastic": 0.15}
                    elif target_score >= 20:
                        grade = 'D'
                        co2_range = (1.1, 1.7)
                        water_range = (65, 90)
                        energy_range = (13, 18)
                        pkg_probs = {"plastic": 0.4, "glass": 0.3, "other": 0.2, "paper": 0.1}
                    else:
                        grade = 'E'
                        co2_range = (1.5, 2.0)
                        water_range = (80, 100)
                        energy_range = (16, 20)
                        pkg_probs = {"plastic": 0.55, "other": 0.3, "glass": 0.1, "paper": 0.05}
                    
                    pkg_choices = list(pkg_probs.keys())
                    pkg_values = [pkg_probs[k] for k in pkg_choices]
                    
                    # Génération optimisée avec early stopping
                    for iteration in range(max_iterations):
                        co2_kg = np.random.uniform(*co2_range)
                        water_l = np.random.uniform(*water_range)
                        energy_mj = np.random.uniform(*energy_range)
                        pkg = np.random.choice(pkg_choices, p=pkg_values)
                        
                        # Calculer le score obtenu
                        co2_norm = np.clip(1 - (co2_kg / MAX_CO2), 0, 1)
                        water_norm = np.clip(1 - (water_l / MAX_WATER), 0, 1)
                        energy_norm = np.clip(1 - (energy_mj / MAX_ENERGY), 0, 1)
                        
                        global_norm = co2_norm * 0.5 + water_norm * 0.3 + energy_norm * 0.2
                        penalty = PACKAGING_PENALTY[pkg]
                        global_norm = np.clip(global_norm - penalty, 0, 1)
                        computed_score = global_norm * 100
                        
                        # Trouver la valeur la plus proche du score cible
                        diff = abs(computed_score - target_score)
                        if diff < best_diff:
                            best_diff = diff
                            best_values = (co2_kg, water_l, energy_mj, pkg, computed_score)
                            
                            # Early stopping si on est assez proche
                            if diff < target_tolerance:
                                break
                        
                        # Early stopping si on n'améliore plus après 50 itérations
                        if iteration > 50 and best_diff < target_tolerance * 2:
                            break
                    
                    # Utiliser les meilleures valeurs trouvées
                    co2_kg, water_l, energy_mj, pkg, computed_score = best_values
                    
                    all_data.append({
                        'co2_kg': co2_kg,
                        'water_l': water_l,
                        'energy_mj': energy_mj,
                        'packaging_plastic': 1 if pkg == "plastic" else 0,
                        'packaging_glass': 1 if pkg == "glass" else 0,
                        'packaging_paper': 1 if pkg == "paper" else 0,
                        'packaging_other': 1 if pkg == "other" else 0,
                        'data_completeness': np.random.beta(5, 2),
                        'ingredient_count': np.random.poisson(15),
                        'transport_distance_km': np.random.exponential(500),
                        'target_score': target_score,  # Utiliser le score cible uniforme
                        'target_grade': grade
                    })
            
            df = pd.DataFrame(all_data)
            
        else:
            # MÉTHODE ORIGINALE (non équilibrée)
            if use_calibrated and self.use_kaggle_calibration:
                k_co2, th_co2 = self.k_co2, self.th_co2
                k_water, th_water = self.k_water, self.th_water
                k_energy, th_energy = self.k_energy, self.th_energy
            else:
                k_co2, th_co2 = 1.5, 0.6
                k_water, th_water = 1.8, 30.0
                k_energy, th_energy = 1.5, 10.0
            
            co2_kg = np.random.gamma(k_co2, th_co2, n_samples)
            water_l = np.random.gamma(k_water, th_water, n_samples)
            energy_mj = np.random.gamma(k_energy, th_energy, n_samples)
            
            co2_kg = np.clip(co2_kg, 0, MAX_CO2)
            water_l = np.clip(water_l, 0, MAX_WATER)
            energy_mj = np.clip(energy_mj, 0, MAX_ENERGY)
            
            pkg = np.random.choice(["plastic", "glass", "paper", "other"], 
                                  size=n_samples, p=[0.25, 0.25, 0.30, 0.20])
            
            data = {
                'co2_kg': co2_kg,
                'water_l': water_l,
                'energy_mj': energy_mj,
                'packaging_plastic': (pkg == "plastic").astype(int),
                'packaging_glass': (pkg == "glass").astype(int),
                'packaging_paper': (pkg == "paper").astype(int),
                'packaging_other': (pkg == "other").astype(int),
                'data_completeness': np.random.beta(5, 2, n_samples),
                'ingredient_count': np.random.poisson(15, n_samples),
                'transport_distance_km': np.random.exponential(500, n_samples),
            }
            
            df = pd.DataFrame(data)
            
            # Calcul du score cible
            co2_norm = np.clip(1 - (df['co2_kg'] / MAX_CO2), 0, 1)
            water_norm = np.clip(1 - (df['water_l'] / MAX_WATER), 0, 1)
            energy_norm = np.clip(1 - (df['energy_mj'] / MAX_ENERGY), 0, 1)
            
            global_norm = co2_norm * 0.5 + water_norm * 0.3 + energy_norm * 0.2
            
            packaging_penalty = (
                df['packaging_plastic'] * 0.10 +
                df['packaging_glass'] * 0.05 +
                df['packaging_paper'] * 0.02 +
                df['packaging_other'] * 0.08
            )
            
            global_norm = np.clip(global_norm - packaging_penalty, 0, 1)
            df['target_score'] = global_norm * 100
            
            grade = pd.cut(
                df['target_score'],
                bins=[-np.inf, 20, 40, 60, 80, np.inf],
                labels=['E', 'D', 'C', 'B', 'A']
            )
            df['target_grade'] = grade.astype(str)
        
        # Ajouter du bruit si demandé
        if noise_level > 0:
            noise = np.random.normal(0, noise_level * 100, len(df))
            df['target_score'] = df['target_score'] + noise
            df['target_score'] = np.clip(df['target_score'], 0, 100)
            
            # Recalculer les grades après bruit
            grade = pd.cut(
                df['target_score'],
                bins=[-np.inf, 20, 40, 60, 80, np.inf],
                labels=['E', 'D', 'C', 'B', 'A']
            )
            df['target_grade'] = grade.astype(str)
        
        # Mélanger les lignes pour éviter l'ordre par grade
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        return df
    
    def load_from_csv(self, file_path: str) -> pd.DataFrame:
        """
        Charge un dataset depuis un fichier CSV
        
        Format attendu:
        - Colonnes de features: co2_kg, water_l, energy_mj, packaging_type, data_completeness, etc.
        - Colonnes cibles: target_score, target_grade
        """
        df = pd.read_csv(file_path)
        
        # Vérification des colonnes requises
        required_features = ['co2_kg', 'water_l', 'energy_mj']
        missing = [col for col in required_features if col not in df.columns]
        if missing:
            raise ValueError(f"Colonnes manquantes dans le CSV: {missing}")
        
        # Encodage du packaging si présent
        if 'packaging_type' in df.columns:
            df = self._encode_packaging(df)
        
        return df
    
    def load_from_json(self, file_path: str) -> pd.DataFrame:
        """
        Charge un dataset depuis un fichier JSON
        
        Format attendu: Liste de dictionnaires avec les mêmes colonnes que le CSV
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        df = pd.DataFrame(data)
        
        # Encodage du packaging si présent
        if 'packaging_type' in df.columns:
            df = self._encode_packaging(df)
        
        return df
    
    def load_from_database(self, db_session) -> pd.DataFrame:
        """
        Charge les données depuis la base de données existante
        """
        raise NotImplementedError("À implémenter selon votre structure de base de données")
    
    def _encode_packaging(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode le type d'emballage en variables binaires one-hot"""
        packaging_types = ['plastic', 'glass', 'paper', 'other']
        
        # Initialiser les colonnes
        for pkg_type in packaging_types:
            df[f'packaging_{pkg_type}'] = 0
        
        # Encoder selon packaging_type
        if 'packaging_type' in df.columns:
            for pkg_type in packaging_types:
                mask = df['packaging_type'].str.lower().str.contains(pkg_type, na=False)
                df.loc[mask, f'packaging_{pkg_type}'] = 1
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prépare les features et la cible pour l'entraînement
        
        Returns:
            X: DataFrame des features
            y: Series de la cible (numeric_score)
        """
        # Features de base
        feature_columns = [
            'co2_kg', 'water_l', 'energy_mj',
            'packaging_plastic', 'packaging_glass', 'packaging_paper', 'packaging_other',
            'data_completeness'
        ]
        
        # Ajouter features optionnelles si présentes
        optional_features = ['ingredient_count', 'transport_distance_km']
        for feat in optional_features:
            if feat in df.columns:
                feature_columns.append(feat)
        
        # Sélectionner uniquement les colonnes présentes
        available_features = [f for f in feature_columns if f in df.columns]
        X = df[available_features].copy()
        
        # Vérifier que la cible existe
        if 'target_score' not in df.columns:
            raise ValueError("La colonne 'target_score' est requise dans le dataset")
        
        y = df['target_score']
        
        return X, y
    
    def save_dataset(self, df: pd.DataFrame, output_path: str):
        """Sauvegarde le dataset dans un fichier CSV"""
        output_path_obj = Path(output_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Dataset sauvegardé dans {output_path}")