import httpx
from .config import SCORING_SERVICE_URL


def send_to_scoring(
    product_id: int,
    co2_kg: float,
    water_l: float,
    energy_mj: float,
    packaging_type: str,
    data_completeness: float = 1.0
):
    """
    Client HTTP vers le microservice MS4 Scoring.
    Envoie les indicateurs ACV et récupère le score (A–E, numeric_score, etc.).
    """
    payload = {
        "product_id": product_id,
        "co2_kg": co2_kg,
        "water_l": water_l,
        "energy_mj": energy_mj,
        "packaging_type": packaging_type,
        "data_completeness": data_completeness
    }

    response = httpx.post(SCORING_SERVICE_URL, json=payload, timeout=5.0)
    response.raise_for_status()
    return response.json()
