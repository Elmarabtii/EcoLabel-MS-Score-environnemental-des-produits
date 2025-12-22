# app/schemas.py
from pydantic import BaseModel

class ProduitRawOut(BaseModel):
    gtin: str
    nom: str
    marque: str
    categorie: str
    poids_net_g: int
    ingredients_raw: str
    packaging_raw: str
    origine_raw: str
    labels_raw: str
    source_file: str

    class Config:
        orm_mode = True
