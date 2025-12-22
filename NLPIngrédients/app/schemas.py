from pydantic import BaseModel
from typing import List, Optional

class RawTextRequest(BaseModel):
    text: str
    language: Optional[str] = "fr"
    product_id: Optional[str] = None

class NormalizedEntity(BaseModel):
    raw: str               # texte trouvé dans le produit
    normalized: str        # nom standard (ex : "Huile de palme")
    category: str          # "ingredient", "packaging", "label", "origin"
    eco_ref_code: Optional[str] = None  # lien vers EcoInvent / référence interne
    confidence: float = 1.0

class NLPResponse(BaseModel):
    product_id: Optional[str]
    ingredients: List[NormalizedEntity]
    packaging: List[NormalizedEntity]
    labels: List[NormalizedEntity]
    origins: List[NormalizedEntity]
