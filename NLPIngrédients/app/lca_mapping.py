from typing import Dict, Any, List
import re


# -------------------------
# Helpers
# -------------------------

def _extract_packaging_mass_g(text: str) -> float:
    """
    Essaie de lire une masse dans la ligne Emballage.
    Ex: "Flacon PET 22 g + Bouchon PP 3 g (Total 25 g)" => 25
    Sinon retourne 10 (fallback).
    """
    if not text:
        return 10.0

    # "Total 25 g"
    m = re.search(r"(?i)total\s*(\d+(?:[.,]\d+)?)\s*g", text)
    if m:
        return float(m.group(1).replace(",", "."))

    # sinon additionner tous les "xx g"
    nums = re.findall(r"(?i)(\d+(?:[.,]\d+)?)\s*g", text)
    if nums:
        vals = [float(x.replace(",", ".")) for x in nums]
        return float(sum(vals))

    return 10.0


def _extract_distance_km(text: str) -> float:
    """Ex: 'Distance ~1800 km' -> 1800"""
    if not text:
        return 0.0
    m = re.search(r"(?i)(\d+(?:[.,]\d+)?)\s*km", text)
    return float(m.group(1).replace(",", ".")) if m else 0.0


def _guess_transport_mode(text: str) -> str:
    """
    Renvoie un code de mode (doit exister dans ta table lca_transport_factors.mode)
    """
    t = (text or "").lower()
    if "maritime" in t or "sea" in t:
        if "routier" in t or "road" in t:
            return "SEA_ROAD"
        return "SEA"
    if "routier" in t or "road" in t:
        return "ROAD"
    return "ROAD"


def _dedup_by_material(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    out = []
    for it in items:
        k = it.get("material")
        if k and k not in seen:
            out.append(it)
            seen.add(k)
    return out


# -------------------------
# Main mapping
# -------------------------

def build_lca_request_from_nlp(nlp_output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforme la sortie NLP en requête pour le microservice LCA.

    ATTENDU côté LCALite:
      ingredients: [{code, mass_g}]
      packaging: [{material, mass_g}]
      transport: [{mode, distance_km, mass_kg}]
    """
    product_id = str(nlp_output.get("product_id", "UNKNOWN"))

    # =========================
    # 1) INGREDIENTS (démo: vide pour le moment)
    # =========================
    # -> Pour activer ingredients > 0, il faut mapper les ingrédients vers des codes
    #    existants dans ta table lca_ingredient_factors (ex: WATER, SLES, GLYCERIN...)
    ingredients: List[Dict[str, Any]] = []

    # =========================
    # 2) PACKAGING
    # =========================
    packaging: List[Dict[str, Any]] = []

    # On essaie d'utiliser une ligne emballage si tu l'as (sinon raw_text)
    packaging_text = (
        nlp_output.get("packaging_raw")
        or nlp_output.get("raw_text")
        or ""
    )
    mass_g = _extract_packaging_mass_g(packaging_text)

    for p in nlp_output.get("packaging", []):
        norm = (p.get("normalized") or p.get("raw") or "").lower()

        if norm in ("plastique", "plastic", "pet", "pp"):
            packaging.append({"material": "PLASTIC_GENERIC", "mass_g": mass_g})

        elif norm in ("carton", "cardboard", "papier", "paper"):
            packaging.append({"material": "CARDBOARD_GENERIC", "mass_g": mass_g})

        elif norm in ("verre", "glass"):
            packaging.append({"material": "GLASS_GENERIC", "mass_g": mass_g})

    packaging = _dedup_by_material(packaging)

    # =========================
    # 3) TRANSPORT
    # =========================
    transport: List[Dict[str, Any]] = []

    transport_text = nlp_output.get("transport_raw") or nlp_output.get("packaging_raw") or nlp_output.get("raw_text") or ""
    distance_km = _extract_distance_km(transport_text)
    mode = _guess_transport_mode(transport_text)
    
    # Debug
    print(f"DEBUG Transport extraction: text='{transport_text[:100]}...', distance={distance_km} km, mode={mode}")

    # masse produit en kg - essayer plusieurs sources
    mass_kg = 0.0
    if nlp_output.get("poids_net_g"):
        mass_kg = float(nlp_output.get("poids_net_g", 0)) / 1000.0
    else:
        # Fallback : extraire depuis le texte (ex: "Poids net: 800 g")
        raw_text = nlp_output.get("raw_text") or transport_text
        poids_match = re.search(r"(?i)poids\s*net\s*[:\s]+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b", raw_text)
        if poids_match:
            val = float(poids_match.group(1).replace(",", "."))
            unit = poids_match.group(2).lower()
            if unit == "kg":
                mass_kg = val
            elif unit in ("g", "ml"):
                mass_kg = val / 1000.0
            elif unit == "l":
                mass_kg = val  # approximation 1L = 1kg
        else:
            # Dernier fallback : utiliser 0.5 kg par défaut
            mass_kg = 0.5

    # Inclure aussi la masse d'emballage dans le transport
    packaging_mass_g = _extract_packaging_mass_g(
        nlp_output.get("packaging_raw") or nlp_output.get("raw_text") or ""
    )
    packaging_mass_kg = packaging_mass_g / 1000.0
    total_mass_kg = mass_kg + packaging_mass_kg

    if distance_km > 0 and total_mass_kg > 0:
        transport.append({
            "mode": mode,
            "distance_km": distance_km,
            "mass_kg": total_mass_kg
        })
        # Debug log
        print(f"DEBUG LCA Mapping: Transport créé - mode={mode}, distance={distance_km} km, mass={total_mass_kg} kg")
    else:
        print(f"DEBUG LCA Mapping: Transport NON créé - distance={distance_km} km, mass={total_mass_kg} kg")

    return {
        "product_id": product_id,
        "category": nlp_output.get("categorie") or "unknown",
        "ingredients": ingredients,
        "packaging": packaging,
        "transport": transport
    }
