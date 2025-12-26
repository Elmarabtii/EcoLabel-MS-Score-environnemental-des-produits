import re
import spacy
from typing import List

# Modèle de base français (à adapter si multi-langue)
nlp = spacy.load("fr_core_news_md")

# Keywords (gardés)
INGREDIENT_KEYWORDS = ["ingrédients", "ingrédient", "composition", "ingredients", "ingredient"]
PACKAGING_KEYWORDS = ["emballage", "bouteille", "sachet", "boîte", "verre", "plastique", "carton", "papier"]
ORIGIN_KEYWORDS = ["origine", "provenance", "fabriqué en", "made in"]
LABEL_KEYWORDS = ["bio", "écologique", "recyclé", "équitable", "fairtrade"]  # ⚠️ on enlève AB ici

# -------------------------
# Helpers
# -------------------------

def _dedup_keep_order(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for x in items:
        k = x.strip().lower()
        if k and k not in seen:
            out.append(x.strip())
            seen.add(k)
    return out


def _extract_section_value(text: str, key: str) -> str:
    """
    Extrait la valeur d'une ligne: "Key: ...."
    Exemple: "Emballage: Flacon PET 22 g + Bouchon PP 3 g"
    """
    m = re.search(rf"(?mi)^{re.escape(key)}\s*:\s*(.+)$", text)
    return m.group(1).strip() if m else ""


# -------------------------
# Ingredient extraction
# -------------------------

def simple_extract_ingredients(text: str) -> List[str]:
    """
    Version plus propre :
    - Priorité à la ligne "Ingredients (INCI): ..." ou "Ingrédients: ..."
    - Split par virgule
    """
    # 1) priorité INCI
    line = _extract_section_value(text, "Ingredients (INCI)")
    if not line:
        # fallback "Ingrédients" / "Ingredients"
        for k in ["Ingrédients", "Ingredients"]:
            line = _extract_section_value(text, k)
            if line:
                break

    ingredients = []
    if line:
        for part in re.split(r",|;", line):
            ing = part.strip()
            if ing:
                ingredients.append(ing)
        return _dedup_keep_order(ingredients)

    # 2) fallback ancien: chercher lignes contenant keyword
    lines = text.split("\n")
    candidates = []
    for l in lines:
        if any(kw.lower() in l.lower() for kw in INGREDIENT_KEYWORDS):
            candidates.append(l)

    for l in candidates:
        l_clean = l.split(":", 1)[-1]
        for part in re.split(r",|;", l_clean):
            ing = part.strip()
            if ing:
                ingredients.append(ing)

    return _dedup_keep_order(ingredients)


# -------------------------
# Labels extraction (rule-based fiable)
# -------------------------

def simple_extract_labels(text: str) -> List[str]:
    """
    IMPORTANT:
    - On évite le faux label "AB" qui sort juste parce que 'AB' est un token.
    - On détecte explicitement Vegan / 100% recyclable / Bio.
    """
    found = []
    lower = text.lower()

    # vegan
    if re.search(r"\bvegan\b", lower):
        found.append("vegan")

    # recyclable (détecter 100% recyclable)
    if re.search(r"100%\s*recycl", lower) or re.search(r"\brecyclable\b", lower):
        found.append("recyclable")

    # bio / organic
    if re.search(r"\bbio\b", lower) or re.search(r"\borganic\b", lower):
        found.append("bio")

    # fairtrade
    if re.search(r"\bfairtrade\b", lower):
        found.append("fairtrade")

    # garder les autres keywords (sans AB)
    for kw in LABEL_KEYWORDS:
        if kw.lower() in lower:
            found.append(kw.lower())

    return _dedup_keep_order(found)


# -------------------------
# Packaging extraction (rule-based PET/PP)
# -------------------------

def simple_extract_packaging(text: str) -> List[str]:
    """
    IMPORTANT:
    - On ne renvoie pas juste 'emballage' (mot générique).
    - On détecte PET / PP et on renvoie des valeurs utiles.
    """
    found = []
    lower = text.lower()

    # prendre la section Emballage si elle existe
    emballage_line = _extract_section_value(text, "Emballage").lower()

    haystack = emballage_line if emballage_line else lower

    # PET/PP => plastic
    if re.search(r"\bpet\b", haystack) or re.search(r"\bpp\b", haystack):
        # On met des tokens exploitables par mapping LCA
        found.append("PET")
        found.append("PP")
        found.append("plastic")

    # autres matériaux
    if "verre" in haystack:
        found.append("glass")
    if "carton" in haystack:
        found.append("cardboard")
    if "papier" in haystack:
        found.append("paper")
    if "plastique" in haystack and "plastic" not in found:
        found.append("plastic")

    # fallback keywords (mais on ignore le mot "emballage" seul)
    for kw in PACKAGING_KEYWORDS:
        if kw.lower() in lower and kw.lower() != "emballage":
            found.append(kw.lower())

    return _dedup_keep_order(found)


# -------------------------
# Origin extraction (simple)
# -------------------------

def simple_extract_origins(text: str) -> List[str]:
    """
    Amélioration simple :
    - si "Origine: ..." existe, renvoyer la valeur
    - sinon fallback keywords
    """
    found = []
    origine = _extract_section_value(text, "Origine")
    if origine:
        found.append(origine)
        return _dedup_keep_order(found)

    lower = text.lower()
    for kw in ORIGIN_KEYWORDS:
        if kw.lower() in lower:
            found.append(kw)
    return _dedup_keep_order(found)
