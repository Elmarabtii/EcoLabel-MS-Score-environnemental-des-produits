from typing import Dict, Any


def build_lca_request_from_nlp(nlp_output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforme la sortie NLP (NLPResponse) en requête pour le microservice LCA.
    nlp_output est un dict (par ex. NLPResponse.dict()).
    """

    product_id = nlp_output.get("product_id", "UNKNOWN")

    # 1) INGREDIENTS : pour l'instant on laisse vide (tu rempliras plus tard)
    ingredients = []

    # 2) PACKAGING : on mappe les matériaux normalisés vers les codes LCA
    packaging = []
    for p in nlp_output.get("packaging", []):
        # p ressemble à :
        # {"raw": "...", "normalized": "...", "category": "packaging", "eco_ref_code": ..., "confidence": ...}
        norm = (p.get("normalized") or "").lower()

        if norm == "plastique":
            packaging.append({
                "material": "PLASTIC_GENERIC",
                "mass_g": 10.0   # valeur de test
            })
        elif norm in ("carton", "carton recyclé", "boîte en carton"):
            packaging.append({
                "material": "CARDBOARD_GENERIC",
                "mass_g": 5.0
            })

    # 3) TRANSPORT : vide pour l'instant
    transport = []

    return {
        "product_id": product_id,
        "category": "unknown",
        "ingredients": ingredients,
        "packaging": packaging,
        "transport": transport
    }
