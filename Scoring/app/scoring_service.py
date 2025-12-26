from typing import Dict, Any
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Valeurs max théoriques (ajustées pour des produits de consommation courante)
# Ces valeurs représentent un produit très impactant (transport lointain, emballage lourd, etc.)
MAX_CO2 = 2.0       # kg CO2 / produit (au lieu de 10.0 pour être plus réaliste)
MAX_WATER = 100.0   # litres (au lieu de 500.0)
MAX_ENERGY = 20.0   # MJ (au lieu de 100.0)

WEIGHTS = {
    "co2": 0.5,
    "water": 0.3,
    "energy": 0.2
}

PACKAGING_PENALTY = {
    "plastic": 0.1,
    "glass": 0.05,
    "paper": 0.02,
    "other": 0.05,
    "unknown": 0.08
}


def grade_from_score(score: float) -> str:
    if score >= 80:
        return "A"
    elif score >= 60:
        return "B"
    elif score >= 40:
        return "C"
    elif score >= 20:
        return "D"
    else:
        return "E"


def compute_score(
    co2_kg: float,
    water_l: float,
    energy_mj: float,
    packaging_type: str,
    data_completeness: float
) -> Dict[str, Any]:
    # 1) Normalisation inversée (plus c'est impactant, plus le score partiel est faible)
    co2_norm = max(0.0, 1 - (co2_kg / MAX_CO2))
    water_norm = max(0.0, 1 - (water_l / MAX_WATER))
    energy_norm = max(0.0, 1 - (energy_mj / MAX_ENERGY))

    # 2) Score pondéré (0–1)
    global_norm = (
        co2_norm * WEIGHTS["co2"]
        + water_norm * WEIGHTS["water"]
        + energy_norm * WEIGHTS["energy"]
    )

    # 3) Malus emballage
    penalty = PACKAGING_PENALTY.get(packaging_type.lower(), PACKAGING_PENALTY["other"])
    global_norm = max(0.0, global_norm - penalty)

    # 4) Score 0–100
    numeric_score = round(global_norm * 100, 2)

    # 5) Lettre
    grade = grade_from_score(numeric_score)

    # 6) Confiance (combinaison complétude + pénalité)
    confidence = max(0.0, min(1.0, data_completeness * (1 - penalty)))
    confidence = round(confidence, 2)

    details = {
        "weights": WEIGHTS,
        "normalized_indicators": {
            "co2": round(co2_norm, 3),
            "water": round(water_norm, 3),
            "energy": round(energy_norm, 3),
        },
        "packaging_type": packaging_type,
        "packaging_penalty": penalty,
        "data_completeness": data_completeness
    }

    return {
        "numeric_score": numeric_score,
        "grade": grade,
        "confidence": confidence,
        "details": details
    }
