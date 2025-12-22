import spacy
from typing import List, Dict

# Modèle de base français (à adapter si multi-langue)
nlp = spacy.load("fr_core_news_md")

# Quelques listes/patterns simples pour démarrer
INGREDIENT_KEYWORDS = ["ingrédients", "ingrédient", "composition", "ingredients", "ingredient"]
PACKAGING_KEYWORDS = ["emballage", "bouteille", "sachet", "boîte", "verre", "plastique"]
ORIGIN_KEYWORDS = ["origine", "provenance", "fabriqué en", "made in"]
LABEL_KEYWORDS = ["bio", "écologique", "recyclé", "AB", "équitable", "fairtrade"]

def simple_extract_ingredients(text: str) -> List[str]:
    """
    Version simple : on cherche la ligne qui contient 'ingrédients'
    puis on split par virgule/point-virgule.
    """
    lines = text.split("\n")
    candidates = []
    for line in lines:
        if any(kw.lower() in line.lower() for kw in INGREDIENT_KEYWORDS):
            candidates.append(line)

    ingredients = []
    for line in candidates:
        # retirer le mot 'Ingrédients :' au début
        line_clean = line.split(":", 1)[-1]
        for part in line_clean.split(","):
            ing = part.strip()
            if ing:
                ingredients.append(ing)
    return ingredients

def simple_extract_labels(text: str) -> List[str]:
    found = []
    lower = text.lower()
    for kw in LABEL_KEYWORDS:
        if kw.lower() in lower:
            found.append(kw)
    return list(set(found))

def simple_extract_packaging(text: str) -> List[str]:
    found = []
    lower = text.lower()
    for kw in PACKAGING_KEYWORDS:
        if kw.lower() in lower:
            found.append(kw)
    return list(set(found))

def simple_extract_origins(text: str) -> List[str]:
    found = []
    lower = text.lower()
    for kw in ORIGIN_KEYWORDS:
        if kw.lower() in lower:
            # ici on simplifie, on renvoie juste la phrase qui contient le mot
            found.append(kw)
    return list(set(found))
