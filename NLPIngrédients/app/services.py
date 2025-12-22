from sqlalchemy.orm import Session
from typing import List
from .models import IngredientTaxonomy, PackagingTaxonomy, LabelTaxonomy, OriginTaxonomy
from .schemas import NormalizedEntity

def _match_entity(db: Session, table, raw: str, category: str) -> NormalizedEntity:
    # simple match : exact + ILIKE + recherche dans synonyms
    raw_clean = raw.strip()

    # 1) essai sur name exact
    obj = db.query(table).filter(table.name.ilike(raw_clean)).first()

    if not obj:
        # 2) essai sur synonyms (simple split par ';')
        all_objs = db.query(table).all()
        for o in all_objs:
            if o.synonyms:
                syns = [s.strip().lower() for s in o.synonyms.split(";")]
                if raw_clean.lower() in syns:
                    obj = o
                    break

    if obj:
        return NormalizedEntity(
            raw=raw_clean,
            normalized=obj.name,
            category=category,
            eco_ref_code=getattr(obj, "eco_ref_code", None),
            confidence=0.9
        )
    else:
        # pas trouvé dans la taxonomie → on renvoie tel quel, avec faible confiance
        return NormalizedEntity(
            raw=raw_clean,
            normalized=raw_clean,
            category=category,
            eco_ref_code=None,
            confidence=0.4
        )

def normalize_ingredients(db: Session, ingredients_raw: List[str]) -> List[NormalizedEntity]:
    return [_match_entity(db, IngredientTaxonomy, ing, "ingredient") for ing in ingredients_raw]

def normalize_packaging(db: Session, packaging_raw: List[str]) -> List[NormalizedEntity]:
    return [_match_entity(db, PackagingTaxonomy, p, "packaging") for p in packaging_raw]

def normalize_labels(db: Session, labels_raw: List[str]) -> List[NormalizedEntity]:
    return [_match_entity(db, LabelTaxonomy, l, "label") for l in labels_raw]

def normalize_origins(db: Session, origins_raw: List[str]) -> List[NormalizedEntity]:
    return [_match_entity(db, OriginTaxonomy, o, "origin") for o in origins_raw]
