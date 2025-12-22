# app/services/parser_logic.py
import re


def normalize_text(text: str) -> str:
    """
    Nettoyage simple :
    - remplacer \\r par \\n
    - supprimer les lignes vides
    - trim des espaces
    """
    text = text.replace("\r", "\n")
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return "\n".join(lines)


def extract_after(labels_pattern: str, text: str) -> str:
    """
    Extrait ce qui vient après un libellé de type :
      Ingrédients : ...
      Ingredients : ...
      Contains : ...
      Origine : ...
      Made in : ...
    """
    pattern = rf"({labels_pattern})\s*[:\-]\s*(.+)"
    m = re.search(pattern, text, flags=re.IGNORECASE)
    return m.group(2).strip() if m else ""


def extract_block(label_keywords: str, text: str) -> str:
    """
    Extrait un bloc après un titre type :
      INGREDIENTS
      INGREDIENTS :
      CONTAINS :
    Capture jusqu'à un autre titre en MAJUSCULES ou la fin du texte.
    """
    pattern = rf"({label_keywords})\s*[:\-]?\s*(.+?)(?=\n[A-Z][A-Z0-9 \-/]{{3,}}\n|\Z)"
    m = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(2).strip()
    return ""


def detect_gtin(text: str) -> str:
    """
    Essaie de trouver un GTIN/EAN (8 à 14 chiffres) dans le texte OCR.

    ⚠ Limitation :
    - On ne lit que des séquences de chiffres CONTIGÜES (pas les codes-barres au format image).
    - Pour un vrai scan de code-barres, il faudra utiliser une lib comme pyzbar/zxing
      directement sur l'image.
    """
    # Suite de 8 à 14 chiffres
    m = re.search(r"\b(\d{8,14})\b", text)
    return m.group(1) if m else ""


def looks_like_ingredients_only(text: str) -> bool:
    """
    Heuristique simple : beaucoup de virgules / points-virgules
    et pas de mots typiques de tableau nutritionnel.
    """
    t = text.lower()
    nutrition_keywords = [
        "énergie", "energie", "kcal", "kj",
        "fat", "saturates", "carbohydrate", "sugars",
        "protein", "sel", "salt", "fibres", "fibers"
    ]
    if any(kw in t for kw in nutrition_keywords):
        return False
    return ("," in t) or (";" in t)


def guess_ingredients_by_commas(text: str) -> str:
    """
    Devine un bloc d'ingrédients en se basant sur les lignes contenant des virgules
    (ou des points-virgules).
    On prend le plus long bloc contigu de lignes avec des virgules.
    """
    lines = text.split("\n")
    candidate_blocks = []
    current_block = []

    for line in lines:
        l = line.strip()
        # Heuristique : une ligne avec une virgule/point-virgule et au moins quelques mots
        if ("," in l or ";" in l) and len(l.split()) >= 3:
            current_block.append(l)
        else:
            if current_block:
                candidate_blocks.append(" ".join(current_block))
                current_block = []

    # Si on finit sur un bloc en cours
    if current_block:
        candidate_blocks.append(" ".join(current_block))

    if not candidate_blocks:
        return ""

    # On retourne le bloc le plus long (en nombre de caractères)
    return max(candidate_blocks, key=len)


def guess_product_name(text_norm: str) -> str:
    """
    Essaie de deviner un 'nom de produit' raisonnable :
    - première ligne qui contient au moins 3 lettres,
    - sinon première ligne tout court.
    """
    lines = text_norm.split("\n")
    for line in lines:
        if len(re.findall(r"[A-Za-zÀ-ÿ]", line)) >= 3:
            return line.strip()
    return lines[0].strip() if lines else "Produit inconnu"


def parse_product_text(text: str, gtin: str, source_file: str):
    """
    Analyse OCR du texte (générique pour TOUT produit / TOUTE image) :
    - Nettoyage
    - Détection éventuelle du GTIN dans le texte OCR
    - Extraction des ingrédients, origine, labels
    - Emballage = tout le texte brut OCR
    """
    text_norm = normalize_text(text)

    # DEBUG → Regarder ce que Tesseract a réellement détecté (console)
    print("\n===== OCR DEBUG =====")
    print(text_norm)
    print("=====================\n")

    # 1) GTIN automatique si non fourni
    auto_gtin = detect_gtin(text_norm)
    if not gtin:
        gtin = auto_gtin or ""

    # 2) Nom du produit = heuristique sur la première ligne "propre"
    nom = guess_product_name(text_norm)

    # 3) Ingrédients (bloc dédié si possible)
    ingredients = extract_block(
        "INGRÉDIENTS|INGREDIENTS|Contains|Contient|المكونات",
        text_norm
    )

    # 3.bis) Fallback : essayer de deviner par les lignes avec virgules
    if not ingredients:
        ingredients = guess_ingredients_by_commas(text_norm)

    # 3.ter) Dernier fallback : si tout le texte ressemble à une liste d'ingrédients
    if not ingredients and looks_like_ingredients_only(text_norm):
        ingredients = text_norm

    # 4) Origine
    origine = extract_after(
        "Origine du lait|Origine|Made in|Product of|Produced for|Manufactured in",
        text_norm,
    )

    # 5) Labels simples (bio, vegan, fairtrade, etc.)
    labels = []
    lower = text_norm.lower()
    if "bio " in lower or "organic" in lower:
        labels.append("bio")
    if "vegan" in lower:
        labels.append("vegan")
    if "fairtrade" in lower:
        labels.append("fairtrade")

    labels_raw = ", ".join(labels)

    # 6) Emballage = TOUT le texte OCR (on ne perd aucune info)
    packaging_raw = text_norm

    # 7) Valeurs par défaut pour les champs non encore calculés
    marque = "Non renseigné"
    categorie = "Non renseigné"
    poids_net_g = 0

    return {
        "gtin": gtin,
        "nom": nom,
        "marque": marque,
        "categorie": categorie,
        "poids_net_g": poids_net_g,
        "ingredients_raw": ingredients,
        "packaging_raw": packaging_raw,
        "origine_raw": origine,
        "labels_raw": labels_raw,
        "source_file": source_file,
    }
