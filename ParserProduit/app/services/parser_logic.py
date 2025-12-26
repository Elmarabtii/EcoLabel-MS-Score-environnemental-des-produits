# app/services/parser_logic.py
import re
import unicodedata


def normalize_text(text: str) -> str:
    """
    Nettoyage simple :
    - normalisation Unicode (corrige certains caractères PDF/OCR)
    - remplace les ligatures (ﬁ -> fi, ﬂ -> fl, etc.)
    - remplacer \\r par \\n
    - supprimer les lignes vides
    - trim des espaces
    """
    if not text:
        return ""

    # Normalisation unicode
    text = unicodedata.normalize("NFKC", text)

    # Ligatures fréquentes dans les PDF
    text = (
        text.replace("ﬁ", "fi")
            .replace("ﬂ", "fl")
            .replace("\r", "\n")
    )

    # Nettoyage lignes
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return "\n".join(lines)


def extract_kv(text: str, key: str) -> str:
    """
    Extrait une valeur sur une ligne type:
      Nom: ...
      Marque: ...
      Catégorie: ...
      GTIN: ...
    """
    m = re.search(rf"(?mi)^{re.escape(key)}\s*:\s*(.+)$", text)
    return m.group(1).strip() if m else ""


def extract_after(labels_pattern: str, text: str) -> str:
    """
    Extrait ce qui vient après un libellé de type :
      Origine : ...
      Made in : ...
    """
    pattern = rf"({labels_pattern})\s*[:\-]\s*(.+)"
    m = re.search(pattern, text, flags=re.IGNORECASE)
    return m.group(2).strip() if m else ""


def extract_block(label_keywords: str, text: str) -> str:
    """
    Extrait un bloc après un titre, capture jusqu'à un autre "titre" (ligne qui ressemble à une section)
    ou la fin du texte.
    """
    pattern = rf"({label_keywords})\s*[:\-]?\s*(.+?)(?=\n[A-Z][A-Z0-9 \-/]{{3,}}\n|\Z)"
    m = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(2).strip()
    return ""


def detect_gtin(text: str) -> str:
    """
    Trouve un GTIN/EAN (8 à 14 chiffres) dans le texte.
    """
    m = re.search(r"\b(\d{8,14})\b", text)
    return m.group(1) if m else ""


def looks_like_ingredients_only(text: str) -> bool:
    """
    Heuristique : beaucoup de virgules / points-virgules
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
    Devine un bloc d'ingrédients à partir des lignes contenant des virgules/points-virgules.
    Retourne le plus long bloc contigu.
    """
    lines = text.split("\n")
    candidate_blocks = []
    current_block = []

    for line in lines:
        l = line.strip()
        if ("," in l or ";" in l) and len(l.split()) >= 3:
            current_block.append(l)
        else:
            if current_block:
                candidate_blocks.append(" ".join(current_block))
                current_block = []

    if current_block:
        candidate_blocks.append(" ".join(current_block))

    if not candidate_blocks:
        return ""

    return max(candidate_blocks, key=len)


def guess_product_name(text_norm: str) -> str:
    """
    Devine un 'nom de produit' :
    - première ligne qui contient au moins 3 lettres,
    - sinon première ligne.
    """
    lines = text_norm.split("\n")
    for line in lines:
        if len(re.findall(r"[A-Za-zÀ-ÿ]", line)) >= 3:
            return line.strip()
    return lines[0].strip() if lines else "Produit inconnu"


def parse_product_text(text: str, gtin: str, source_file: str):
    """
    Analyse OCR du texte :
    - Nettoyage
    - Extraction de champs structurés (Nom/Marque/Catégorie/Poids net/Origine/etc.)
    - Extraction d'ingrédients sans débordement vers Emballage/Origine/Destination/Transport/Labels
    """
    text_norm = normalize_text(text)

    # DEBUG → Regarder ce que l'extracteur a détecté (console)
    print("\n===== OCR DEBUG =====")
    print(text_norm)
    print("=====================\n")

    # 1) GTIN automatique si non fourni
    auto_gtin = detect_gtin(text_norm)
    if not gtin:
        gtin = auto_gtin or ""

    # 2) Extraction "clé: valeur" (format PDF clean)
    nom = extract_kv(text_norm, "Nom") or guess_product_name(text_norm)
    marque = extract_kv(text_norm, "Marque") or "Non renseigné"
    categorie = extract_kv(text_norm, "Catégorie") or "Non renseigné"

    # 3) Poids net -> grammes
    poids_net_g = 0
    m = re.search(r"(?mi)^Poids\s*net\s*:\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b", text_norm)
    if m:
        val = float(m.group(1).replace(",", "."))
        unit = m.group(2).lower()
        if unit == "kg":
            poids_net_g = int(val * 1000)
        elif unit in ("g", "ml"):
            poids_net_g = int(val)
        elif unit == "l":
            poids_net_g = int(val * 1000)  # approximation

    # 4) Ingrédients : gérer "Ingredients (INCI): ..."
    ingredients = ""
    m = re.search(
        r"(?is)Ingredients\s*\(INCI\)\s*:\s*(.*?)(?:\n(Emballage|Origine|Destination|Transport|Labels)\s*:|$)",
        text_norm
    )
    if m:
        ingredients = m.group(1).strip()

    # Fallback bloc (autres formats)
    if not ingredients:
        ingredients = extract_block(
            r"INGRÉDIENTS|INGREDIENTS|Contains|Contient|المكونات",
            text_norm
        )

    # Couper si déborde
    if ingredients:
        ingredients = re.split(r"(?mi)\n(Emballage|Origine|Destination|Transport|Labels)\s*:", ingredients)[0].strip()

    # Fallback virgules
    if not ingredients:
        ingredients = guess_ingredients_by_commas(text_norm)

    # Dernier fallback : si tout ressemble à une liste d'ingrédients
    if not ingredients and looks_like_ingredients_only(text_norm):
        ingredients = text_norm

    # 5) Origine / Destination / Transport / Emballage
    origine = extract_kv(text_norm, "Origine") or extract_after(
        "Origine du lait|Origine|Made in|Product of|Produced for|Manufactured in",
        text_norm,
    )
    destination = extract_kv(text_norm, "Destination")
    transport = extract_kv(text_norm, "Transport")
    emballage = extract_kv(text_norm, "Emballage")

    # 6) Labels
    labels_found = []
    lower = text_norm.lower()
    if "bio" in lower or "organic" in lower:
        labels_found.append("bio")
    if "vegan" in lower:
        labels_found.append("vegan")
    if "fairtrade" in lower:
        labels_found.append("fairtrade")
    if "recycl" in lower:
        labels_found.append("recyclable")

    labels_raw = ", ".join(sorted(set(labels_found)))

    # 7) packaging_raw :
    # On conserve Emballage + Destination + Transport dans un seul champ
    # (sans changer la DB) pour que LCA puisse lire la distance & le mode.
    parts = []
    if emballage:
        parts.append(f"Emballage: {emballage}")
    if destination:
        parts.append(f"Destination: {destination}")
    if transport:
        parts.append(f"Transport: {transport}")

    packaging_raw = "\n".join(parts).strip() if parts else text_norm


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

